import radioButton from '../../pages/RadioButtonPage';

describe('Elements - Radio Button', { tags: ['@elements'] }, () => {
  beforeEach(() => {
    radioButton.visit();
  });

  ['Yes', 'Impressive'].forEach((option) => {
    it(`selects "${option}" and reports the choice`, { tags: ['@smoke', '@regression'] }, () => {
      radioButton.choose(option);

      radioButton.radio(option).should('be.checked');
      radioButton.result().should('have.text', option);
    });
  });

  it('keeps a single option selected when switching', { tags: '@regression' }, () => {
    radioButton.choose('Yes').choose('Impressive');

    radioButton.radio('Yes').should('not.be.checked');
    radioButton.radio('Impressive').should('be.checked');
    radioButton.result().should('have.text', 'Impressive');
  });

  it('does not allow the disabled "No" option to be selected', { tags: '@validation' }, () => {
    radioButton.radio('No').should('be.disabled');

    radioButton.choose('No');

    radioButton.radio('No').should('not.be.checked');
    radioButton.result().should('not.exist');
  });
});
