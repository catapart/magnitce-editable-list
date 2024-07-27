# `<editable-list>`
A custom `HTMLElement` that adds a remove button to its children and removes the child when the button is pressed.

Also includes an "Add Item" button to facilate expected list editing functionality.

Configurable to use edit buttons instead of, or in addition to, remove buttons.

Package size: ~5kb minified, ~9kb verbose.

## Quick Reference
```html
<!-- Default -->
<editable-list>
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
</editable-list>
<!-- Options -->
<editable-list remove="false" edit="true">
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
    <button type="button" slot="add">Add</button>
    <template part="remove-button">Close</template>
    <template part="edit-button">Browse</template>
</editable-list>
<script type="module" src="/path/to/editable-list[.min].js"></script>
```

## Demo
https://catapart.github.io/magnitce-editable-list/demo/

To run the demo, yourself, run the `package` script (`npm run pacakge`) before serving the demo index page.

## Support
- Firefox
- Chrome
- Edge
- <s>Safari</s> (Has not been tested; should be supported, based on custom element support)

## Getting Started
 1. [Install/Reference the library](#referenceinstall)
 1. [Add Items](#add-items)
 1. [Configure Options](#configure-options)
 1. [Handle Events](#handle-events)
 1. [Styling](#styling)

### Reference/Install
#### HTML Import (not required for vanilla js/ts; alternative to import statement)
```html
<script type="module" src="/path/to/editable-list[.min].js"></script>
```
#### npm
```cmd
npm install @magnit-ce/editable-list
```

### Import
#### Vanilla js/ts
```js
import "/path/to/editable-list[.min].js"; // if you didn't reference from a <script>, reference with an import like this

import { EditableList } from "/path/to/editable-list[.min].js";
```
#### npm
```js
import { register, EditableList } from "@magnit-ce/editable-list";
register(); // with npm, direct imports can cause issues with bundlers. To prevent direct imports, just use the register function 
```

### Add Items
Any `HTMLElement` added to an `<editable-list>` element will be managed, in the DOM, by the `<editable-list>` element. The `<editable-list>` assumes a list-type style, so it is common convention to use `<li>` elements as children.

Each child element may be injected with a remove `<button>` element, an edit `<button>` element, both, or neither. Each of these buttons will dispatch an event on the `<editable-list>` element, when they are clicked. Additionally, the remove `<button>` will remove the child object that it is parented to from the DOM.

### Configure Options
As a convenience for common customizations, the element can be configured in the following ways.

#### Hide Remove Button
Set the `remove` attribute to `false` in order to prevent the remove `<button>` from being added to the child elements.

```html
<editable-list remove="false">
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
</editable-list>
```

#### Include Edit Button
Set the `edit` attribute to `true` in order to inject the edit `<button>` into the child elements.

```html
<editable-list edit="true">
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
</editable-list>
```

#### Replace Remove Button with Edit Button
Set the `remove` attribute to `false` and the `edit` attribute to `true` in order to effectively replace the remove `<button>` with the edit `<button>` in the child elements.

```html
<editable-list remove="false" edit="true">
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
</editable-list>
```

#### Custom Add Button Template
The add `<button>` is a slotted element on this custom element, and can be replaced by using the `add` slot. This is achieved by setting a child `<button>` element's `slot` attribute to `add`, as indicated in the example.

```html
<editable-list>
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
    <button type="button" slot="add">Add</button>
</editable-list>
```

#### Custom Remove/Edit Button Template
Unlike the add `<button>`, the remove and edit `<button>` elements that are injected must be constructed at runtime and for each child element. Since `<template>` elements don't play well with `HTMLSlotElement` functionality, the `editable-list` component will expect well-known sub-elements (in this context: "`part`"s) to be provided as `<template>` elements.

To provide a remove `<button>` template, include a child `<template>` element with its `part` attribute set to `remove-button`.

To provide an edit `<button>` template, include a child `<template>` element with its `part` attribute set to `edit-button`.

```html
<editable-list edit="true">
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
    <template part="remove-button">Close</template>
    <template part="edit-button">Browse</template>
</editable-list>
```

### Handle Events
The `<editable-list>` element dispatches the following events:

#### `add`
- Event Name: `add`
- Dispatch: When the `<button>` defined as the `<editable-list>`'s "add" button is clicked.
- Effects: none
- `detail`<`null`>: --

#### `remove`
- Event Name: `remove`
- Dispatch: When a child's remove `<button>` is clicked.
- Effects: Removes the child element the `<button>` is parented to from the DOM.
- `detail`<`HTMLElement`>: the child element the `<button>` is parented to.

#### `edit`
- Event Name: `edit`
- Dispatch: When a child's edit `<button>` is clicked.
- Effects: none
- `detail`<`HTMLElement`>: the child element the `<button>` is parented to.

Listen for these events by using the standard `addEventListener` function.
```js
const editableList = document.querySelector('editable-list');
editableList.addEventListener('add', (event) => { 
    console.log("Add clicked")
});

editableList.addEventListener('remove', (event) => { 
    console.log("Remove child: ", event.detail);
});

editableList.addEventListener('edit', (event) => { 
    console.log("Edit child: ", event.detail); 
});
```

### Styling
The `<editable-list>` element uses the `shadowDOM` which makes some of its inner HTML inaccessible to default CSS selectors.

To allow implementers to style the element, each sub-element of the `<editable-list>` element has had its `part` attribute assigned.

Elements that have assigned `part` attributes, in the `shadowDOM` may be selected using the `::part()` selector, affixed to the parent list selector.

The `items` part and the `add` part are the only parts of the component that exist in the `shadowDOM`, so they can be styled using the `::part()` selector.

The `remove` and `edit` parts are both injected into the child elements, which are still in the light dom and can be styled without needing their to access them through the `::part()` selector.  
To select them, the standard attribute selector (ex: `[part="remove"]`) can be used.

```html
<editable-list class="styled">
    <li>First</li>
</editable-list>
<style>
    editable-list
    {
        list-style: none;
        margin: 0;
        padding: 0;
        
        display: flex;
        flex-direction: column;
    }
    editable-list::part(items)
    {
        background-color: #444;
        color: #999;
        display: flex;
        flex-direction: column;
    }
    .styled::part(add)
    {
        background-color: green;
        color: white;
    }
    .styled [part="edit"]
    {
        background-color: blue;
        color: white;
    }
    .styled [part="remove"]
    {
        background-color: red;
        color: white;
    }
</style>
```

## License
This library is in the public domain. You do not need permission, nor do you need to provide attribution, in order to use, modify, reproduce, publish, or sell it or any works using it or derived from it.