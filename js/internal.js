'use strict';

var EditorPrototype = window.EditorPrototype || {};
var joinx = 0;


//------------------------
//-----l------------------
//------------------------
EditorPrototype.l = function (title) {
    var old;

    if (!this.config.debug)
        return false;

    if (title) {
        console.log("=============="+title+"================");
        console.log("===================================");
    } else
        console.log("l------------------");

    old = document.getElementsByTagName('article')[0].innerHTML;
    document.getElementsByTagName('article')[0].innerHTML = '<p>'+this.htmlEncode(this.el.innerHTML)+'</p>'+old;
}

//------------------------
//-----Is Restricted-----
//------------------------
EditorPrototype.isRestricted = function(node, action) {
    var current = node;

    //this is for test purposes.
    if (current && action.restricted){
        while (current.tagName != "MAIN") {
            if (action.restricted.indexOf(current.tagName) != -1)
                return true;
            current = current.parentElement;
        }
    }
    return false;
}

//------------------------
//-----Reset Controls-----
//------------------------
EditorPrototype.resetControls = function() {
    this.l("Reset Controls");
    var range = this.selection.getRangeAt(0),
        elements = null,
        currentSelection = buildSelection(range),
        i = 0,
        x = 0,
        valueAction = null,
        valueActions = [],
        current,
        part = null,
        defaultValueActions;
    joinx = 0;

    console.log(currentSelection);

    //Look through each select element and build a list of actions we need to determine.
    elements = this.controlsEl.getElementsByTagName('SELECT');
    for (i=0; i<elements.length; i++) {
        if (elements[i].dataset['action'] && this.actions[elements[i].dataset['action']]) {
            valueAction = this.actions[elements[i].dataset['action']];
            valueAction.element = elements[i];
            valueAction.value = null;
            valueActions.push(valueAction);
        }
    }

    //Go through each piece of selection and have it determine its valueActions before joining them to the master set.
    defaultValueActions = JSON.parse(JSON.stringify(valueActions));
    for (i=0; i<currentSelection.length; i++) {
        current = currentSelection[i];
        //Make sure this node is legit
        if (!current.startOffset && !current.endOffset && current.node.nodeType == 3)
            continue;
        if (current.startOffset || current.endOffset && current.node.length > current.endOffset)
            part = true;
        else
            part = false;
        this.joinValues(valueActions, this.determineValues(current.node, JSON.parse(JSON.stringify(defaultValueActions)), part));
    }

    console.log(valueActions);
    //Set controls based on values.
    for (i=0; i < valueActions.length; i++) {
        valueAction = valueActions[i];
        if (valueAction.value==null)
            valueAction.value="";
        for(x = 0; x < valueAction.element.options.length; ++x) {
            if(valueAction.element.options[x].value === valueAction.value) {
                valueAction.element.selectedIndex = x;
                break;
            }
        }
    }
}

//-------------------------
//-----Join Values---------
//-------------------------
//valueActionsOne and valueActionsTwo are passed by reference
EditorPrototype.joinValues = function(valueActionsOne, valueActionsTwo) {
    //console.log("### Join Values ###");
    //console.log(joinx++);
    var i = 0;
    for (i =0; i< valueActionsOne.length; i++) {
        if (valueActionsOne[i].value == null && valueActionsTwo[i].value!=null)
            valueActionsOne[i].value = valueActionsTwo[i].value;
        if (valueActionsOne[i].value != valueActionsTwo[i].value)
            valueActionsOne[i].value = "";
    }
}

//-------------------------
//-----Determine Values----
//-------------------------
//valueActions is currently passed by reference as a clone in the function call, still needs to be returned
EditorPrototype.determineValues = function(node, valueActions, part) {
    console.log("Determing")
    console.log(node);
    var children,
        i = 0,
        newValueActions,
        join = false;

    if (node.nodeType == 1) {
        for (i=0; i<valueActions.length; i++) {
            if (valueActions[i].attribute && node.style[valueActions[i].attribute])
                valueActions[i].value = node.style[valueActions[i].attribute];
        }
    }

    if (part) {
        console.log("Entering Part");
        while (this.blockElements.indexOf(node.tagName) == -1) {
            newValueActions = JSON.parse(JSON.stringify(valueActions));
            node = node.parentElement;
            join = false;
            for (i=0; i<newValueActions.length; i++) {
                if (newValueActions[i].attribute && node.style[newValueActions[i].attribute]) {
                    join = true;
                    newValueActions[i].value = node.style[newValueActions[i].attribute];
                }
            }

            if (join)
                this.joinValues(valueActions, newValueActions);
        }
        for (i=0; i<valueActions.length; i++) {
            if (valueActions[i].value == null)
                valueActions[i].value= "";
        }
    }
    return valueActions;
}

//-------------------------
//-----Appy----------------
//-------------------------
EditorPrototype.apply = function(node, action) {
    var oldValue, nextNode, i;

    //Does this action match with tag type
    //Currently just checks for MAIN, but will eventually be more inclusive
    if (node.tagName == 'MAIN') {
        for (i = 0; i< node.childElementCount; i++) {
            this.apply(node.children[i], action);
        }
        return;
    }

    //Clear out old and remember oldValue
    if (action.input) {
        oldValue = node.style[action.attribute];
        node.style[action.attribute] =  action.value;
    } else {
        oldValue = action['class'];
        node.classList.toggle(action['class'], true);
    }

    for (i= node.children.length -1 ;i>=0; i--) {
        this.removeProperty(node.children[i], action, true);
    }


    this.l();
    return oldValue;

}

