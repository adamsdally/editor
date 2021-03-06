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
EditorPrototype.l = function (title, clear, message) {
    var old;

    if (!this.config.debug)
        return false;

    if (!title)
        title = '';

    if (clear)
        old = title;
    else
        old = document.getElementsByTagName('article')[0].innerHTML+' '+title;
    
    if (message)
        document.getElementsByTagName('article')[0].innerHTML = old+ '<p>'+message+'</p> ';
    else
        document.getElementsByTagName('article')[0].innerHTML = old+ '<p>'+this.htmlEncode(this.el.outerHTML)+'</p> ';
}

//------------------------
//-----Is Restricted-----
//------------------------
EditorPrototype.isRestricted = function(current, action) {
    console.log('check is restricted');
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
//-----Has Property---------
//------------------------
EditorPrototype.hasProperty = function(current, action, children) {
    if (action.attribute) {
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

    if (action.attribute) {
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
    if (element.tagName) {
        element = element.tagName;
    }
    if (element == "MAIN")
        return 'top';
    else if (this.blockElements.indexOf(element)!=-1)
        return 'block';
    else if (this.inlineElements.indexOf(element)!=-1)
        return 'inline';
    else if (this.groupElements.indexOf(element) != -1)
        return 'group';
    else
        return false;
}

EditorPrototype.transferProperty = function(startElement, finishElement, action) {
    console.log(startElement.outerHTML);
    console.log(finishElement.outerHTML);
    if (action.attribute) {
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
    console.log("Trying to combine");
    console.log(element.outerHTML);
    var sibling = true,
        previous,
        parent,
        i,
        go,
        value,
        type;

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

    //Combine Forwards
    while (element.nextElementSibling) {
        previous = element;
        element = this.combineSibling(element, element.nextElementSibling, action);
        if (!element) {
            element = previous;
            break;
        }

    }

    parent = element.parentElement;
    //Check for ending BR
    if (parent.lastElementChild.tagName == "BR")
        parent.removeChild(parent.lastElementChild);

    //Go Upwards
    //the variable go determines whether or not we should try to go upwards
    //by seeing if the parent has only one child element
    //
    //this bit needs consolidated a tad bit further as it is definitely redundant.
    go = true;
    if (element.tagName == 'MAIN' || parent.tagName== 'MAIN' || parent.childNodes.length > 1)
        go = false;

    if (go) {
        console.log("Going up!")
        if (this.tryToRemove(element.parentElement))
            this.tryToCombine(element, action); //?should this also combine last child of former parent?
        else {
            parent.style.cssText += element.style.cssText;
            parent.className += " "+element.className;
            element.style = "";
            element.className = "";
            this.tryToRemove(element);
            this.tryToCombine(parent, action);
        }
    } else if (parent.childElementCount == 1) {
        if ((parent.childNodes.length == 1)
            || (!parent.firstChild.textContent.trim()  && !parent.lastChild.textContent.trim())
        ) {
            for (i=0; i<element.style.length; i++) {
                parent.style[element.style[i]]=element.style[element.style[i]];
            }
            parent.cssName += element.cssName;
            element.removeAttribute("style");
            console.log("removing");
            if (!this.isSpecial(parent.firstElementChild))
                this.removeParentElement(element);
            this.tryToCombine(parent, action);

        }
    }


    return true;
}

//-------------------------
//-----Is Special----------
//-------------------------
EditorPrototype.isSpecial = function(element) {
    if (element.nodeType == 3) {
        return false;
    }
    if (element.tagName == 'A') {
        return true;
    }
    if (element.classList.contains("column"))
        return true;

    if (element.classList.contains("profile"))
        return true;
}

//------------------------
//-----Try to Remove---------
//------------------------
EditorPrototype.tryToRemove = function(element) {
    if (element.innerHTML == "") {
        this.removeParentElement(element);
        return true;
    }
    if (element.className == ""
        && element.style.length == 0
        && this.blockElements.indexOf(element.tagName) == -1
        && element.parentNode
        && !this.isSpecial(element)
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
    
    this.l("Performing" , false, "Attribute: "+action.attribute);
    
    var current,
        userSelection,
        currentSelection = this.buildSelection(),
        that = this,
        applyElements = [],
        unapplyElements = [],
        combineElements = [];
    
    this.l("Build Selection", false, " - ");
    
    userSelection = saveSelection(this.el);
    console.log(userSelection);
    
    var debug = "";
    for (var i=0; i<currentSelection.length; i++) {
        debug += currentSelection[i].node.textContent+ " ";
    }
    this.l("Selection", false, debug);
    
    //build selection is returning common ancestor instead of the two individual parts, ish;
    //but only when two block elements are being selected, ish;
        console.log(currentSelection);
    currentSelection.forEach(function(current) {
        that.l("Current", false, current.node.textContent);
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
        console.log(node);
        otherNode = node;
        
        if (otherNode.nodeType == 3)
            otherNode = otherNode.parentElement;
        while (true) {
                that.l("Other node");
                value = that.hasProperty(otherNode, action, false);
                console.log(value);
                if (value) {
                    that.l("Copying", false, "copying")
                    action2 = JSON.parse(JSON.stringify(action));
                    action2.value = value;
                    that.l("Copyied", false, "copied")
                }
                if (otherNode.tagName == 'MAIN')
                    break;

                otherNode = otherNode.parentElement;

        }
        that.l("Node", false, node.textContent);
        console.log(node);
        console.log(action2);
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
        that.l("Node2", false, node.textContent);

        //Repeatedly go from node to the closest ancestor with this style
        //and then distribute that style to all decendants
        //and add that element to the unapplyElements
        parent = node.parentElement;
        console.log(parent);
        console.log(node);
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
        
        that.l("Node3", false, node.textContent);
        applyElements.push(node);
    });

    this.l('Preparing');
    applyElements.forEach(function(current) {
        current = that.apply(current , action, true);
    });

    console.log(unapplyElements);
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
        console.log(combineElements);
    }

    this.el.normalize();

    console.log(userSelection);
    restoreSelection(this.el, userSelection);


    currentSelection = this.buildSelection();

    if (action.event) {
        action.event({
            selection: currentSelection,
            element: this.Element(this.el),
            editor: that,
            action: action
        });
    }

    //if (action.maintainSelection || action.maintainSelection == null)
      //  restoreSelection(this.el, userSelection);
    this.el.focus();
    this.resetControls();
}

EditorPrototype.test = function() {
    console.log("======================================================================");
    console.log("===========================RUNNING TESTS==============================");
    var action, test;
    var result,
        passed = 0,
        failed = 0,
        i,
        x;
    var save = this.el.innerHTML;
    for (action in this.actions) {
        console.log(action);
        if (this.actions[action].test) {
            this.tests[action] = this.actions[action].test;
        }
        if (this.actions[action].tests) {
            for (i = 0;i<this.actions[action].tests.length;i++) {
                x++;
                this.tests[x] = this.actions[action].tests[i];
            }
        }
    }
    for (action in this.tests) {
        test = this.tests[action];
        if (test.action) {
            action = test.action;
        }
        console.log("Action: "+action);
        console.log(test);

        //Reset and Initialize for New Test
        if (test.init)
            test.init(this);
        this.el.removeAttribute('class');

        this.el.innerHTML = test.html || '';
        test.selection = test.selection || {
            'start':0,
            'end':0
        };
        restoreSelection(
            this.el,
            test.selection
        );


        //Run Action
        this.perform(this.actions[action]);

        //Get Results
        if (typeof test.result === 'function') {
            result = test.result(this);
        } else {
            result = this.el.outerHTML
        }

        //Output
        if (result == test.wanted) {
            passed++;
            console.log("%c"+action, "color: green");
            console.log("%cPass", "color: green");
        } else {
            failed++;
            console.log("%c"+action, "color: red");
            console.log("%cFail", "color: red");
            console.group();
                console.log("%cWanted:", "color:red")
                console.group();
                    console.log("%c"+test.wanted, "color: red");
                console.groupEnd();
                console.log("%cReceived:", "color:red")
                console.group();
                    console.log("%c"+result, "color: red");
                console.groupEnd();
            console.groupEnd();
        }
    }
    this.el.classList = "";
    this.el.innerHTML = save;
    console.log("======================================================================");
    console.log("%c Failed: "+failed, "color:red")
    console.log("%c Passed: "+passed, "color:green")
    console.log("======================================================================");
    console.log("======================================================================");
}
