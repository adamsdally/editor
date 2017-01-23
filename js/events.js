//------------------------
//-----Change Event-----
//------------------------
EditorPrototype.changeEvent = function() {

    //Make sure that the change did not completely empty element
    if (this.el.textContent.trim() == '') {
        this.el.innerHTML = '<p><br></p>';
        var range = document.createRange();

        range.setStart(this.el.children[0],0);

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    return this.onChange(this.el);
}
