'use strict';

var EditorPrototype = window.EditorPrototype || {};

EditorPrototype.htmlEncode = function( input ) {
    return String(input).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, "'").replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


EditorPrototype.removeParentElement = function(nodeToBeRemoved) {
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
}
