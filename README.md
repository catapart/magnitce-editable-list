# `<editable-list>`
A custom html element that adds a remove button to its children and removes the child when the button is pressed.

Also includes options for using edit buttons instead of, or in addition to, remove button.

Package size: ~5kb minified, ~9kb verbose.

## Quick Reference

#### Default
```html
<editable-list>
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
</editable-list>
```
#### Options
```html
<editable-list remove="false" edit="true">
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
    <button type="button" slot="add">Add</button>
    <template part="remove-button">Close</template>
    <template part="edit-button">Browse</template>
</editable-list>
```

## Support
- Firefox
- Chrome
- Edge
- <s>Safari</s> (Has not been tested; should be supported, based on custom element support)

## Getting Started
 1. [Install/Reference the library](#referenceinstall)
 1. [Create List]()
 1. [Configure Options]()

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
import { EditableList } from "/path/to/editable-list[.min].js";
```
#### npm
```js
import { EditableList } from "@magnit-ce/editable-list";
```

### Create List
[TODO]

### Configure Options
[TODO]