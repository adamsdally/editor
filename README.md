Editor
======
By Adam Dally


This is my Open-Source, made from scratch, WYSIWYG, HTML text editor designed for an end user writing experience anywhere a easy to use but powerful editor would be useful.

Features:
--------

### Actions:
Every user-controlled ability of the editor is implemented as an Action object in the actions array from the most mundane, such as making text bold, to complex content manipulation procedures, like top-level-only columns controlled by flex-basis. These objects can have the following parameters:

- attribute: the style attribute that will be modified.
- class: the class attribute that will be toggled.
- binary: currently used to state values that could be on or off.
- restricted: currently an array of restricted elements.
- special: tags or classes that have limited editing potential through normal means
- event: a function executed after normal editor perform. this has one object argument containing 
-- selection
-- editor
-- action
that can then be acted upon for fine-tuned functionality
- test: current location for basic testing of the action

### Core
This editor will consolidate as much HTML as possible within the bounds of the configuration groups (block, inline, and group) and specialized elements from the actions.
- block: will never be combined together.
- inline: will be combined together inside blocks.
- group: appear alongside or encompassing block elements.

When an action is executed the editor
1. builds a list of top elements in the user selection
2. splits text nodes if necessary
3. applies action to the selection elements
4. condenses content
5. executes action event
6. reset controls'

Additionally, the editor provides a list of navigation and editing functionality for custom events that fit within the conventions of the rest of the editor. Some of these include:
- insert(el)
- parentType(el, type)
- splitElement(el, lastNode)

### Controls:

With basic restraints at the moment the controls are meant to be completely decoupled from the configuration of the editor and can be arranged and configured independently. Multiple controls of different types can activate the same action if needed.  All that is needed is:
- data-action
- data-value (optional)

Additionally actions will keep track of which controls point to it and will then change the value or class of the control to indicate its value for any given text selection.

History:
----------
In particular, this yet unnamed editor was started in development to overcome my continued frustration trying to extend relatively simple custom functionality in a supported and straightforward way within existing text editors. Was partially restricting edits to H1 elements really that difficult; and layouts with columns so unintuitive? These seemingly impossible tasks were only made worse by my slim selection of editors that met initial criteria for their basic editing capabilities, style, extensibility, setup, and multi-editor support.

After trying and looking at many, with a particular effort in CKEditor, I decided that building my own editor was going to be quicker than bodging solutions into an existing one; and I had plenty of experience to know what I wanted from it.


Credits
-------
Icons designed by Vaadin from Flaticon
