'use strict';

var EditorPrototype = window.EditorPrototype || {};

EditorPrototype.htmlEncode = function( input ) {
    return String(input).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, "'").replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

EditorPrototype.joinAdjacentElements = function() {
    var previous = element.previousSibling;
    var next = element.nextSibling;
    var parent = element.parentElement;
    var movingInside;
    var movingOutside;

    if (previous && previous.nodeType==1 && previous.tagName == element.tagName && previous.className == element.className && previous.style == element.style) {
        previous.innerHTML += element.innerHTML;
        parent.removeChild(element);
        element = previous;
    }
    if (next && next.nodeType==1 && next.tagName == element.tagName && next.className == element.className && next.style == element.style) {
        element.innerHTML += next.innerHTML;
        parent.removeChild(next);
    }

    //if we are the only element in parent
    if (parent.children.length == 1) {

        //Not the best strategy, should move upward to common ancestor

        //If the parent is inline then move outward and call recursively
        if (inlineElements.indexOf(parent.tagName) >= 0) {

            //clone parent and append element
            movingInside = parent.cloneNode();
            movingOutside = element.cloneNode();
            movingInside.innerHTML = element.innerHTML;
            movingOutside.appendChild(movingInside);

            //append to parent parent
            parent.parentElement.appendChild(movingOutside);

            //delete parent and element
            parent.removeChild(element);
            parent.parentElement.removeChild(parent);

            joinAdjacentElements(movingOutside);

        }
    }
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
