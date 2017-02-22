'use strict';

//------------------------
//-----Reset Controls-----
//------------------------
EditorPrototype.resetControls = function() {
    var range = this.selection.getRangeAt(0),
        elements = null,
        currentSelection = this.buildSelection(),
        i,
        x,
        action,
        valueAction,
        valueActions = [],
        current,
        node,
        element,
        part;

    //Build valueActions array
    for (action in this.actions) {
        if (this.actions[action].elements) {

            valueActions.push(this.actions[action]);
            this.actions[action].values = [];
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
        if (part)
            node = node.parentElement;

        //Give each action the ability to be empty for the current element
        for (i=0; i<valueActions.length; i++) {
            valueActions[i].empty = true;
        }

        while (true) {
            for (i=0; i<valueActions.length; i++) {
                if (valueActions[i].attribute && node.style[valueActions[i].attribute]) {
                        valueActions[i].values.push( node.style[valueActions[i].attribute]);
                        valueActions[i].empty = false;
                }
            }
            if (node.tagName == "MAIN")
                break;
            node = node.parentElement;
        }

        //The actions which are empty for this element need to be pushed onto the valuess
        for (i=0; i<valueActions.length; i++) {

            if (valueActions[i].empty)
                valueActions[i].values.push("");
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

        for (x=0; x< valueAction.elements.length; x++) {
            element = valueAction.elements[x];

            if (element.tagName == 'SELECT') {
                for(x = 0; x < element.options.length; ++x) {
                    if(element.options[x].value === valueAction.values[0]) {
                        element.selectedIndex = x;
                        break;
                    }
                }
            } else {
                if (element.dataset['value']==valueAction.values[0])
                    element.classList.toggle('selected', true);
                else
                    element.classList.toggle('selected', false);
            }

        }
    }
}
