'use strict';
var EditorPrototype = window.EditorPrototype || {};

EditorPrototype.about  = function() {
    console.log("Hello! This html text editor was designed and is copyright Adam Dally. You may use this personally or commercially as long as it is not a primary component of a sold product or service. If you have any questions please email me at adamsdally@yahoo.com Have a wonderful Day! -Adam");
}

EditorPrototype.start = function(config) {
    var that = this;

    var current, start, end;
    var editable = true;
    var draggable = false;

    this.el = config.el;
    this.controlsEl = config.controlsEl;
    this.actions = config.actions;
    this.tests = config.tests;
    this.blockElements = config.blockElements;
    this.inlineElements = config.inlineElements;
    this.onChange = config.onChange;

    this.selection = window.getSelection();
    this.range = null;

    //The select function should be executed everytime a user input is made which changes the selection
    //should consider whenever events change selection
    var selectFunction = function(e) {
        console.log('select function');
        var range = that.selection.getRangeAt(0);
        console.log(range);
        if (range.startContainer && that.isRestricted(range.startContainer, that.actions.input))
            editable = false;
        else
            editable = true;
        if (editable)
            that.resetControls();
    }

    this.el.addEventListener('mouseup', selectFunction);
    //this.el.addEventListener('mouseleave', mouseFinishedFunction);

    this.el.addEventListener('paste', function(e) {
        e.preventDefault();

        var text = e.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
        that.changeEvent();
        selectFunction();
    });

    this.el.addEventListener('keypress', function(e) {
        console.log("key press");
        var range,
            current,
            siblingNode;

        draggable = false;

        //Allow ctrl key compbinations, could be used in the future to access actions
        if (e.ctrlKey)
            return true;

        //If an arrow key is not pressed and editable is false
        //Then prevent keypress
        if ([37,38,39,40].indexOf(e.keyCode)==-1 && !editable)
            return e.preventDefault();

        //if backspace or delete aren't pressed then return;
        if ([8,46].indexOf(e.keyCode)==-1)
            return that.changeEvent();


        //check to verify backspace or delete aren't moving into a restricted element
        range = that.selection.getRangeAt(0);
        console.log(range);
        if (e.keyCode == 8 && range.startOffset==0) {
            current = range.startContainer;
            siblingNode = current.previousElementSibling;
            while ((!siblingNode || !current) && current.tagName != "MAIN") {
                current = current.parentElement;
                siblingNode = current.previousElementSibling;
            }
            if (current.tagName == 'MAIN') {
                siblingNode = false;
            }
        }
        if (e.keyCode == 46 && range.startOffset==range.startContainer.length) {
            current = range.startContainer;
            siblingNode = current.nextElementSibling;

            while (!siblingNode || current.tagName == "MAIN") {
                current = current.parentElement;
                siblingNode = current.nextElementSibling;
            }
        }

        //Travel down to lowest element.
        while(siblingNode.childElementCount >0) {
            siblingNode = siblingNode.children[0];
        }

        if (siblingNode && that.isRestricted(siblingNode, that.actions.input))
            e.preventDefault();
        selectFunction();

    });

    this.el.addEventListener('keyup', function(e) {
        var range;
        //On keys that could move the cursor out of its current position check isRestricted
        if ([37,38,39,40].indexOf(e.keyCode)!=-1) {
            range = that.selection.getRangeAt(0);
            if (that.isRestricted(range.startContainer, that.actions.input))
                editable = false;
            else
                editable = true;
        }
        that.changeEvent();
        selectFunction();
    });

     this.controlsEl.addEventListener('click', function(e) {
        var action = null;
        e.preventDefault();

        if (e.target.tagName != 'A')
            return false;

        that.l("Click", true);

        if (e.target.dataset['action'] && that.actions[e.target.dataset['action']])
                action = that.actions[e.target.dataset['action']];
        else
            return false;

        that.perform(action);

        that.changeEvent();

        return false;
    });

     this.controlsEl.addEventListener('change', function(e) {
        var action = null;
        e.preventDefault();

        if (e.target.tagName != 'SELECT')
            return false;

        that.l("Change", true);

        if (e.target.dataset['action'] && that.actions[e.target.dataset['action']])
                action = that.actions[e.target.dataset['action']];
        else
            return false;
        if (action.input)
            action.value = e.target.options[e.target.selectedIndex].value;

        that.perform(action);
        that.changeEvent();
    });

    if (this.config == null)
        throw "No configuration file found.";

    if (this.config.debug) {
        var debugEl = document.createElement('ARTICLE');
        this.el.parentElement.insertBefore(debugEl, null);
    }

    /*document.getElementsByClassName('dragging')[0].addEventListener('click', function(e) {
        draggable = !draggable;
        el.contentEditable = !draggable;
        if (draggable) {
            e.target.innerHTML = "Dragging On";
        } else {
            e.target.innerHTML = "Dragging Off";
        }
    });*/
    this.test();
    this.el.contentEditable = true;
}
