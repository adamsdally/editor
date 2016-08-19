'use strict';
var EditorPrototype = window.EditorPrototype || {};

EditorPrototype.start = function(config) {
    var that = this;

    var current, start, end;
    var editable = true;
    var draggable = false;

    this.el = config.el;
    this.controlsEl = config.controlsEl;
    this.actions = config.actions;
    this.blockElements = config.blockElements;
    this.inlineElements = config.inlineElements;

    this.selection = window.getSelection();
    this.range = null;


    this.el.addEventListener('mouseup', function(e) {
        var range = that.selection.getRangeAt(0);
        if (that.isRestricted(range.startContainer, that.actions.input))
            editable = false;
        else
            editable = true;
        that.resetControls();
    });

    this.el.addEventListener('paste', function(e) {
        if (!editable)
            e.preventDefault();
    });

    this.el.addEventListener('keypress', function(e) {
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
            return;

        //check to verify backspace or delete aren't moving into a restricted element
        range = that.selection.getRangeAt(0);
        if (e.keyCode == 8 && range.startOffset==0) {
            current = range.startContainer;
            siblingNode = current.previousElementSibling;
            while (!siblingNode || !current) {
                current = current.parentElement;
                siblingNode = current.previousElementSibling;
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
        if (siblingNode && isRestricted(siblingNode, that.actions.input))
            e.preventDefault();
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
    });

     this.controlsEl.addEventListener('click', function(e) {
        var action = null;
        e.preventDefault();

        if (e.target.tagName != 'A')
            return false;

        that.l("Click");

        if (e.target.dataset['action'] && that.actions[e.target.dataset['action']])
                action = that.actions[e.target.dataset['action']];
        else
            return false;

        that.perform(action);

        return false;
    });

     this.controlsEl.addEventListener('change', function(e) {
        var action = null;
        e.preventDefault();

        if (e.target.tagName != 'SELECT')
            return false;

        that.l("Change");

        if (e.target.dataset['action'] && that.actions[e.target.dataset['action']])
                action = that.actions[e.target.dataset['action']];
        else
            return false;
        if (action.input)
            action.value = e.target.options[e.target.selectedIndex].value;

        that.perform(action);
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
}
