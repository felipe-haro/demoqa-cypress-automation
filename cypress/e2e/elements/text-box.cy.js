import { invalidEmails, validUser } from '../../fixtures/textBox.json';
import textBox from '../../pages/TextBoxPage';

describe('Elements - Text Box', { tags: ['@elements'] }, () => {
  beforeEach(() => {
    textBox.visit();
  });

  it('echoes every submitted field in the output panel', { tags: ['@smoke', '@regression'] }, () => {
    textBox.fill(validUser).submit();

    textBox.outputLine('fullName').should('have.text', `Name:${validUser.fullName}`);
    textBox.outputLine('email').should('have.text', `Email:${validUser.email}`);
    textBox.outputLine('currentAddress').should('contain.text', validUser.currentAddress);
    textBox.outputLine('permanentAddress').should('contain.text', validUser.permanentAddress);
  });

  it('renders only the fields that were filled in', { tags: '@regression' }, () => {
    textBox.fill({ fullName: validUser.fullName }).submit();

    textBox.outputLines().should('have.length', 1);
    textBox.outputLine('fullName').should('have.text', `Name:${validUser.fullName}`);
  });

  it('does not render any output when submitting an empty form', { tags: '@validation' }, () => {
    textBox.submit();

    textBox.outputLines().should('not.exist');
  });

  invalidEmails.forEach((email) => {
    it(`highlights the invalid email "${email}" and does not render output`, { tags: '@validation' }, () => {
      textBox.fill({ ...validUser, email }).submit();

      textBox.emailField().should('have.class', 'field-error');
      textBox.outputLines().should('not.exist');
    });
  });

  it('DEF-002: clears the previous output when the email becomes invalid', { tags: '@known-defect' }, () => {
    textBox.fill(validUser).submit();
    textBox.outputLine('email').should('be.visible');

    textBox.fill({ email: 'not-an-email' }).submit();

    textBox.emailField().should('have.class', 'field-error');
    textBox.outputLines().should('not.exist');
  });
});
