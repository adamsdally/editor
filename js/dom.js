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
