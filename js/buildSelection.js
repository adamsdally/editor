function buildSelection(range) {
    console.log("..........Range.......");
    console.log(range);
    var currentSelection = [],
        startSelection = [],
        endSelection = [],
        startParent,
        endParent,
        current,
        parent,
        startContainer,
        endContainer;

    //All ranges should preferrably end up in text nodes

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
        else
            previous = range.endContainer.parentElement.previousSibling;
        while (previous.lastChild) {
            previous = previous.lastChild;
        }
        range.setEnd(previous, previous.length);
    }

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


    //Determine start and end parents
    startParent = startContainer;
    endParent = endContainer;
    while (startParent.parentElement != range.commonAncestorContainer)
        startParent = startParent.parentElement;
    while (endParent.parentElement != range.commonAncestorContainer)
        endParent = endParent.parentElement;

    //Build start alternating right then up until startParent is reached
    //Only add those that are not direct ancestors
    current = startContainer;
    parent = current.parentElement;
    if (range.startOffset){
        if (current.length > range.startOffset) {
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

    //Empty start and end selections without neighbors indicate the full ancestor is in use
    if (startSelection.length == 0 && endSelection.length == 0 && !startParent.previousElementSibling && !endParent.nextElementSibling) {
        currentSelection.push({
            node: range.commonAncestorContainer
        });
        return currentSelection
    }

    //otherwise add the start and end parents to selections
    /*if (startSelection.length == 0) {
        startSelection.push({
            node: startParent
        });
    }
    if (endSelection.length == 0) {
        endSelection.push({
            node: endParent
        });
    }*/

    //build selection between start and end parents
    /*current = startParent;
    while (current.nextSibling != endParent) {
        current = current.nextSibling;
        currentSelection.push({
            node: current
        });
    }*/

    return currentSelection.concat(startSelection,endSelection);
}
