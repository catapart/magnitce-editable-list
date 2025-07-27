// editable-list.ts
var EditableListPart = /* @__PURE__ */ ((EditableListPart2) => {
  EditableListPart2["Items"] = "items";
  EditableListPart2["AddButton"] = "add";
  EditableListPart2["ItemsSlot"] = "items-slot";
  EditableListPart2["EditButton"] = "edit";
  EditableListPart2["RemoveButton"] = "remove";
  return EditableListPart2;
})(EditableListPart || {});
var ButtonTemplatePart = /* @__PURE__ */ ((ButtonTemplatePart2) => {
  ButtonTemplatePart2["RemoveButton"] = "remove-button";
  ButtonTemplatePart2["EditButton"] = "edit-button";
  return ButtonTemplatePart2;
})(ButtonTemplatePart || {});
var IGNORED_TAGS = /* @__PURE__ */ new Set([
  "style",
  "template"
]);
var HTML = `<div part="${"items" /* Items */}">
    <div part="placeholder"></div>
    <slot part="${"items-slot" /* ItemsSlot */}"></slot>
</div>
<slot name="add"><button part="${"add" /* AddButton */}" type="button">&plus;</button></slot>`;
var STYLE = `
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
`;
var COMPONENT_STYLESHEET = new CSSStyleSheet();
COMPONENT_STYLESHEET.replaceSync(STYLE);
var COMPONENT_TAG_NAME = "editable-list";
var EditableListElement = class extends HTMLElement {
  /** if `true`, allows child elements to be removed from the DOM when their remove button is pressed */
  canRemove = true;
  /** if `true`, allows the edit button to be added and the edit event to be dispatched */
  canEdit = false;
  #boundEventHandlers = /* @__PURE__ */ new Map([
    ["add", this.#addButton_onClick.bind(this)]
  ]);
  /** Cached references to parts of this element, using the `part` attribute values as keys */
  componentParts = /* @__PURE__ */ new Map();
  /**
   * Get and cache an HTMLElement in this element's `shadowDOM` by it's `part` attribute value.
   * @param key the `part` attribute value of the `shadowDOM`'s target child element.
   * @returns the target child element
   */
  getPart(key) {
    if (this.componentParts.get(key) == null) {
      const part = this.shadowRoot.querySelector(`[part="${key}"]`);
      if (part != null) {
        this.componentParts.set(key, part);
      }
    }
    return this.componentParts.get(key);
  }
  /**
   * Get an HTMLElement in this element's `shadowDOM` by it's `part` attribute value.  
   * Unlike `getPart`, this method does not cache the value to keep in runtime memory.
   * @param key the `part` attribute value of the `shadowDOM`'s target child element.
   * @returns the target child element
   */
  findPart(key) {
    return this.shadowRoot.querySelector(`[part="${key}"]`);
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = HTML;
    this.shadowRoot.adoptedStyleSheets.push(COMPONENT_STYLESHEET);
    this.addEventListener("click", (event) => {
      let button = event.composedPath().find((item2) => item2 instanceof HTMLButtonElement);
      if (button == null) {
        return;
      }
      let item = button.parentElement;
      const part = button.getAttribute("part");
      if (part == "edit") {
        const result = this.dispatchEvent(new CustomEvent("edit", { detail: item, bubbles: true }));
        if (this.hasAttribute("cancel-edit")) {
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (part == "remove") {
        const result = this.dispatchEvent(new CustomEvent("remove", { detail: item, bubbles: true, cancelable: true }));
        if (result == true) {
          item.remove();
        }
        if (this.hasAttribute("cancel-remove")) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    });
    this.findPart("add" /* AddButton */)?.addEventListener("click", this.#boundEventHandlers.get("add"));
    this.getPart("items-slot" /* ItemsSlot */).addEventListener("slotchange", this.#updateItemButtons.bind(this));
    const children = this.getPart("items-slot" /* ItemsSlot */).assignedElements();
    if (children.length == 0) {
      this.classList.add("empty");
      this.part.add("empty");
    } else {
      this.classList.remove("empty");
      this.part.remove("empty");
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
      if (key == "remove") {
        value == false ? element.setAttribute(key, "false") : element.removeAttribute(key);
      } else if (key == "edit") {
        value == true ? element.setAttribute(key, "true") : element.removeAttribute(key);
      } else if (key.startsWith("on")) {
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
    this.dispatchEvent(new CustomEvent("add"));
  }
  /**
   * Iterate through slot children to add buttons and listeners where applicable.
   */
  #updateItemButtons() {
    const children = this.getPart("items-slot" /* ItemsSlot */).assignedElements();
    if (children.length == 0) {
      this.classList.add("empty");
      this.part.add("empty");
    } else {
      this.classList.remove("empty");
      this.part.remove("empty");
    }
    for (let i = 0; i < children.length; i++) {
      const target = children[i];
      if (IGNORED_TAGS.has(target.tagName.toLowerCase())) {
        continue;
      } else if (target.tagName.toLowerCase() == "slot") {
        children.push(...target.assignedElements());
        continue;
      }
      const item = children[i];
      const existingEditButton = children[i].querySelector(`button[part="${"edit" /* EditButton */}"]`);
      if (this.canEdit) {
        if (existingEditButton == null) {
          const editButton = document.createElement("button");
          editButton.type = "button";
          editButton.setAttribute("part", "edit");
          const template = this.querySelector(`template[part="${"edit-button" /* EditButton */}"]`);
          if (template != null) {
            editButton.append(template.content.cloneNode(true));
          } else {
            editButton.textContent = "\u2026";
          }
          item.appendChild(editButton);
        }
      } else if (existingEditButton != null) {
        existingEditButton.remove();
      }
      const existingRemoveButton = children[i].querySelector(`button[part="${"remove" /* RemoveButton */}"]`);
      if (this.canRemove) {
        if (existingRemoveButton == null) {
          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.setAttribute("part", "remove");
          const template = this.querySelector(`template[part="${"remove-button" /* RemoveButton */}"]`);
          if (template != null) {
            removeButton.append(template.content.cloneNode(true));
          } else {
            removeButton.textContent = "\xD7";
          }
          item.appendChild(removeButton);
        }
      } else if (existingRemoveButton != null) {
        existingRemoveButton.remove();
      }
    }
  }
  static observedAttributes = [
    "remove",
    "edit",
    "placeholder"
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
      } else {
        this.canRemove = false;
      }
      this.#updateItemButtons();
    } else if (attributeName == "edit") {
      if (newValue == null || newValue.trim() != "true") {
        this.canEdit = false;
      } else {
        this.canEdit = true;
      }
      this.#updateItemButtons();
    } else if (attributeName == "placeholder") {
      this.findPart("placeholder").textContent = newValue;
    }
  }
};
if (customElements.get(COMPONENT_TAG_NAME) == null) {
  customElements.define(COMPONENT_TAG_NAME, EditableListElement);
}
export {
  ButtonTemplatePart,
  EditableListElement,
  EditableListPart
};
