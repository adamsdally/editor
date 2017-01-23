'use strict';

var EditorPrototype = window.EditorPrototype || {};

/*
CURRENTLY
some modifications across styles does not consolidate one span in p
to just p
*/

//------------------------
//-----l------------------
//------------------------
EditorPrototype.l = function (title, clear) {
    var old;

    if (!this.config.debug)
        return false;

    if (!title)
        title = '';

    if (clear)
        old = title;
    else
        old = document.getElementsByTagName('article')[0].innerHTML+' '+title;
    document.getElementsByTagName('article')[0].innerHTML = old+ '<p>'+this.htmlEncode(this.el.outerHTML)+'</p> ';
}

//------------------------
//-----Is Restricted-----
//------------------------
EditorPrototype.isRestricted = function(node, action) {
    var current = node;

    //Currently only checks if the tagName of node is restricted by action
    //stops upon MAIN or no more parents...which is the case upon mouseLeave occasionally
    if (action.restricted){
        while (current.tagName != "MAIN") {
            if (action.restricted.indexOf(current.tagName) != -1)
                return true;
            current = current.parentElement;
            if (!current)
                return true;
        }
    }
    return false;
}


//------------------------
//-----Reset Controls-----
//------------------------
EditorPrototype.resetControls = function() {

    var range = this.selection.getRangeAt(0),
        elements = null,
        currentSelection = this.buildSelection(range),
        i,
        x,
        valueAction,
        valueActions = [],
        current,
        node,
        part;


    //Look through each select element and build a list of actions we need to determine.
    elements = this.controlsEl.getElementsByTagName('SELECT');
    for (i=0; i<elements.length; i++) {
        if (elements[i].dataset['action'] && this.actions[elements[i].dataset['action']]) {
            valueAction = this.actions[elements[i].dataset['action']];
            valueAction.select = elements[i];
            valueAction.values = [];
            valueActions.push(valueAction);
        }
    }

    //Go through each piece of selection and have it determine its valueActions before joining them to the master set.
    for (x=0; x<currentSelection.length; x++) {
        current = currentSelection[x];
        if (current.startOffset || current.endOffset && current.node.length > current.endOffset)
            part = true;
        else if (current.startOffset == 0 && current.endOffset == 0)
            part = true;
        else
            part = false;

        node = current.node;

        if (node.nodeType == 1) {
            for (i=0; i<valueActions.length; i++) {
                if (valueActions[i].attribute && node.style[valueActions[i].attribute])
                    valueActions[i].values.push (node.style[valueActions[i].attribute]);
            }
        }

        if (part) {
            while (this.blockElements.indexOf(node.tagName) == -1) {
                node = node.parentElement;
                for (i=0; i<valueActions.length; i++) {
                    if (valueActions[i].attribute && node.style[valueActions[i].attribute])
                        valueActions[i].values.push( node.style[valueActions[i].attribute]);
                }
            }
        }
    }

    //Set controls based on values.
    for (i=0; i < valueActions.length; i++) {
        valueAction = valueActions[i];
        if (valueAction.values.length) {
            while (valueAction.values.length>1) {
                if (valueAction.values.shift() != valueAction.values[0]) {
                    valueAction.values.unshift("");
                    break;
                }
            }
        } else {
            valueAction.values.unshift("");
        }
        for(x = 0; x < valueAction.select.options.length; ++x) {
            if(valueAction.select.options[x].value === valueAction.values[0]) {
                valueAction.select.selectedIndex = x;
                break;
            }
        }
    }
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

EditorPrototype.checkType = function(element) {
    if (this.blockElements.indexOf(element.tagName)!=-1)
        return 'block';
    else if (this.inlineElements.indexOf(element.tagName)!=-1)
        return 'inline';
    else
        return false;
}

EditorPrototype.transferProperty = function(startElement, finishElement, action) {
    console.log(startElement.outerHTML);
    console.log(finishElement.outerHTML);
    if (action.input) {
        console.log(action.attribute);
        finishElement.style[action.attribute] = startElement.style[action.attribute];
        startElement.style[action.attribute] = "";
    } else {
        finishElement.classList.toggle(action.class, true);
        startElement.classList.toggle(action.class, false);
    }

    console.log(startElement.outerHTML);
    console.log(finishElement.outerHTML);
    return true;
}

EditorPrototype.combineSibling = function(leftElement, rightElement, action) {
    var leftType = this.checkType(leftElement),
        rightType = this.checkType(rightElement),
        value = this.hasProperty(leftElement, action);
    console.log(leftElement);
    console.log(rightElement);
    console.log(value);
    if (!value)
        return false;

    if (leftType != 'block'
        && rightType != 'block'
        && leftElement.tagName == rightElement.tagName
        && leftElement.className == rightElement.className
        && leftElement.style.cssText == rightElement.style.cssText
    ){
        //Are the elements inlined and identical
        //move contents from one to the other
        while (rightElement.firstChild)
            leftElement.appendChild(rightElement.firstChild);
        rightElement.parentElement.removeChild(rightElement);
        return leftElement;
    } else if (value == this.hasProperty(rightElement, action))  {

        //Or do they share the value for this action
        //if they are both inline then create a span parent
        //if they are both P block then create a div parent
        //if the left one is a div then append right into div
        //if the right one is a div then move left on to beginning

        if (rightElement.tagName == 'DIV') {
            this.removeProperty(leftElement, action, false);
            rightElement.insertBefore(leftElement, rightElement.firstChild);
            return rightElement;
        } else {
            if (leftType == 'inline' && rightType=='inline') {
                leftElement = this.createParentElement(leftElement, 'SPAN');
                this.transferProperty(leftElement.firstChild, leftElement, action);

            } else if (leftType == 'block' & rightType == 'block') {
                leftElement = this.createParentElement(leftElement, 'DIV');
                console.log("GoING TO TRANSFER");
                this.transferProperty(leftElement.firstChild, leftElement, action);
            }
            console.log(leftElement.outerHTML);
            this.removeProperty(rightElement, action, false);
            leftElement.appendChild(rightElement);
            return leftElement;
        }
    }
    return false;
}

//------------------------
//-----Try to Combine---------
//------------------------
EditorPrototype.tryToCombine = function(element, action) {
    var sibling = true,
        previous,
        parent,
        i,
        go,
        value,
        type;

    console.log(element);
    if (this.config.combineDebug) {
        console.log("Trying to combine");
        console.log(element.innerHTML);
        console.log(action);
    }

    if (element.nodeType == 3)
        return true;

    if (this.tryToRemove(element))
        return true;

    if (element.tagName == 'MAIN')
        return true;

    //Combine Backwards
    while (element.previousElementSibling) {
        previous = element;
        element = this.combineSibling(element.previousElementSibling, element, action);
        if (!element) {
            element = previous;
            break;
        }
    }
    console.log(element);

    //Combine Forwards
    while (element.nextElementSibling) {
        previous = element;
        element = this.combineSibling(element, element.nextElementSibling, action);
        if (!element) {
            element = previous;
            break;
        }

    }
    console.log(element);

    parent = element.parentElement;
    //Check for ending BR
    if (parent.lastElementChild.tagName == "BR")
        parent.removeChild(parent.lastElementChild);

    //Go Upwards
    //the variable go determines whether or not we should try to go upwards
    //by seeing if the parent does not have a class AND style
    //or by seeing if the parents class and style matches all children
    //if so then try to remove the parent and recombine
    //
    //if go is false then see if if we only have one child
    //if so then absorb that child
    go = true;
    if (element.tagName == 'MAIN' || parent.tagName== 'MAIN')
        go = false;
    else if (parent.style.cssText != "" || parent.className != "") {
        for (i=0; i<parent.children.length; i++) {
            if (parent.style.cssText != parent.children[i].style.cssText
                || parent.className != parent.children[i].className
               ) {
                go = false;
            }
        }
    }
    if (go) {
        if (this.tryToRemove(element.parentElement))
            this.tryToCombine(element, action); //?should this also combine last child of former parent?
    } else if (parent.childElementCount == 1) {
        if (parent.childNodes.length == 1
            || (!parent.firstChild.textContent.trim()  && !parent.lastChild.textContent.trim())
        ) {
            for (i=0; i<element.style.length; i++) {
                parent.style[element.style[i]]=element.style[element.style[i]];
            }
            parent.cssName += element.cssName;

            this.removeParentElement(element);
            this.tryToCombine(parent, action);

        }
    }


    return true;
}

//------------------------
//-----Try to Remove---------
//------------------------
EditorPrototype.tryToRemove = function(element) {
    console.log(element);
    console.log(element.outerHTML);
    if (element.innerHTML == "") {
        this.removeParentElement(element);
        return true;
    }
    if (element.className == ""
        && element.style.length == 0
        && this.blockElements.indexOf(element.tagName) == -1
        && element.parentNode
        && !element.href
       ){
        console.log("%%% Removing");
        console.log(element.tagName);
        console.log(element.innerHTML);
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
        currentSelection = this.buildSelection(range),
        that = this,
        applyElements = [],
        unapplyElements = [],
        combineElements = [];

    console.log(action);
    console.log(currentSelection);

    userSelection = saveSelection(this.el);

    currentSelection.forEach(function(current) {
        var startOffset = current.startOffset,
            endOffset   = current.endOffset,
            node        = current.node,
            parent,
            action2,
            value = false,
            i,
            count,
            otherNode;

        //Go up as far as MAIN looking for value to set as action2
        //If found then distribute value to children and remove
        //Then repeat until we are at level of node
        otherNode = node;
        if (otherNode.nodeType == 3)
            otherNode = otherNode.parentElement;
        while (true) {
                value = that.hasProperty(otherNode, action, false);
                if (value) {
                    action2 = JSON.parse(JSON.stringify(action));
                    action2.value = value;
                }
                if (otherNode.tagName == 'MAIN')
                    break;

                otherNode = otherNode.parentElement;

        }

        //Break apart text nodes
        if (node.nodeType ==3 && node.nodeValue.trim())  {

            //The end needs to be trimmed first so that the offsets aren't messed up
            if (endOffset && node.length > endOffset){
                node.splitText(endOffset);
                if (action2)
                    that.createParentElement(node.nextSibling, 'SPAN');
            }
            if (startOffset) {
                node = node.splitText(startOffset);
                if (action2)
                    that.createParentElement(node.previousSibling, 'SPAN');
            }
            node =  that.createParentElement(node, 'SPAN');
        }

        //Repeatedly go from node to the closest ancestor with this style
        //and then distribute that style to all decendants
        //and add that element to the unapplyElements
        parent = node.parentElement;
        while (action2 && parent) {
            if (that.hasProperty(parent, action, false)) {
                for (i=0; i< parent.childNodes.length; i++) {
                    that.apply(parent.childNodes[i], action2);
                    unapplyElements.push(parent);
                    combineElements.push(parent.childNodes[i]);
                }
                if (parent == node.parentElement)
                   break;
                parent = node.parentElement;
            } else {
                parent = parent.parentElement;
            }
        }
        applyElements.push(node);
    });

    this.l('Preparing');

    applyElements.forEach(function(current) {
        console.log(current.innerHTML)
        current = that.apply(current , action, true);
    });
    if (applyElements.length) {
        console.log(applyElements);
    }

    unapplyElements.forEach(function(current) {
        that.removeProperty(current, action, false);
    });
    if (unapplyElements.length) {
        this.l('Unapplying');
    }

    //Combine applyElements and combineElements into one combineElements
    combineElements = applyElements.concat(combineElements);
    combineElements.forEach(function(current) {
        that.tryToCombine(current, action);
    });
    if (combineElements.length) {
        this.l('Combining');
    }

    this.el.normalize();

    if (action.event) {
        action.event({
            nodes: combineElements,

        });
    }


    restoreSelection(this.el, userSelection);
}
