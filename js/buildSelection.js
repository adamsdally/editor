function buildSelection(range) {
    console.log("..........Range.......");
    console.log(range);
    var currentSelection = [],
        startSelection = [],
        endSelection = [],
        startParent,
        endParent;

    //All ranges should preferrably end up in text nodes

    //If we're at end of startContainer then fix:
    if (range.startContainer.length == range.startOffset) {
        console.log("...at end of start");
        if (range.startContainer.nextSibling)
           next= range.startContainer.nextSibling;
        else
            next = range.startContainer.parentElement.nextSibling;
        while (next.firstChild) {
            next = next.firstChild;
        }
        console.log(next);
        console.log(next.length);
        range.setStart(next, 0);
        console.log(range);
    }
    //If we're at the start of the endContainer then fix:
    if (range.endOffset == 0) {
        console.log("...at beginning of end");
        if (range.endContainer.previousSibling)
            previous = range.endContainer.previousSibling;
        else
            previous = range.endContainer.parentElement.previousSibling;
        while (previous.lastChild) {
            previous = previous.lastChild;
        }
        console.log(previous);
        console.log(previous.innerHTML);
        console.log(previous.length);
        range.setEnd(previous, previous.length);
        console.log(range);
    }


    //Are we dealing within a single node?
    if (range.startContainer == range.endContainer) {
        //Are we dealing with a whole node?
        if (range.startOffset == 0 && range.endOffset == range.endContainer.length) {
            //Does the parentElement have 1 child, self
            if (range.startContainer.parentElement.childNodes.length == 1)
                currentSelection.push({
                    node:range.startContainer.parentElement,
                });
            else
                currentSelection.push({
                    node:range.startContainer
                });
        } else {
            currentSelection.push({
                node:range.startContainer,
                startOffset: range.startOffset,
                endOffset: range.endOffset
            });
        }
        return currentSelection;
    }

    //Determine start and end parents
    startParent = range.startContainer;
    endParent = range.endContainer;
    while (startParent.parentElement != range.commonAncestorContainer)
        startParent = startParent.parentElement;
    while (endParent.parentElement != range.commonAncestorContainer)
        endParent = endParent.parentElement;

    //Build start alternating right then up until startParent is reached
    current = range.startContainer;
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
            current = current.parentElement;
    }
    while (current != startParent && current != endParent) {

        if (current.previousSibling && current.nextSibling) {
            startSelection.push({
                node: current
            });
            current = current.nextSibling;
        } else if (current.previousSibling && !current.nextSibling) {
            startSelection.push({
                node: current
            });
            current = current.parentElement;
        } else {
            current = current.parentElement;
        }
    }

    //Build end alternating left then up until endParent reached
    current = range.endContainer;
    if (range.endOffset && range.endOffset!=range.endContainer.length){
        endSelection.push({
            node: current,
            endOffset: range.endOffset
        });
        if (current.previousSibling)
            current= current.previousSibling;
        else
            current = current.parentElement;
    }
    while (current != endParent && current != startParent) {
        if (current.previousSibling && current.nextSibling) {
            endSelection.push({
                node: current
            });
            current = current.previousSibling;
        } else if (!current.previousSibling && current.nextSibling) {
            endSelection.push({
                node: current
            });
            current = current.parentElement;
        } else {
            current = current.parentElement;
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
    if (startSelection.length == 0) {
        startSelection.push({
            node: startParent
        });
    }
    if (endSelection.length == 0) {
        endSelection.push({
            node: endParent
        });
    }

    //build selection between start and end parents
    current = startParent;
    while (current.nextSibling != endParent) {
        current = current.nextSibling;
        currentSelection.push({
            node: current
        });
    }

    return currentSelection.concat(startSelection,endSelection);
}
