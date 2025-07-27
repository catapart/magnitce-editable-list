/** Attributes for configuring the EditableListElement */
export type EditableListAttributes = 
{
    remove?: boolean;
    edit?: boolean;
};
/** Properties for creating an EditableListElement using the `create` method */
export type EditableListProperties = EditableListAttributes &
{
    onAdd?: (event?: Event) => void|Promise<void>;
    onRemove?: (event?: Event) => void|Promise<void>;
    onEdit?: (event?: Event) => void|Promise<void>;
};
/** `part` attribute values for querying and selecting `shadowRoot` elements in the `editable-list` component */
export enum EditableListPart
{
    Items = "items",
    AddButton = "add",
    ItemsSlot = "items-slot",
    EditButton = "edit",
    RemoveButton = "remove",
}
/** `part` attribute values for assigning remove button and edit button templates */
export enum ButtonTemplatePart
{
    RemoveButton = "remove-button",
    EditButton = "edit-button",
}

/** `HTMLElement tags that are not managed by the `editable-list` element */
const IGNORED_TAGS = new Set([
    'style',
    'template'
]);

/** The `shadowRoot` content definition */
const HTML = `<div part="${EditableListPart.Items}">
    <div part="placeholder"></div>
    <slot part="${EditableListPart.ItemsSlot}"></slot>
</div>
<slot name="add"><button part="${EditableListPart.AddButton}" type="button">&plus;</button></slot>`;
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
}
:host(:not(.empty)) [part="placeholder"]
{
    display: none;
}
`


const COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(STYLE);

const COMPONENT_TAG_NAME = 'editable-list';
/** A custom html element that adds a remove button to its children and removes the child when the button is pressed */
export class EditableListElement extends HTMLElement
{
    /** if `true`, allows child elements to be removed from the DOM when their remove button is pressed */
    canRemove: boolean = true;
    /** if `true`, allows the edit button to be added and the edit event to be dispatched */
    canEdit: boolean = false;

    #boundEventHandlers: Map<string, (event?:Event) => void> = new Map([
        ['add', this.#addButton_onClick.bind(this)]
    ]);

    /** Cached references to parts of this element, using the `part` attribute values as keys */
    componentParts: Map<string, HTMLElement> = new Map();
    /**
     * Get and cache an HTMLElement in this element's `shadowDOM` by it's `part` attribute value.
     * @param key the `part` attribute value of the `shadowDOM`'s target child element.
     * @returns the target child element
     */
    getPart<T extends HTMLElement = HTMLElement>(key: string)
    {
        if(this.componentParts.get(key) == null)
        {
            const part = this.shadowRoot!.querySelector(`[part="${key}"]`) as HTMLElement;
            if(part != null) { this.componentParts.set(key, part); }
        }

        return this.componentParts.get(key) as T;
    }
    /**
     * Get an HTMLElement in this element's `shadowDOM` by it's `part` attribute value.  
     * Unlike `getPart`, this method does not cache the value to keep in runtime memory.
     * @param key the `part` attribute value of the `shadowDOM`'s target child element.
     * @returns the target child element
     */
    findPart<T extends HTMLElement = HTMLElement>(key: string) { return this.shadowRoot!.querySelector(`[part="${key}"]`) as T; }

    constructor()
    {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot!.innerHTML = HTML;
        this.shadowRoot!.adoptedStyleSheets.push(COMPONENT_STYLESHEET);

        this.addEventListener('click', (event: Event) =>
        {
            let button = event.composedPath().find(item => item instanceof HTMLButtonElement);
            if(button == null) { return; }
            let item: HTMLElement = button.parentElement!;
            const part = button.getAttribute('part');
            if(part == 'edit')
            {
                const result = this.dispatchEvent(new CustomEvent('edit', { detail: item, bubbles: true }));
                if(this.hasAttribute("cancel-edit"))
                {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            else if(part == 'remove')
            {
                const result = this.dispatchEvent(new CustomEvent('remove', { detail: item, bubbles: true, cancelable: true  }));
                if(result == true)
                {
                    item.remove();
                }
                if(this.hasAttribute("cancel-remove"))
                {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        })

        this.findPart(EditableListPart.AddButton)?.addEventListener('click', this.#boundEventHandlers.get('add')!);
        this.getPart<HTMLSlotElement>(EditableListPart.ItemsSlot).addEventListener('slotchange', this.#updateItemButtons.bind(this));
        const children = this.getPart<HTMLSlotElement>(EditableListPart.ItemsSlot).assignedElements();
        if(children.length == 0)
        {
            this.classList.add('empty');
            this.part.add('empty');
        }
        else
        {
            this.classList.remove('empty');
            this.part.remove('empty');
        }
        
    }

    /**
     * Create a new instance of an `EditableListElement` element using the provided properties to define the configuration.
     * @param props target `EditableListProperties` values
     * @returns a configured instance of an `EditableListElement` element.
     */
    static create(props?: EditableListProperties)
    {
        const element = document.createElement(COMPONENT_TAG_NAME) as EditableListElement;
        if(props == null) { return element; }        

        for(const [key, value] of Object.entries(props))
        {
            if(key == 'remove')
            {
                (value == false) ? element.setAttribute(key, "false") : element.removeAttribute(key);
            }
            else if(key == 'edit')
            {
                (value == true) ? element.setAttribute(key, "true") : element.removeAttribute(key);
            }
            else if(key.startsWith('on'))
            {
                const eventName = key.substring(2).toLowerCase();
                element.addEventListener(eventName, value as (event: Event) => void|Promise<void>);
            }
        }
        return element;
    }

    /**
     * Handle click on the "Add Item" button
     */
    #addButton_onClick()
    {
        this.dispatchEvent(new CustomEvent('add'));
    }

    /**
     * Iterate through slot children to add buttons and listeners where applicable.
     */
    #updateItemButtons()
    {
        const children = this.getPart<HTMLSlotElement>(EditableListPart.ItemsSlot).assignedElements();
        if(children.length == 0)
        {
            this.classList.add('empty');
            this.part.add('empty');
        }
        else
        {
            this.classList.remove('empty');
            this.part.remove('empty');
        }
        for(let i = 0; i < children.length; i++)
        {
            const target = children[i];
            if(IGNORED_TAGS.has(target.tagName.toLowerCase()))
            {
                continue;
            }
            else if(target.tagName.toLowerCase() == 'slot')
            {
                children.push(...(target as HTMLSlotElement).assignedElements());
                continue;
            }

            const item = children[i];

            const existingEditButton = children[i].querySelector(`button[part="${EditableListPart.EditButton}"]`);
            if(this.canEdit)
            {
                if(existingEditButton == null)
                {
                    const editButton = document.createElement('button');
                    editButton.type = 'button';
                    editButton.setAttribute('part', 'edit');
                    const template = this.querySelector(`template[part="${ButtonTemplatePart.EditButton}"]`) as HTMLTemplateElement;
                    if(template != null)
                    {
                        editButton.append(template.content.cloneNode(true));
                    }
                    else
                    {
                        editButton.textContent = '…';
                    }
                    item.appendChild(editButton);
                }
            }
            else if(existingEditButton != null)
            {
                existingEditButton.remove();
            }

            const existingRemoveButton = children[i].querySelector(`button[part="${EditableListPart.RemoveButton}"]`);
            if(this.canRemove)
            {
                if(existingRemoveButton == null)
                {
                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.setAttribute('part', 'remove');
                    const template = this.querySelector(`template[part="${ButtonTemplatePart.RemoveButton}"]`) as HTMLTemplateElement;
                    if(template != null)
                    {
                        removeButton.append(template.content.cloneNode(true));
                    }
                    else
                    {
                        removeButton.textContent = '×';
                    }
                    item.appendChild(removeButton);
                }
            }
            else if(existingRemoveButton != null)
            {
                existingRemoveButton.remove();
            }
        }

    }

    static observedAttributes = [
        'remove',
        'edit',
        'placeholder',
    ];
    /**
     * Update items to new configuration when attributes change
     * @param attributeName the attribute that has changed
     * @param _oldValue the previous value that the updating attribute was assinged as
     * @param newValue the new value that the updating attribute is assigned as
     */
    attributeChangedCallback(attributeName: string, _oldValue: string, newValue: string) 
    {
        if(attributeName == "remove")
        {
            if(newValue == null || newValue.trim() == "true")
            {
                this.canRemove = true;
            }
            else
            {
                this.canRemove = false;
            }
            this.#updateItemButtons();
        }
        else if(attributeName == "edit")
        {
            if(newValue == null || newValue.trim() != "true")
            {
                this.canEdit = false;
            }
            else
            {
                this.canEdit = true;
            }
            this.#updateItemButtons();
        }
        else if(attributeName == "placeholder")
        {
            this.findPart('placeholder').textContent = newValue;
        }
    }
}
if(customElements.get(COMPONENT_TAG_NAME) == null)
{
    customElements.define(COMPONENT_TAG_NAME, EditableListElement);
}