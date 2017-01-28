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
