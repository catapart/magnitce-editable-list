/** Attributes for configuring the EditableListElement */
type EditableListAttributes = {
    remove?: boolean;
    edit?: boolean;
};
/** Properties for creating an EditableListElement using the `create` method */
type EditableListProperties = EditableListAttributes & {
    onAdd?: (event?: Event) => void | Promise<void>;
    onRemove?: (event?: Event) => void | Promise<void>;
    onEdit?: (event?: Event) => void | Promise<void>;
};
/** `part` attribute values for querying and selecting `shadowRoot` elements in the `editable-list` component */
declare enum EditableListPart {
    Items = "items",
    AddButton = "add",
    ItemsSlot = "items-slot",
    EditButton = "edit",
    RemoveButton = "remove",
    Placeholder = "placeholder"
}
/** `part` attribute values for assigning remove button and edit button templates */
declare enum ButtonTemplatePart {
    RemoveButton = "remove-button",
    EditButton = "edit-button"
}
/** A custom html element that adds a remove button to its children and removes the child when the button is pressed */
declare class EditableListElement extends HTMLElement {
    #private;
    /** if `true`, allows child elements to be removed from the DOM when their remove button is pressed */
    canRemove: boolean;
    /** if `true`, allows the edit button to be added and the edit event to be dispatched */
    canEdit: boolean;
    findElement<T extends HTMLElement = HTMLElement>(id: string): T;
    constructor();
    /**
     * Create a new instance of an `EditableListElement` element using the provided properties to define the configuration.
     * @param props target `EditableListProperties` values
     * @returns a configured instance of an `EditableListElement` element.
     */
    static create(props?: EditableListProperties): EditableListElement;
    static observedAttributes: string[];
    /**
     * Update items to new configuration when attributes change
     * @param attributeName the attribute that has changed
     * @param _oldValue the previous value that the updating attribute was assinged as
     * @param newValue the new value that the updating attribute is assigned as
     */
    attributeChangedCallback(attributeName: string, _oldValue: string, newValue: string): void;
}

export { ButtonTemplatePart, type EditableListAttributes, EditableListElement, EditableListPart, type EditableListProperties };
