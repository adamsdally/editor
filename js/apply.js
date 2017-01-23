'use strict';

var EditorPrototype = window.EditorPrototype || {};
//-------------------------
//-----Appy----------------
//-------------------------
EditorPrototype.apply = function(node, action, removeFromChildren) {
    var nextNode, i;

    if (node.nodeType == 3) {
        if (node.nodeValue.trim())
            node = this.createParentElement(node, 'SPAN');
        else
            return node;
    }

    //Needs to match tag type here
    //??????????

    if (action.element) {
        console.log(action.element);
        //Are we in a block element and element is inline
        if (this.blockElements.indexOf(node.tagName)!=-1) {
            if (this.inlineElements.indexOf(action.element)!=-1)
                node = this.createChildElement(node, action.element);
            else
                console.log("not doing this yet");
        } else {
            console.log("not yet doing this all the way");
            node = this.createParentElement(node, action.element);
        }
    }

    if (action.input)
        node.style[action.attribute] =  action.value;

    if (action.class)
        node.classList.toggle(action['class'], true);

    if (removeFromChildren) {
        for (i= node.children.length -1 ;i>=0; i--) {
            this.removeProperty(node.children[i], action, true);
        }
    }

    if (this.tryToRemove(node))
        node = false;

    return node;

}
