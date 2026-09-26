export default class BasePage {
  /**
   * @param {object} params
   * @param {string} params.path  route relative to baseUrl
   * @param {string} params.title page <h1>, used as a "page is ready" signal
   */
  constructor({ path, title }) {
    this.path = path;
    this.title = title;
  }

  visit() {
    cy.visitPage(this.path);
    cy.contains('h1', this.title).should('be.visible');
    return this;
  }
}
