# Tutorial

## 1. Apply this feature to any Search box.

- API:

```js
new AutoSuggestion(
  /**
   * @type {HTMLInputElement} inputElement - A InputHTMLELement as a Search box; Required
   */
  inputElement,
  {
    // The suggestion popup options; Optional
    popupOptions: {
      /**
       * @type {Array<"Suggestion" | "Collection" | "Product">} enableBlocks - List enabled blocks
       */
      enabledBlocks: ["Suggestion", "Collection", "Product"] // as default, optional,

      /**
       * @typedef BlockOptions - Suggestion Block Options
       * @type {object}
       * @property {string} containerElmType - declare the HTML ElemetType of the block's container
       * @property {string} containerClassName - extend the className of the block's container
       * @property {Object} containerStyle - extend the CSS Properties of the block's container
       * @property {(elm, data) => void} afterRenderContainer - the callback after the block's container was rendered
       * @property {string} childElmType  - declare the HTML ElemetType of each block's item
       * @property {string} childClassName - extend the className of each block's item
       * @property {Object} childStyle - extend the CSS Properties of each block's item
       * @property {(elm, itemData, index) => void} afterRenderChild  the callback after each block's item was rendered
       */

       suggestionBlockOptions: BlockOptions // optional;
       collectionBlockOptions: BlockOptions // optional;
       productBlockOptions: BlockOptions // optional;
    },
    //This will be called when the Search box has changed and its return value is a dataset that will be used to render the suggestion popup
    onSearch: (searchValue: string) => Promise;

    /**
     * @typedef State - The AutoSuggestion's state
     * @type {object}
     * @property {string} searchValue
     * @property {Object} dataSet
     * @property {Function | null} cancelRequesting
   */

    // This function will be called before the new searching process executed. Return false if you want to prevent searching and hide the suggestion popup.
    shouldHandleSearching: (state: State) => boolean;
  }
);
```

- Example:

```js
new AutoSuggestion(document.getElementById("text-search"), {
  popupOptions: {
    suggestionBlockOptions: {
      containerStyle: {
          color: "red"
      }
    },
  },
  shouldHandleSearching: (state) => {
      if (state.searchValue.length >= 2) return true;

      return false;
  },
  onSearch: (searchValue) => {
    return fetch("https://api.json-generator.com/templates/QB3tF5Tkmo4o/data", {
      headers: {
        Authorization: "Bearer sa7ti5u75ofr7pvi0kqglx3c3tdfk817lwcq97gs",
      },
    }).then((res) => res.json());
  },
});
```
