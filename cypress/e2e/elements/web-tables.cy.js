import { seededEmployees } from '../../fixtures/webTables.json';
import webTables from '../../pages/WebTablesPage';
import { buildEmployee } from '../../support/utils/dataFactory';

describe('Elements - Web Tables (CRUD)', { tags: ['@elements'] }, () => {
  beforeEach(() => {
    webTables.visit();
  });

  it('lists the seeded employees', { tags: ['@smoke', '@regression'] }, () => {
    webTables.rows().should('have.length', seededEmployees.length);
    seededEmployees.forEach((employee) => webTables.shouldContainEmployee(employee));
  });

  it('adds a new employee through the registration form', { tags: ['@smoke', '@regression'] }, () => {
    const employee = buildEmployee();

    webTables.addEmployee(employee);

    webTables.modal.shouldBeClosed();
    webTables.rows().should('have.length', seededEmployees.length + 1);
    webTables.shouldContainEmployee(employee);
  });

  it('edits an existing employee and keeps the other columns', { tags: '@regression' }, () => {
    const [original] = seededEmployees;
    const changes = { salary: '15500', department: 'Quality Assurance' };

    webTables.editEmployee(original.email, changes);

    webTables.shouldContainEmployee({ ...original, ...changes });
  });

  it('pre-fills the registration form with the record being edited', { tags: '@regression' }, () => {
    const [, employee] = seededEmployees;

    webTables.rowByEmail(employee.email).find(webTables.selectors.editAction).click();

    Object.entries(employee).forEach(([field, value]) => webTables.field(field).should('have.value', value));
  });

  it('deletes an employee', { tags: '@regression' }, () => {
    const [, , employee] = seededEmployees;

    webTables.deleteEmployee(employee.email);

    webTables.shouldNotContainEmail(employee.email);
    webTables.rows().should('have.length', seededEmployees.length - 1);
  });

  context('Search', { tags: '@regression' }, () => {
    [
      { term: 'Gentry', column: 'last name', expected: 'kierra@example.com' },
      { term: 'compliance', column: 'department (case-insensitive)', expected: 'alden@example.com' },
      { term: '10000', column: 'salary', expected: 'cierra@example.com' },
    ].forEach(({ term, column, expected }) => {
      it(`filters rows by ${column}`, () => {
        webTables.search(term);

        webTables.rows().should('have.length', 1).and('contain', expected);
      });
    });

    it('finds a newly added employee', () => {
      const employee = buildEmployee({ department: 'Automation Guild' });

      webTables.addEmployee(employee).search('Automation Guild');

      webTables.rows().should('have.length', 1);
      webTables.shouldContainEmployee(employee);
    });

    it('shows no rows when nothing matches', () => {
      webTables.search('no-such-employee');

      webTables.rows().should('not.exist');
    });
  });

  context('Validation', { tags: '@validation' }, () => {
    it('keeps the form open and adds nothing when submitted empty', () => {
      webTables.openAddForm().submitForm();

      webTables.modal.shouldBeOpen('Registration Form');
      cy.get(webTables.selectors.form).should('have.class', 'was-validated');
      ['firstName', 'lastName', 'email', 'age', 'salary', 'department'].forEach((field) =>
        webTables.field(field).shouldBeInvalid(),
      );
    });

    [
      { field: 'age', value: 'ab', reason: 'non-numeric age' },
      { field: 'salary', value: '12k', reason: 'non-numeric salary' },
      { field: 'email', value: 'john@doe', reason: 'email without TLD' },
    ].forEach(({ field, value, reason }) => {
      it(`rejects a ${reason}`, () => {
        const employee = buildEmployee({ [field]: value });

        webTables.addEmployee(employee);

        webTables.field(field).shouldBeInvalid();
        webTables.modal.shouldBeOpen('Registration Form');
        webTables.rows().should('have.length', seededEmployees.length);
      });
    });

    it('limits age to two digits', () => {
      webTables.openAddForm();

      webTables.field('age').type('12345').should('have.value', '12');
    });
  });

  it(
    'DEF-003: pagination does not report "Page 1 of 0" for an empty result',
    { tags: '@known-defect' },
    () => {
      webTables.search('no-such-employee');

      webTables.pageInfo().should('not.have.text', '1 of 0');
    },
  );

  it('DEF-008: rejects a new employee whose email already exists', { tags: '@known-defect' }, () => {
    const [existing] = seededEmployees;

    webTables.addEmployee(buildEmployee({ email: existing.email }));

    webTables.rowsWithEmail(existing.email).should('have.length', 1);
    webTables.rows().should('have.length', seededEmployees.length);
  });
});
