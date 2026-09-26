import BasePage from './BasePage';
import Modal from './components/Modal';

/** Column order of the table, also the order of fields in the form. */
export const EMPLOYEE_COLUMNS = ['firstName', 'lastName', 'age', 'email', 'salary', 'department'];

class WebTablesPage extends BasePage {
  constructor() {
    super({ path: '/webtables', title: 'Web Tables' });

    this.modal = new Modal();
    this.selectors = {
      addButton: '#addNewRecordButton',
      searchBox: '#searchBox',
      rows: 'table tbody tr',
      editAction: '[title="Edit"]',
      deleteAction: '[title="Delete"]',
      pageInfo: '.pagination strong',
      form: '.modal form#userForm',
      // Form ids match the column keys, except email.
      field: (name) => `.modal form#userForm #${name === 'email' ? 'userEmail' : name}`,
      submit: '.modal #submit',
    };
  }

  rows() {
    return cy.get(this.selectors.rows);
  }

  /** Email is unique per record, so it is used as the row key. */
  rowByEmail(email) {
    return cy.contains(this.selectors.rows, email);
  }

  field(name) {
    return cy.get(this.selectors.field(name));
  }

  openAddForm() {
    cy.get(this.selectors.addButton).click();
    this.modal.shouldBeOpen('Registration Form');
    return this;
  }

  fillForm(employee) {
    EMPLOYEE_COLUMNS.forEach((name) => this.field(name).typeIfPresent(employee[name]));
    return this;
  }

  submitForm() {
    cy.get(this.selectors.submit).click();
    return this;
  }

  addEmployee(employee) {
    return this.openAddForm().fillForm(employee).submitForm();
  }

  editEmployee(email, changes) {
    this.rowByEmail(email).find(this.selectors.editAction).click();
    this.modal.shouldBeOpen('Registration Form');
    return this.fillForm(changes).submitForm();
  }

  deleteEmployee(email) {
    this.rowByEmail(email).find(this.selectors.deleteAction).click();
    return this;
  }

  search(term) {
    cy.get(this.selectors.searchBox).clear();
    cy.get(this.selectors.searchBox).type(term);
    return this;
  }

  pageInfo() {
    return cy.get(this.selectors.pageInfo);
  }

  /** Asserts the full row (all data columns, in order) for an employee. */
  shouldContainEmployee(employee) {
    this.rowByEmail(employee.email)
      .find('td')
      .should(($cells) => {
        const values = [...$cells].slice(0, EMPLOYEE_COLUMNS.length).map((td) => td.innerText.trim());
        expect(values).to.deep.equal(EMPLOYEE_COLUMNS.map((column) => String(employee[column])));
      });
    return this;
  }

  shouldNotContainEmail(email) {
    cy.get('table tbody').should('not.contain', email);
    return this;
  }
}

export default new WebTablesPage();
