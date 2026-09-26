import baseline from '../../fixtures/a11yBaseline.json';
import alerts from '../../pages/AlertsPage';
import modalDialogs from '../../pages/ModalDialogsPage';
import practiceForm from '../../pages/PracticeFormPage';
import selectMenu from '../../pages/SelectMenuPage';
import textBox from '../../pages/TextBoxPage';
import webTables from '../../pages/WebTablesPage';

/**
 * Lightweight accessibility check with axe-core, scoped to "critical" impact.
 * Violations already reported (DEF-005) are kept in a baseline fixture so the
 * suite stays green while still failing on any NEW critical violation.
 */
describe('Accessibility (axe-core)', { tags: ['@a11y'] }, () => {
  [practiceForm, textBox, webTables, selectMenu, alerts, modalDialogs].forEach((page) => {
    it(`introduces no new critical violations on ${page.title}`, () => {
      page.visit();

      cy.checkPageA11y({ label: page.title, known: baseline[page.title] });
    });
  });

  it('introduces no new critical violations inside an open modal dialog', () => {
    modalDialogs.visit().open('small');

    cy.checkPageA11y({ label: 'Small modal', known: baseline['Small modal'] });
  });

  it('DEF-005: Practice Form has no critical violations at all', { tags: '@known-defect' }, () => {
    practiceForm.visit();

    cy.checkPageA11y({ label: 'Practice Form (strict)' });
  });
});
