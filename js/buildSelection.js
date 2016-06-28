function buildSelection(range) {
    var currentSelection = [],
        startSelection = [],
        endSelection = [],
        startParent,
        endParent;


    //Are we dealing within a single node?
    if (range.startContainer == range.endContainer) {
        //Are we dealing with a whole element?
        if (range.startOffset == 0 && range.endOffset == range.endContainer.length) {
            currentSelection.push({
                node:range.startContainer.parentElement,
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
        startSelection.push({
            node: current,
            startOffset: range.startOffset
        });
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
