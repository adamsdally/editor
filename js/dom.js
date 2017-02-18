'use strict';

var doGetCaretPosition, setSelection;
var EditorPrototype = window.EditorPrototype || {};

EditorPrototype.htmlEncode = function( input ) {
    return String(input).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, "'").replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


EditorPrototype.removeParentElement = function(nodeToBeRemoved) {
    //Make sure element hasn't already been removed
    if (!nodeToBeRemoved.parentElement)
        return true;

    while (nodeToBeRemoved.firstChild) {
        nodeToBeRemoved.parentNode.insertBefore(nodeToBeRemoved.firstChild, nodeToBeRemoved);
    }
    nodeToBeRemoved.parentNode.removeChild(nodeToBeRemoved);
    return true;
}

EditorPrototype.createParentElement = function(node, tagName) {
    var element = document.createElement(tagName);
    node.parentElement.insertBefore(element, node);
    element.appendChild(node);
    return element;
}

EditorPrototype.createChildElement = function(node, tagName) {
    var element = document.createElement(tagName);
    element.innerHTML = node.innerHTML;
    node.innerHTML = "";
    node.appendChild(element);
    return element;
}

EditorPrototype.insert = function(node) {
    //Get current range and collapse it to the end
    var range = this.selection.getRangeAt(0);
    range.collapse(false);

    //Switch based on the node type we're trying to insert
    console.log(range);
    var type = this.checkType(node);
    var current = range.endContainer;
    if (type == 'block') {
        while (this.checkType(current)!=type ) {
            current = current.parentElement;
        }
        current.parentElement.insertBefore(node,current.nextElementSibling);
        return;
    }

    if (node.nodeType == '3') {
        range.insertNode(node);
    }
}

EditorPrototype.Element = function(el) {
    return {
        el: el,
        setSelection: function(start, end) {
            restoreSelection(el, {
                start: start,
                end: end
            });
        }
    }
}

doGetCaretPosition = function(el) {
    var CaretPos = 0;

    if (el.selectionStart || el.selectionStart == 0) {
        // Standard.
        CaretPos = el.selectionStart;
    } else if (document.selection) {
        // Legacy IE
        el.focus();
        var Sel = document.selection.createRange ();
        Sel.moveStart ('character', -el.value.length);
        CaretPos = Sel.text.length;
    }

    return (CaretPos);
}

setSelection = function(el,start, end) {
    if (get.setSelectionRange) {
        get.focus();
        get.setSelectionRange(start,end);
    } else if (get.createTextRange) {
        var range = get.createTextRange();
        range.collapse(true);
        range.moveEnd('character', start);
        range.moveStart('character', end);
        range.select();
    }
}

//Returns the next element at bottom of tree
EditorPrototype.nextNode = function(el) {
    console.log(el);
    while (!el.nextSibling && el.tagName!='MAIN') {
        el = el.parentElement;
        console.log(el);
        console.log(el.nextSibling);
    }
    if (el.nextSibling)
        el = el.nextSibling;
    else
        return false;
    while (el.childNodes.length) {
        console.log(el);
        el = el.childNodes[0];
        console.log(el);
    }
    console.log(el);
    return el;
}

//Returns the previous element at bottom of tree
EditorPrototype.previousNode = function(el) {
    while (!el.previousSibling && el.tagName!='MAIN') {
        el = el.parentElement;
    }
    if (el.previousSibling)
        el = el.previousSibling;
    else
        return false;
    while (el.childNodes.length) {
        el = el.childNodes[el.childNodes.length-1];
    }
    return el;
}

EditorPrototype.parentType = function(el, type) {
    switch (type) {
        case 'group':
            while(this.groupElements.indexOf(el.tagName) == -1) {
                el = el.parentElement;
                if (el.tagName == "MAIN")
                    return false;
            }
            return el;
            break;
    }
    return false;
}
/*

div p-p p-text-!-text-p div
go to top
remember current though that is not quite top
[div div] div p-p p-text-!-text-p div
everything to the left of current needs moved
[div p-p div] div p-text-!-text-p div

*/


EditorPrototype.splitElement = function(el, lastNode) {
    var current,
        clone,
        prev = el.cloneNode(),
        insertPoint = prev,
        top = el;

    //Loop until the explore point (top) is the same as the lastNode
    while (lastNode.parentElement != top) {

        //Explore from the lastNode up to the top with current.
        current = lastNode;
        while (current.parentElement != top) {
            current = current.parentElement;
        }

        //Top is the new current
        top = current;

        //Everything to the left of the current needs inserted at the insert point
        while (current.previousSibling) {
            insertPoint.insertBefore(current.previousSibling, insertPoint.childNodes[0]);
        }

        //Clone current and insert at insertPoint, this is the new insertPoint
        clone = current.cloneNode();
        insertPoint.appendChild(clone);
        insertPoint = clone;
    }

    //insert the lastNode;
    insertPoint.appendChild(lastNode);

    //Insert the entire thing before el
    el.parentElement.insertBefore(prev, el);
}
