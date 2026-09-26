import selectMenu from '../../pages/SelectMenuPage';

describe('Widgets - Select Menu', { tags: ['@widgets'] }, () => {
  beforeEach(() => {
    selectMenu.visit();
  });

  it('selects an option inside an option group', { tags: ['@smoke', '@regression'] }, () => {
    selectMenu.selectValue.select('Group 2, option 1');

    selectMenu.selectValue.value().should('have.text', 'Group 2, option 1');
  });

  it('replaces the previous choice in a single select', { tags: '@regression' }, () => {
    selectMenu.selectOne.select('Dr.');
    selectMenu.selectOne.select('Prof.');

    selectMenu.selectOne.value().should('have.text', 'Prof.');
  });

  it('selects by visible text in the native select and exposes the value', { tags: '@regression' }, () => {
    selectMenu.oldStyleSelect().select('Purple');

    selectMenu.oldStyleSelect().should('have.value', '4');
    selectMenu.oldStyleSelect().find('option:selected').should('have.text', 'Purple');
  });

  context('Multiselect', { tags: '@regression' }, () => {
    it('adds several values and removes one', () => {
      selectMenu.multiSelect.selectMany(['Green', 'Black', 'Red']);
      selectMenu.multiSelect.shouldHaveValues(['Green', 'Black', 'Red']);

      selectMenu.multiSelect.remove('Black');

      selectMenu.multiSelect.shouldHaveValues(['Green', 'Red']);
    });

    it('removes a selected value from the remaining options', () => {
      selectMenu.multiSelect.select('Blue');

      selectMenu.multiSelect.open();
      selectMenu.multiSelect.options().should('not.contain', 'Blue').and('have.length', 3);
    });

    it('shows "No options" for an unknown term', { tags: '@validation' }, () => {
      selectMenu.multiSelect.search('Orange');

      selectMenu.multiSelect.listbox().should('contain.text', 'No options');
    });

    it('selects multiple values in the native multi-select', () => {
      selectMenu.standardMultiSelect().select(['Volvo', 'Audi']);

      selectMenu.standardMultiSelect().invoke('val').should('deep.equal', ['volvo', 'audi']);
    });
  });
});
