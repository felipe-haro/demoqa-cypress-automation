/**
 * Bootstrap modal used across DemoQA (modal dialogs, practice form result,
 * web tables registration form). Scoped by `.modal[role="dialog"]` so it does
 * not collide with the react-datepicker popup, which also uses role="dialog".
 */
export default class Modal {
  root() {
    return cy.get('.modal.show[role="dialog"]');
  }

  title() {
    return this.root().find('.modal-title');
  }

  body() {
    return this.root().find('.modal-body');
  }

  closeWithIcon() {
    this.root().find('button.btn-close').click();
    return this;
  }

  /** Clicks the backdrop area (outside the dialog box). */
  closeWithBackdrop() {
    this.root().click('topLeft');
    return this;
  }

  closeWithEscape() {
    // Bootstrap listens for Escape on the dialog element itself.
    this.root().type('{esc}');
    return this;
  }

  shouldBeOpen(title) {
    this.root().should('be.visible');
    if (title) this.title().should('have.text', title);
    return this;
  }

  shouldBeClosed() {
    cy.get('.modal[role="dialog"]').should('not.exist');
    return this;
  }
}
