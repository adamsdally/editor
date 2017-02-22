'use strict';

var EditorPrototype = window.EditorPrototype || {};
//-------------------------
//-----Appy----------------
//-------------------------
EditorPrototype.apply = function(node, action, removeFromChildren) {
    var nextNode, i, type;
    console.log(action);
    if (node.nodeType == 3) {
        if (node.nodeValue.trim())
            node = this.createParentElement(node, 'SPAN');
        else
            return node;
    }
    //If the action has an element travel up or down chain until
    //the correct level is reached to apply action to
    if (action.element) {
        console.log("Element");
        console.log(action.element);
        type = this.checkType(node);
        switch (this.checkType(action.element)) {
            case 'group':
                if (type == 'top')
                    node = this.createChildElement(node, action.element);
                else
                    node = this.createParentElement(node, action.element);
                break;
            case 'block':
                console.log("block;");
                //node = this.createParentElement(node, action.element);
                break;
            case 'inline':
                console.log("inline");
                if (type == 'block' || type=='inline') {
                    node = this.createChildElement(node, action.element);
                }
                break;
        }
    }
    console.log(node.outerHTML);

    if (action.input || action.binary) {
        if (action.value)
            node.style[action.attribute] =  action.value;
        else
            node.style[action.attribute] = "";

    }

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
