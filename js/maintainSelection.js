//Does not currently take into account empty elements, such as an empty paragraph that is maintaining the cursor

var saveSelection, restoreSelection;

if (window.getSelection && document.createRange) {
    saveSelection = function(containerEl) {

        var range = window.getSelection().getRangeAt(0);
        var preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(containerEl);
        //console.log(preSelectionRange.toString());

        //console.log(containerEl.getElementsByTagName('BR'));
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        var start = preSelectionRange.toString().length;

        return {
            start: start,
            end: start + range.toString().length,
            atBeginning:(range.startOffset == 0)?true:false
        };
    };

    restoreSelection = function(containerEl, savedSel) {
        var charIndex = 0, range = document.createRange();
        range.setStart(containerEl, 0);
        range.collapse(true);
        var nodeStack = [containerEl], node, foundStart = false, stop = false, pass=savedSel.atBeginning;
        console.log(savedSel);
        while (!stop && (node = nodeStack.pop())) {
            console.log(node);
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                console.log(charIndex);
                console.log(nextCharIndex);
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    if (pass && nextCharIndex != savedSel.end) {
                        pass=false;
                    } else {
                        range.setStart(node, savedSel.start - charIndex);
                        foundStart = true;
                    }
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
} else if (document.selection) {
    saveSelection = function(containerEl) {
        var selectedTextRange = document.selection.createRange();
        var preSelectionTextRange = document.body.createTextRange();
        preSelectionTextRange.moveToElementText(containerEl);
        preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
        var start = preSelectionTextRange.text.length;

        return {
            start: start,
            end: start + selectedTextRange.text.length
        }
    };

    restoreSelection = function(containerEl, savedSel) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(containerEl);
        textRange.collapse(true);
        textRange.moveEnd("character", savedSel.end);
        textRange.moveStart("character", savedSel.start);
        textRange.select();
    };
}
