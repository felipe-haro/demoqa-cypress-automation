import BasePage from './BasePage';

class TextBoxPage extends BasePage {
  constructor() {
    super({ path: '/text-box', title: 'Text Box' });

    // `#currentAddress` is used twice on this page (textarea + output line),
    // so selectors are qualified by tag/container.
    this.selectors = {
      fullName: '#userName',
      email: '#userEmail',
      currentAddress: 'textarea#currentAddress',
      permanentAddress: 'textarea#permanentAddress',
      submit: '#submit',
      output: '#output',
      outputLines: {
        fullName: '#output #name',
        email: '#output #email',
        currentAddress: '#output #currentAddress',
        permanentAddress: '#output #permanentAddress',
      },
    };
  }

  /** @param {{fullName?, email?, currentAddress?, permanentAddress?}} data */
  fill(data) {
    Object.entries(data).forEach(([field, value]) => {
      cy.get(this.selectors[field]).typeIfPresent(value);
    });
    return this;
  }

  submit() {
    cy.get(this.selectors.submit).click();
    return this;
  }

  outputLine(field) {
    return cy.get(this.selectors.outputLines[field]);
  }

  outputLines() {
    return cy.get(this.selectors.output).find('p');
  }

  emailField() {
    return cy.get(this.selectors.email);
  }
}

export default new TextBoxPage();
