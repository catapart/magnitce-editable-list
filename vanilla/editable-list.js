/** `part` attribute values for querying and selecting `shadowRoot` elements in the `editable-list` component */
export var EditableListPart;
(function (EditableListPart) {
    EditableListPart["Items"] = "items";
    EditableListPart["AddButton"] = "add";
    EditableListPart["ItemsSlot"] = "items-slot";
    EditableListPart["EditButton"] = "edit";
    EditableListPart["RemoveButton"] = "remove";
})(EditableListPart || (EditableListPart = {}));
/** `part` attribute values for assigning remove button and edit button templates */
export var ButtonTemplatePart;
(function (ButtonTemplatePart) {
    ButtonTemplatePart["RemoveButton"] = "remove-button";
    ButtonTemplatePart["EditButton"] = "edit-button";
})(ButtonTemplatePart || (ButtonTemplatePart = {}));
/** `HTMLElement tags that are not managed by the `editable-list` element */
const IGNORED_TAGS = new Set([
    'style',
    'template'
]);
/** The `shadowRoot` content definition */
const HTML = `<div id="${EditableListPart.Items}"><slot id="${EditableListPart.ItemsSlot}"></slot></div>
<slot name="add"><button id="${EditableListPart.AddButton}" class="button" type="button">&plus;</button></slot>`;
/** Default styles for the `editable-list` element */
const STYLE = `
* { box-sizing: border-box; }
:host
{
    /* begin default ul styles */
    display: block;
    list-style-type: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 40px;
    /* end default ul styles */
}`;
const COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(STYLE);
const COMPONENT_TAG_NAME = 'editable-list';
/** A custom html element that adds a remove button to its children and removes the child when the button is pressed */
export class EditableListElement extends HTMLElement {
    /** if `true`, allows child elements to be removed from the DOM when their remove button is pressed */
    canRemove = true;
    /** if `true`, allows the edit button to be added and the edit event to be dispatched */
    canEdit = false;
    #boundEventHandlers = new Map([
        ['add', this.#addButton_onClick.bind(this)]
    ]);
    componentParts = new Map();
    getElement(id) {
        if (this.componentParts.get(id) == null) {
            const part = this.findElement(id);
            if (part != null) {
                this.componentParts.set(id, part);
            }
        }
        return this.componentParts.get(id);
    }
    findElement(id) { return this.shadowRoot.getElementById(id); }
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = HTML;
        this.shadowRoot.adoptedStyleSheets.push(COMPONENT_STYLESHEET);
        this.addEventListener('click', (event) => {
            let button = event.composedPath().find(item => item instanceof HTMLButtonElement);
            if (button == null) {
                return;
            }
            let item = button.parentElement;
            if (button.classList.contains('edit')) {
                const result = this.dispatchEvent(new CustomEvent('edit', { detail: item, bubbles: true }));
                if (this.hasAttribute("cancel-edit")) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            else if (button.classList.contains('remove')) {
                const result = this.dispatchEvent(new CustomEvent('remove', { detail: item, bubbles: true, cancelable: true }));
                if (result == true) {
                    item.remove();
                }
                if (this.hasAttribute("cancel-remove")) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        });
        this.findElement(EditableListPart.AddButton)?.addEventListener('click', this.#boundEventHandlers.get('add'));
        this.getElement(EditableListPart.ItemsSlot).addEventListener('slotchange', this.#updateItemButtons.bind(this));
        this.#applyPartAttributes();
    }
    #applyPartAttributes() {
        const identifiedElements = [...this.shadowRoot.querySelectorAll('[id]')];
        for (let i = 0; i < identifiedElements.length; i++) {
            identifiedElements[i].part.add(identifiedElements[i].id);
        }
        const classedElements = [...this.shadowRoot.querySelectorAll('[class]')];
        for (let i = 0; i < classedElements.length; i++) {
            classedElements[i].part.add(...classedElements[i].classList);
        }
    }
    /**
     * Create a new instance of an `EditableListElement` element using the provided properties to define the configuration.
     * @param props target `EditableListProperties` values
     * @returns a configured instance of an `EditableListElement` element.
     */
    static create(props) {
        const element = document.createElement(COMPONENT_TAG_NAME);
        if (props == null) {
            return element;
        }
        for (const [key, value] of Object.entries(props)) {
            if (key == 'remove') {
                (value == false) ? element.setAttribute(key, "false") : element.removeAttribute(key);
            }
            else if (key == 'edit') {
                (value == true) ? element.setAttribute(key, "true") : element.removeAttribute(key);
            }
            else if (key.startsWith('on')) {
                const eventName = key.substring(2).toLowerCase();
                element.addEventListener(eventName, value);
            }
        }
        return element;
    }
    /**
     * Handle click on the "Add Item" button
     */
    #addButton_onClick() {
        this.dispatchEvent(new CustomEvent('add'));
    }
    /**
     * Iterate through slot children to add buttons and listeners where applicable.
     */
    #updateItemButtons() {
        const children = this.getElement(EditableListPart.ItemsSlot).assignedElements();
        for (let i = 0; i < children.length; i++) {
            const target = children[i];
            if (IGNORED_TAGS.has(target.tagName.toLowerCase())) {
                continue;
            }
            else if (target.tagName.toLowerCase() == 'slot') {
                children.push(...target.assignedElements());
                continue;
            }
            const item = children[i];
            const existingEditButton = children[i].querySelector(`button.${EditableListPart.EditButton}`);
            if (this.canEdit) {
                if (existingEditButton == null) {
                    const editButton = document.createElement('button');
                    editButton.type = 'button';
                    const editClasses = this.getAttribute('edit-class')?.trim() ?? "";
                    editButton.classList.add(EditableListPart.EditButton);
                    if (editClasses != "") {
                        editButton.classList.add(...editClasses.split(' '));
                    }
                    editButton.setAttribute('part', `${EditableListPart.EditButton}${(editClasses != '') ? ` ${editClasses}` : ''}`);
                    const template = this.querySelector(`template[part="${ButtonTemplatePart.EditButton}"]`);
                    if (template != null) {
                        editButton.append(template.content.cloneNode(true));
                    }
                    else {
                        editButton.textContent = '…';
                    }
                    item.appendChild(editButton);
                }
            }
            else if (existingEditButton != null) {
                existingEditButton.remove();
            }
            const existingRemoveButton = children[i].querySelector(`button.${EditableListPart.RemoveButton}`);
            if (this.canRemove) {
                if (existingRemoveButton == null) {
                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    const removeClasses = this.getAttribute('remove-class')?.trim() ?? "";
                    removeButton.classList.add(EditableListPart.RemoveButton);
                    if (removeClasses != '') {
                        removeButton.classList.add(...removeClasses.split(' '));
                    }
                    removeButton.setAttribute('part', `${EditableListPart.RemoveButton}${(removeClasses != '') ? ` ${removeClasses}` : ''}`);
                    const template = this.querySelector(`template[part="${ButtonTemplatePart.RemoveButton}"]`);
                    if (template != null) {
                        removeButton.append(template.content.cloneNode(true));
                    }
                    else {
                        removeButton.textContent = '×';
                    }
                    item.appendChild(removeButton);
                }
            }
            else if (existingRemoveButton != null) {
                existingRemoveButton.remove();
            }
        }
    }
    static observedAttributes = [
        'remove',
        'edit',
    ];
    /**
     * Update items to new configuration when attributes change
     * @param attributeName the attribute that has changed
     * @param _oldValue the previous value that the updating attribute was assinged as
     * @param newValue the new value that the updating attribute is assigned as
     */
    attributeChangedCallback(attributeName, _oldValue, newValue) {
        if (attributeName == "remove") {
            if (newValue == null || newValue.trim() == "true") {
                this.canRemove = true;
            }
            else {
                this.canRemove = false;
            }
            this.#updateItemButtons();
        }
        else if (attributeName == "edit") {
            if (newValue == null || newValue.trim() != "true") {
                this.canEdit = false;
            }
            else {
                this.canEdit = true;
            }
            this.#updateItemButtons();
        }
    }
}
if (customElements.get(COMPONENT_TAG_NAME) == null) {
    customElements.define(COMPONENT_TAG_NAME, EditableListElement);
}
