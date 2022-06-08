/**
 * @typedef BlockOptions
 * @type {object}
 * @property {string} containerElmType
 * @property {string} containerClassName
 * @property {Object} containerStyle
 * @property {(elm, data) => void} afterRenderContainer
 * @property {string} childElmType
 * @property {string} childClassName
 * @property {Object} childStyle
 * @property {(elm, itemData, index) => void} afterRenderChild
 */

class Block {
  /**
   * @param {string} name
   * @param {BlockOptions} options
   */
  constructor(name, options = {}) {
    this.options = Object.assign(
      {
        containerElmType: "div",
        childElmType: "a",
      },
      options
    );

    this.name = name;
    this.el = document.createElement(this.options.containerElmType);

    this.renderItem = this.renderItem.bind(this);
    this.renderContainer = this.renderContainer.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.render = this.render.bind(this);
  }

  renderItem(itemData, index, state) {
    const itemElm = document.createElement(this.options.childElmType);
    itemElm.innerText = itemData;
    itemElm.classList.add("block-item");

    if (this.options.childClassName) {
      itemElm.classList.add(this.options.childClassName);
    }

    if (this.options.childStyle) {
      Object.assign(itemElm.style, this.options.childStyle);
    }

    return itemElm;
  }

  renderTitle() {
    const blockTitle = document.createElement("p");
    blockTitle.classList.add("block-title");
    blockTitle.innerText = this.name.toUpperCase();

    return blockTitle;
  }

  renderContainer(data, state) {
    const container = document.createElement(
      this.options.containerElmType || "div"
    );
    container.classList.add("block-container");

    if (this.options.containerClassName) {
      container.classList.add(this.options.containerClassName);
    }

    if (this.options.containerStyle) {
      Object.assign(container.style, this.options.containerStyle);
    }

    const blockTitle = this.renderTitle();
    container.append(blockTitle);

    const children = (data || []).map((itemData, index) => {
      const child = this.renderItem(itemData, index, state);
      if (this.options.afterRenderChild) {
        this.options.afterRenderChild(child, itemData, index);
      }

      return child;
    });

    container.append(...children);
    return container;
  }

  render(data, state) {
    const container = this.renderContainer(data, state);
    if (this.options.afterRenderContainer) {
      this.options.afterRenderContainer(container, data);
    }
    const prevContainer = this.el;
    const parentElem = prevContainer.parentElement;

    if (parentElem) {
      parentElem.replaceChild(container, prevContainer);
    }

    this.el = container;
    return this.el;
  }
}

class SuggestionBlock extends Block {
  /**
   * @param {BlockOptions} options
   */
  constructor(options = {}) {
    super(
      "Suggestion",
      Object.assign(
        {
          childElmType: "a",
        },
        options
      )
    );

    this.renderItem = this.renderItem.bind(this);
    this.renderContainer = this.renderContainer.bind(this);
    this.render = this.render.bind(this);
  }

  renderItem(data, index, state) {
    const itemElm = super.renderItem(data, index, state);
    itemElm.classList.add("suggestion-block-item");

    itemElm.href = data.url;
    itemElm.target = "_blank";
    // const highlightMatchedSearchText = data.replaceAll(
    //   state.searchValue,
    //   `<span class="text-highlight">${state.searchValue}</span>`
    // );

    itemElm.innerText = data.term;
    return itemElm;
  }
}

class CollectionBlock extends Block {
  /**
   * @param {BlockOptions} options
   */
  constructor(options = {}) {
    super("Collection", options);

    this.renderItem = this.renderItem.bind(this);
    this.renderContainer = this.renderContainer.bind(this);
    this.render = this.render.bind(this);
  }

  renderItem(data, index, state) {
    const itemElm = super.renderItem(data, index, state);
    itemElm.href = data.url;
    itemElm.target = "_blank";
    itemElm.innerText = data.title;
    return itemElm;
  }
}

class ProductBlock extends Block {
  /**
   * @param {BlockOptions} options
   */
  constructor(options = {}) {
    super("Product", options);

    this.renderItem = this.renderItem.bind(this);
    this.renderContainer = this.renderContainer.bind(this);
    this.render = this.render.bind(this);
  }

  renderItem(data, index, state) {
    const itemElm = super.renderItem(data, index, state);
    itemElm.href = data.url;
    itemElm.target = "_blank";

    itemElm.innerHTML = `
      <div class="product-block-item">
        <img class="product-block-item image" src="${data.image}"/>
        <div>
          <p class="product-block-item title">${data.title}</p>
          <p class="product-block-item brand">${data.brand}</p>
          <p class="product-block-item price">${data.price}&#36;</p>
        </div>
      </div>
    `;

    return itemElm;
  }
}

