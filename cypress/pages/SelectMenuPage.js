import BasePage from './BasePage';
import ReactSelect from './components/ReactSelect';

class SelectMenuPage extends BasePage {
  constructor() {
    super({ path: '/select-menu', title: 'Select Menu' });

    this.selectors = {
      oldStyleSelect: '#oldSelectMenu',
      standardMultiSelect: 'select#cars',
    };

    this.selectValue = new ReactSelect(() => cy.get('#withOptGroup'));
    this.selectOne = new ReactSelect(() => cy.get('#selectOne'));
    // The multiselect has no stable id; it is anchored on its visible caption.
    this.multiSelect = new ReactSelect(() => cy.contains('p', 'Multiselect drop down').next());
  }

  oldStyleSelect() {
    return cy.get(this.selectors.oldStyleSelect);
  }

  standardMultiSelect() {
    return cy.get(this.selectors.standardMultiSelect);
  }
}

export default new SelectMenuPage();
