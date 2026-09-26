const exactText = (text) => new RegExp(`^${Cypress._.escapeRegExp(text)}$`);

/**
 * Wrapper for react-select widgets, used by several DemoQA pages.
 *
 * react-select generates ids such as `react-select-3-input` based on mount
 * order, so they are not stable. The component is always scoped to a root
 * element resolved by the page object, and relies on ARIA roles/labels
 * (`combobox`, `option`, `Remove <value>`) rather than generated CSS classes.
 */
export default class ReactSelect {
  /** @param {() => Cypress.Chainable} getRoot resolves the widget container */
  constructor(getRoot) {
    this.getRoot = getRoot;
  }

  input() {
    return this.getRoot().find('input[role="combobox"]');
  }

  /**
   * Opens the menu with ArrowDown instead of a click: clicking the control
   * toggles the menu, so a second click (e.g. in a multiselect that stays
   * open) would close it. ArrowDown is idempotent.
   */
  open() {
    this.input().type('{downArrow}');
    return this;
  }

  search(text) {
    this.input().type(text);
    return this;
  }

  options() {
    return this.getRoot().find('[role="option"]');
  }

  listbox() {
    return this.getRoot().find('[role="listbox"]');
  }

  /**
   * Selects an option by its exact visible text.
   * @param {string} text
   * @param {{ search?: boolean }} options type the text first (autocomplete widgets)
   */
  select(text, { search = false } = {}) {
    if (search) this.search(text);
    else this.open();
    this.getRoot().contains('[role="option"]', exactText(text)).click();
    return this;
  }

  selectMany(values, options) {
    values.forEach((value) => this.select(value, options));
    return this;
  }

  remove(text) {
    this.getRoot().find(`[aria-label="Remove ${text}"]`).click();
    return this;
  }

  /** Text of a single-value selection. */
  value() {
    return this.getRoot().find('[class*="singleValue"]');
  }

  /** Asserts the labels of a multi-value selection, in display order. */
  shouldHaveValues(expected) {
    if (!expected.length) {
      this.getRoot().find('[aria-label^="Remove "]').should('not.exist');
      return this;
    }
    this.getRoot()
      .find('[aria-label^="Remove "]')
      .should(($removeButtons) => {
        const labels = [...$removeButtons].map((el) => el.previousElementSibling.innerText);
        expect(labels).to.deep.equal(expected);
      });
    return this;
  }

  shouldBeDisabled() {
    this.input().should('be.disabled');
    return this;
  }
}
