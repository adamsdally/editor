function getApplyableElementsInParent(parentElement, action) {
    var children = parentElement.children,
        i,
        selection = [];

    for (i = 0; i < children.length; i++) {
        if (isActionable(children[i], action))
            selection.push(children[i]);
    }
    console.log(selection);
    return selection;
}