//------------------------
//-----Has Property---------
//------------------------
EditorPrototype.hasProperty = function(current, action, children) {
    if (action.input) {
        if (current.style[action.attribute])
            return current.style[action.attribute];
    } else {
        if (current.classList.contains(action.class))
            return true;
        if (children && current.getElementsByClassName(action.class).length)
            return true;
    }
    return false;
}

//------------------------
//-----Remove Property---------
//------------------------
EditorPrototype.removeProperty = function(current, action, recursive) {
    var i, next;
    if (action.input) {
        if (current.style[action.attribute])
            current.style[action.attribute] = "";
    } else {
        current.classList.toggle(action.class, false);
    }

    //Repeat for children
    if (recursive) {
        for (i = current.children.length-1; i>=0; i--) {
            this.removeProperty(current.children[i], action, true);
        }
    }

    this.tryToRemove(current);

    return true;
}

//------------------------
//-----Try to Combine---------
//------------------------
EditorPrototype.tryToCombine = function(element) {
    var sibling = true,
        parent,
        i;

    console.log(element);
    if (this.inlineElements.indexOf(element.tagName)==-1)
        return true;

    //Go Backwards
    while (true) {
        if (!element.previousElementSibling)
            break;

        sibling = element;
        element = element.previousElementSibling;

        if (element.tagName != sibling.tagName
            || element.className != sibling.className
            || element.style.cssText != sibling.style.cssText
           )
            break;

        while (sibling.firstChild) {
            element.appendChild(sibling.firstChild);
        }
        sibling.parentElement.removeChild(sibling);
    }

    //Go Forwards
    while (true) {
        if (!element.nextElementSibling)
            break;

       sibling = element.nextElementSibling;

        if (element.tagName != sibling.tagName
            || element.className != sibling.className
            || element.style.cssText != sibling.style.cssText
           )
            break;

        while (sibling.firstChild) {
            element.appendChild(sibling.firstChild);
        }
        sibling.parentElement.removeChild(sibling);
    }

    parent = element.parentElement;
    //Check for ending BR
    if (parent.lastElementChild.tagName == "BR")
        parent.removeChild(parent.lastElementChild);

    //Go Upwards
    if (parent.childElementCount == 1) {
        while (element.firstChild) {
            parent.appendChild(element.firstChild);
        }
        for (i=0; i<element.style.length; i++) {
            parent.style[element.style[i]]=element.style[element.style[i]];
        }

        parent.cssName += element.cssName;


        //needs to somehow combine style information
        parent.removeChild(parent.firstChild);
        this.tryToCombine(parent);
    }

    return true;
}

//------------------------
//-----Try to Remove---------
//------------------------
EditorPrototype.tryToRemove = function(element) {
    if (element.className == ""
        && element.style.length == 0
        && this.inlineElements.indexOf(element.tagName) != -1
        && element.parentNode
       ){
        this.removeParentElement(element);
        return true;
    }
    return false;
}

//------------------------
//-----Perform------------
//------------------------
// perform saves and restores selection along with activating a negate sequence
// and then apply sequence
EditorPrototype.perform = function(action) {
    var current,
        userSelection,
        range = this.selection.getRangeAt(0),
        currentSelection = buildSelection(range),
        that = this,
        applyElements = [],
        unapplyElements = [];


    userSelection = saveSelection(this.el);

    //Split Selection
    currentSelection.forEach(function(current) {
        var startOffset = current.startOffset,
            endOffset   = current.endOffset,
            node        = current.node,
            next,
            previous,
            parent,
            action2,
            value = false,
            nextParent;

        if (node.tagName != "MAIN") {
            parent = node.parentElement;
            while (parent.tagName != "MAIN" && !value) {
                nextParent = parent.parentElement;

                value = that.hasProperty(parent, action, false);
                if (value) {
                    unapplyElements.push(parent);
                    action2 = JSON.parse(JSON.stringify(action));
                    action2.value = value;
                }

                parent = nextParent;
            }
        }
        if (node.nodeType ==1) {
            applyElements.push(node);
        }
        else if (node.nodeType ==3 && node.nodeValue.trim())  {
            //The end needs to be trimmed first so that the offsets aren't messed up
            if (endOffset && node.length > endOffset){
                node.splitText(endOffset);
                next = that.createParentElement(node.nextSibling, 'SPAN');
                if (action2)
                    that.apply(next, action2);
            }
            if (startOffset) {
                node = node.splitText(startOffset);
                previous = that.createParentElement(node.previousSibling, 'SPAN');
                if (action2)
                    that.apply(previous, action2);
            }
            node =  that.createParentElement(node, 'SPAN');
            applyElements.push(node);
        }
    });


    applyElements.forEach(function(current) {
        that.apply(current,action);
        that.tryToCombine(current);
        current.normalize();
    });

    unapplyElements.forEach(function(current) {
        that.removeProperty(current, action, false);
    });
    this.l();

    restoreSelection(this.el, userSelection);
}
