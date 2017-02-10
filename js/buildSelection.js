'use strict';
var EditorPrototype = window.EditorPrototype || {};

EditorPrototype.buildSelection = function() {
    var currentSelection = [],
        startSelection = [],
        endSelection = [],
        startParent,
        endParent,
        current,
        parent,
        next,
        previous,
        startContainer,
        endContainer;
    var range = this.selection.getRangeAt(0);


    //If we're dealing with an empty element.
    if (!range.startContainer.textContent) {
        /*currentSelection.push({
            node:range.startContainer
        });*/
        return currentSelection;
    }

    //First check for single element with single cursor position
     if (range.startContainer == range.endContainer && range.startOffset == range.endOffset) {
            currentSelection.push({
                node:range.startContainer,
                startOffset: range.startOffset,
                endOffset: range.endOffset
            });
        return currentSelection;
    }

    //If we're at end of startContainer then fix:
    if (range.startContainer.length == range.startOffset) {
        if (range.startContainer.nextSibling)
           next= range.startContainer.nextSibling;
        else if (range.startContainer.parentElement.nextSibling)
            next = range.startContainer.parentElement.nextSibling;
        else
            next = false;
        if (next) {
            while (next.firstChild)
                next = next.firstChild;
            range.setStart(next, 0);
        }
    }

    //If we're at the start of the endContainer then fix:
    if (range.endOffset == 0) {
        if (range.endContainer.previousSibling)
            previous = range.endContainer.previousSibling;
        else if (range.endContainer.parentElement.previousSibling)
            previous = range.endContainer.parentElement.previousSibling;
        else
            previous = false;
        if (previous) {
            while (previous.lastChild) {
                previous = previous.lastChild;
            }
            range.setEnd(previous, previous.length);
        }
        console.log("going backwards");
    }

    //After fixing start and end conditions on range
    //copy containers to local variables to play with
    startContainer = range.startContainer;
    endContainer = range.endContainer;

    if (startContainer != endContainer) {
        //If we're at the start of the startContainer and there is nothing previous
        if (range.startOffset == 0) {
            while (!startContainer.previousElementSibling
                   && startContainer.parentElement != range.commonAncestorContainer
                  ){
                startContainer = startContainer.parentElement;
            }
        }

        //If we're at the end of the endContainer and there is nothing next
        if (range.endOffset == endContainer.length) {
            while (!endContainer.nextElementSibling
                   && endContainer.parentElement != range.commonAncestorContainer
                  ){
                endContainer = endContainer.parentElement;
                if (endContainer.nextElementSibling && endContainer.nextElementSibling.tagName == 'BR')
                    endContainer = endContainer.nextElementSibling;
            }
        }
    }

    //Are we dealing within a single node?
    if (startContainer == endContainer) {
        if (range.startOffset == 0 && range.endOffset == range.endContainer.length) {
            while (startContainer.parentElement.childNodes.length == 1
                   && startContainer.parentElement != range.commonAncestorContainer) {
                startContainer = startContainer.parentElement;
            }
            currentSelection.push({
                node:startContainer
            });
        } else {
            currentSelection.push({
                node:startContainer,
                startOffset: range.startOffset,
                endOffset: range.endOffset
            });
        }
        return currentSelection;
    }

    //Are we dealing with just ancestral node?
    if (startContainer.parentElement == endContainer.parentElement) {
        if (range.startOffset == 0 && range.endOffset == range.endContainer.length) {
            currentSelection.push({
                node:startContainer.parentElement
            });
            return currentSelection;
        }
    }

    //Determine start and end parents
    startParent = startContainer;
    endParent = endContainer;
    if (startParent != range.commonAncestorContainer)
        while (startParent.parentElement != range.commonAncestorContainer)
            startParent = startParent.parentElement;
    if (endParent != range.commonAncestorContainer)
        while (endParent.parentElement != range.commonAncestorContainer)
            endParent = endParent.parentElement;

    //Build start alternating right then up until startParent is reached
    //Only add those that are not direct ancestors
    current = startContainer;
    parent = current.parentElement;

    if (range.startOffset){
        if (current.length > range.startOffset  && current.nodeValue.trim()) {
            startSelection.push({
                node: current,
                startOffset: range.startOffset
            });
        }
        if (current.nextSibling)
            current= current.nextSibling;
        else
            current = false;
    }
    while (current != endParent) {
        if (current) {
            if (current.nodeType != 3 || current.nodeValue.trim())
                startSelection.push({
                    node: current
                });
            if (current.nextSibling)
                current = current.nextSibling;
            else
                current = false;
        } else {
            if (parent.nextSibling) {
                current = parent.nextSibling;
            }
            parent = parent.parentElement;
        }
    }

    //Build end alternating left then up until endParent reached
    //Only add those that are not direct ancestors
    current = endContainer;
    parent = current.parentElement;
    if (range.endOffset && range.endOffset!=range.endContainer.length){
        if (current.nodeType != 3 ||  current.nodeValue.trim())
            endSelection.push({
                node: current,
                endOffset: range.endOffset
            });
        if (current.previousSibling)
            current= current.previousSibling;
        else
            current = false;
    }
    while (current != startParent) {
        if (current) {
            if (current.nodeType != 3 || current.nodeValue.trim())
                startSelection.push({
                    node: current
                });
            if (current.previousSibling)
                current = current.previousSibling;
            else
                current = false;
        } else {
            if (parent.previousSibling) {
                current = parent.previousSibling;
            }
            parent = parent.parentElement;
        }
    }

    return currentSelection.concat(startSelection,endSelection);
}