class SuggestionPopup {
  /**
   * @typedef SuggestionPopupOptions
   * @type {object}
   * @property {Array<"Suggestion" | "Collection" | "Product">} enabledBlocks
   * @property {BlockOptions} suggestionBlockOptions
   * @property {BlockOptions} collectionBlockOptions
   * @property {BlockOptions} productBlockOptions
   * @property {string} popupClassname
   * @property {Object} popupStyle
   *
   * @param {HTMLElement} searchInputElement
   * @param {SuggestionPopupOptions} options
   */
  constructor(searchInputElement, options) {
    this.options = Object.assign(
      {
        enabledBlocks: ["Suggestion", "Collection", "Product"],
      },
      options
    );

    this.popupElm = document.createElement("div");

    this.searchInputElement = searchInputElement;
    this.blocks = [];

    this.adjustPopupPostion = this.adjustPopupPostion.bind(this);
    this.initializePopupElm = this.initializePopupElm.bind(this);
    this.destroy = this.destroy.bind(this);
    this.render = this.render.bind(this);
    this.setDisplay = this.setDisplay.bind(this);

    this.initializePopupElm();
  }

  adjustPopupPostion() {
    const { bottom, x } = this.searchInputElement.getBoundingClientRect();

    Object.assign(this.popupElm.style, {
      position: "fixed",
      top: `${bottom}px`,
      right: `${x}px`,
    });
  }

  initializePopupElm() {
    this.adjustPopupPostion();
    this.popupElm.classList.add("suggestion-popup");

    if (this.options.popupClassname) {
      this.popupElm.classList.add(this.options.popupClassname);
    }

    if (this.options.popupStyle) {
      Object.assign(this.popupElm.style, this.options.popupStyle);
    }

    const blocks = this.options.enabledBlocks.map((blockName) => {
      let block;
      switch (blockName) {
        case "Suggestion": {
          block = new SuggestionBlock(this.options.suggestionBlockOptions);
          break;
        }
        case "Collection": {
          block = new CollectionBlock(this.options.collectionBlockOptions);
          break;
        }
        case "Product": {
          block = new ProductBlock(this.options.productBlockOptions);
          break;
        }
        default:
          return null;
      }

      this.popupElm.append(block.el);

      return block;
    });

    this.blocks = blocks;

    window.addEventListener("resize", this.adjustPopupPostion);
  }

  destroy() {
    window.removeEventListener("resize", this.adjustPopupPostion);
  }

  setDisplay(display) {
    Object.assign(this.popupElm.style, {
      display: display ? "inherit" : "none",
    });
  }

  render(dataSet, state) {
    this.blocks.forEach((block) => {
      const blockData = dataSet[block.name] || [];
      block.render(blockData, state);
    });

    if (!this.popupElm.isConnected) {
      document.body.append(this.popupElm);
    }
  }
}

class AutoSuggestion {
  /**
   * @typedef State
   * @type {object}
   * @property {string} searchValue
   * @property {Object} dataSet
   * @property {Function | null} cancelRequesting
   */

  /**
   * @type {State} state
   */
  state = {};
  /**
   * @param {HTMLInputElement} searchInputElement
   * @param {{
   *  popupOptions: SuggestionPopupOptions;
   *  onSearch: (searchValue: string) => Promise;
   *  shouldHandleSearching: (state: State) => boolean;
   *}} options
   */
  constructor(searchInputElement, options) {
    this.options = options;

    const state = (this.state = {
      searchValue: "",
      dataSet: {},
      cancelRequesting: null,
    });

    this.searchInputElement = searchInputElement;
    state.searchValue = searchInputElement.value;

    this.popupUI = new SuggestionPopup(
      searchInputElement,
      options.popupOptions
    );

    this.run = this.run.bind(this);
    this.destroy = this.destroy.bind(this);
    this.onTextSearchChange = this.onTextSearchChange.bind(this);

    this.searchInputElement.addEventListener("input", this.onTextSearchChange);
  }

  destroy() {
    this.popupUI.destroy();
    this.searchInputElement.removeEventListener(
      "input",
      this.onTextSearchChange
    );
  }

  async onTextSearchChange(event) {
    const state = this.state;
    if (state.cancelRequesting) {
      state.cancelRequesting("Canceled");
      state.cancelRequesting = null;
    }

    const searchValue = (state.searchValue = event.target.value);
    let needNewSearch = true;

    if (this.options.shouldHandleSearching) {
      needNewSearch = this.options.shouldHandleSearching(state);
    }

    if (needNewSearch) {
      const dataSet = await Promise.race([
        new Promise((_, reject) => {
          state.cancelRequesting = reject;
        }),
        this.options.onSearch(searchValue),
      ]);

      state.dataSet = dataSet;
    }

    this.run();
  }

  run() {
    let shouldDisplayPopup = true;
    if (!this.state.searchValue) {
      shouldDisplayPopup = false;
    }

    if (this.options.shouldHandleSearching) {
      shouldDisplayPopup = this.options.shouldHandleSearching(this.state);
    }

    this.popupUI.setDisplay(shouldDisplayPopup);

    if (!shouldDisplayPopup) return;

    this.popupUI.render(this.state.dataSet, this.state);
  }
}
