function isActionable(element, action) {
    if (action.class) {
        if (element.classList.contains(action.class))
            return true;
    }
}
