import BasePage from './BasePage';

class RadioButtonPage extends BasePage {
  constructor() {
    super({ path: '/radio-button', title: 'Radio Button' });

    this.selectors = {
      radioByLabel: (label) => `input[type="radio"][id="${label.toLowerCase()}Radio"]`,
      result: 'p .text-success',
    };
  }

  radio(label) {
    return cy.get(this.selectors.radioByLabel(label));
  }

  /** Users click the label text, so the test does too. */
  choose(label) {
    cy.contains('label', label).click();
    return this;
  }

  result() {
    return cy.get(this.selectors.result);
  }
}

export default new RadioButtonPage();
