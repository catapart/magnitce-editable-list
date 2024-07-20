export var EditableListPart;
(function (EditableListPart) {
    EditableListPart["Items"] = "items";
    EditableListPart["AddButton"] = "add";
    EditableListPart["ItemsSlot"] = "items-slot";
    EditableListPart["EditButton"] = "edit";
    EditableListPart["RemoveButton"] = "remove";
})(EditableListPart || (EditableListPart = {}));
export var ButtonTemplatePart;
(function (ButtonTemplatePart) {
    ButtonTemplatePart["RemoveButton"] = "remove-button";
    ButtonTemplatePart["EditButton"] = "edit-button";
})(ButtonTemplatePart || (ButtonTemplatePart = {}));
const IGNORED_TAGS = new Set([
    'style',
    'template'
]);
const HTML = `<div part="${EditableListPart.Items}"><slot part="${EditableListPart.ItemsSlot}"></slot></div>
<slot name="add"><button part="${EditableListPart.AddButton}" type="button">&plus;</button></slot>`;
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
export class EditableListElement extends HTMLElement {
    canRemove = true;
    canEdit = false;
    hasButtonsWithoutHandlers = false;
    #boundEventHandlers = new Map([
        ['add', this.addButton_onClick.bind(this)]
    ]);
    componentParts = new Map();
    getPart(key) {
        if (this.componentParts.get(key) == null) {
            const part = this.shadowRoot.querySelector(`[part="${key}"]`);
            if (part != null) {
                this.componentParts.set(key, part);
            }
        }
        return this.componentParts.get(key);
    }
    findPart(key) { return this.shadowRoot.querySelector(`[part="${key}"]`); }
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = HTML;
        this.shadowRoot.adoptedStyleSheets.push(COMPONENT_STYLESHEET);
        this.findPart(EditableListPart.AddButton)?.addEventListener('click', this.#boundEventHandlers.get('add'));
        this.getPart(EditableListPart.ItemsSlot).addEventListener('slotchange', this.updateItemButtons.bind(this));
    }
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
    addButton_onClick() {
        this.dispatchEvent(new CustomEvent('add'));
    }
    updateItemButtons() {
        const children = this.getPart(EditableListPart.ItemsSlot).assignedElements();
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
            const existingEditButton = children[i].querySelector(`button[part="${EditableListPart.EditButton}"]`);
            if (this.canEdit) {
                if (existingEditButton == null) {
                    const editButton = document.createElement('button');
                    editButton.type = 'button';
                    editButton.setAttribute('part', 'edit');
                    const template = this.querySelector(`template[part="${ButtonTemplatePart.EditButton}"]`);
                    if (template != null) {
                        editButton.append(template.content.cloneNode(true));
                    }
                    else {
                        editButton.textContent = '…';
                    }
                    editButton.addEventListener('click', (event) => {
                        this.dispatchEvent(new CustomEvent('edit', { detail: item }));
                        if (this.hasAttribute('cancel-edit')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    });
                    item.appendChild(editButton);
                }
                else if (this.hasButtonsWithoutHandlers) {
                    existingEditButton.addEventListener('click', (event) => {
                        this.dispatchEvent(new CustomEvent('edit', { detail: item }));
                        if (this.hasAttribute('cancel-edit')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    });
                }
            }
            else if (existingEditButton != null) {
                existingEditButton.remove();
            }
            const existingRemoveButton = children[i].querySelector(`button[part="${EditableListPart.RemoveButton}"]`);
            if (this.canRemove) {
                if (existingRemoveButton == null) {
                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.setAttribute('part', 'remove');
                    const template = this.querySelector(`template[part="${ButtonTemplatePart.RemoveButton}"]`);
                    if (template != null) {
                        removeButton.append(template.content.cloneNode(true));
                    }
                    else {
                        removeButton.textContent = '×';
                    }
                    removeButton.addEventListener('click', (event) => {
                        item.remove();
                        this.dispatchEvent(new CustomEvent('remove', { detail: item }));
                        if (this.hasAttribute('cancel-remove')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    });
                    item.appendChild(removeButton);
                }
                else if (this.hasButtonsWithoutHandlers) {
                    existingRemoveButton.addEventListener('click', (event) => {
                        item.remove();
                        this.dispatchEvent(new CustomEvent('remove', { detail: item }));
                        if (this.hasAttribute('cancel-remove')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    });
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
    attributeChangedCallback(attributeName, _oldValue, newValue) {
        if (attributeName == "remove") {
            if (newValue == null || newValue.trim() == "true") {
                this.canRemove = true;
            }
            else {
                this.canRemove = false;
            }
            this.updateItemButtons();
        }
        else if (attributeName == "edit") {
            if (newValue == null || newValue.trim() != "true") {
                this.canEdit = false;
            }
            else {
                this.canEdit = true;
            }
            this.updateItemButtons();
        }
    }
}
if (customElements.get(COMPONENT_TAG_NAME) == null) {
    customElements.define(COMPONENT_TAG_NAME, EditableListElement);
}
