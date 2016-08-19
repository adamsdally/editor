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
    } else {
        console.log("l------------------");
    }

    old = document.getElementsByTagName('article')[0].innerHTML;
    document.getElementsByTagName('article')[0].innerHTML = '<p>'+this.htmlEncode(this.el.innerHTML)+'</p>'+old;
}

//------------------------
//-----Is Restricted-----
//------------------------
EditorPrototype.isRestricted = function(node, action) {
    var current;

    //this is for test purposes.
    if (action.restricted){
        current = node;
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
    var range = this.selection.getRangeAt(0),
        currentSelection = buildSelection(range),
        elements = null,
        i = 0,
        x = 0,
        valueAction = null,
        valueActions = [],
        current,
        part = null,
        defaultValueActions;
    joinx = 0;

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
        console.log("{{Next Node}}");
        current = currentSelection[i];
        console.log(current);
        if (current.startOffset || current.endOffset && current.node.length > current.endOffset)
            part = true;
        else
            part = false;
        this.joinValues(valueActions, this.determineValues(current.node, JSON.parse(JSON.stringify(defaultValueActions)), part));
    }

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
    console.log("### Join Values ###");
    console.log(joinx++);
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
    console.log("Applying:");
    console.log(""+node.innerHTML);
    console.log(JSON.stringify(action));
    var elements,
        i,
        parent,
        remove;
    if (action.negate) {
        if (action.input) {
            console.log("Negating an input");
            node.style[action.attribute] =  action.value;
        } else
            node.classList.toggle(action['class'], false);
        if (this.blockElements.indexOf(node.tagName)>=0) {
            remove = true;
            while(remove) {
                elements = node.getElementsByClassName(action.class);
                console.log("NOT CHECKING FOR ATTRIBUTES");
                if (elements[0])
                    apply(elements[0], action);
                else
                    remove=false;
            }
        } else if (this.inlineElements.indexOf(node.tagName)>=0) {
            console.log("NOT CHECKING FOR ATTRIBUTES");
            if (node.className == "") {
                parent = node.parentElement;
                while(node.firstChild) {
                    node.parentElement.insertBefore(node.firstChild, node);
                }
                node.parentElement.removeChild(node);
                //do not normalize this, further stuff is done
            }
        }
        return this.l();
    } else {
        if (action.input)
            node.style[action.attribute] =  action.value;
        else
            node.classList.toggle(action['class'], true);
        return this.l();
    }
}

//------------------------
//-----Downwards----------
//------------------------
EditorPrototype.downwards = function(node, action, startOffset, endOffset, parents) {

    console.log("!!Downwards:");
    console.log(node.innerHTML);
    console.log(JSON.stringify(action));
    /*if (parents.length) {
        console.log("Parents:");
        console.log(parents);
    }*/
    var i, childNodes, next, previous, current, action2, inner, children;
    var parent = node.parentElement;

    if (this.isRestricted(node, action))
        return false;

    if (this.blockElements.indexOf(node.tagName) != -1)
        return this.apply(node, action);

    if (this.inlineElements.indexOf(node.tagName) != -1)
        return this.apply(node, action);

    if (node.nodeType ==3 && node.nodeValue.trim())  {

        //The end needs to be trimmed first so that the offsets aren't messed up
        if (endOffset && node.length > endOffset){
            node.splitText(endOffset);
            next = node.nextSibling;
        }
        if (startOffset) {
            node = node.splitText(startOffset);
            previous = node.previousSibling;
        }

        if (action.negate) {
            current = node;
            action2 = JSON.parse(JSON.stringify(action));
            //As long as the current element is not a block on then do this thing
            //but negate has to be true
            console.log("Should I clear block?");
            while (action2.negate && this.blockElements.indexOf(current.tagName) == -1) {
                console.log("try");
                console.log(JSON.stringify(current));
                current=current.parentElement;

                if (hasProperty(current, action)) {
                    console.log("!clear block");
                    this.apply(current, action);
                    action2.negate = false;
                }

            }
            if (this.config.debug) {
                console.log("Action 2, next, previous:");
                console.log(JSON.stringify(action2));
                console.log(JSON.stringify(next));
                console.log(JSON.stringify(previous));
            }

            if (!action2.negate) {
                if (next) {
                    nextNode = this.createParentElement(next, 'SPAN');
                    this.apply(nextNode, action2);
                }
                if (previous) {
                    previousNode = this.createParentElement(previous, 'SPAN');
                    this.apply(previousNode, action2);
                }
            }
        } else {
            var nextGo = false;
            var previousGo = false;
            if (node.nextSibling && node.nextSibling.nodeType != 3)
                nextGo = (node.nextElementSibling.className == action.class);
            if (node.previousSibling && node.previousSibling.nodeType != 3)
                previousGo = (node.previousElementSibling.className == action.class);

            console.log(JSON.stringify(node));
            if (nextGo && !previousGo ) {
                var next = node.nextElementSibling;
                next.insertBefore(node, next.firstChild);
            } else if (!nextGo && previousGo) {
                var previous = node.previousElementSibling;
                previous.insertBefore(node, null);
            } else if (nextGo && previousGo) {
                var previous = node.previousElementSibling;
                var next = node.nextElementSibling;
                previous.insertBefore(node, null);
                previous.insertBefore(next.firstChild, null);
                previous.parentElement.removeChild(next);
            } else {
                node = this.createParentElement(node, 'SPAN');
                this.apply(node, action);
            }


            parent.normalize();
            inner = parent.firstChild;
            if (parent.childNodes.length == 1) {
                parent.className = inner.className;
                parent.insertBefore(inner.firstChild, null);
                parent.removeChild(inner);
            }
        }
    }

    children = node.children;
    parents.push(node.tagName);
    this.l();
    if (children) {
        for (i = 0; i<children.length; i++) {
            this.downwards(children[i], action, false, false, parents);
        }
    }
}

//------------------------
//-----Has Property---------
//------------------------
EditorPrototype.hasProperty = function(current, action, children) {
    if (action.input) {
        if (current.style[action.attribute])
            return true;
    } else {
        if (current.classList.contains(action.class))
            return true;
        if (children && current.getElementsByClassName(action.class).length)
            return true;
    }
    return false;
}

//------------------------
//-----Perform------------
//------------------------
EditorPrototype.perform = function(action) {
    var i = 0,
        range = this.selection.getRangeAt(0),
        currentSelection = buildSelection(range),
        current,
        that = this;

    if (config.debug)
        console.log(currentSelection);

    //determine if action needs to be negated
    //no elements can contain class or attribute, and also can not be inside of class or attribute
    action.negate = false;
    while (action.negate == false && i<currentSelection.length) {
        current = currentSelection[i].node;
        console.log("!Trying to negate");
        console.log(JSON.stringify(current));

        if (current.nodeType == 1)
            action.negate = this.hasProperty(current, action, true);

        if (current.nodeType == 3) {
            current= current.parentElement;
            while (current.tagName != "MAIN") {
                action.negate = this.hasProperty(current, action, false);
                current = current.parentElement;
            }
        }

        i++;
    }
    console.log(action.negate);

    var userSelection = saveSelection(this.el);
    currentSelection.forEach(function(current) {
        console.log("++++++++++++Current++++++++++++++++");
        console.log(current);

        that.downwards(current.node, action, current.startOffset, current.endOffset, []);
        current.node.normalize();
        console.log(current);
    });
    restoreSelection(this.el, userSelection);
    console.log("cSel repeat");
    console.log(JSON.stringify(currentSelection));
}
