import BasePage from './BasePage';

class AlertsPage extends BasePage {
  constructor() {
    super({ path: '/alerts', title: 'Alerts' });

    this.selectors = {
      alertButton: '#alertButton',
      timerAlertButton: '#timerAlertButton',
      confirmButton: '#confirmButton',
      promptButton: '#promtButton', // sic: typo in the application id
      confirmResult: '#confirmResult',
      promptResult: '#promptResult',
    };
  }

  click(button) {
    cy.get(this.selectors[button]).click();
    return this;
  }

  confirmResult() {
    return cy.get(this.selectors.confirmResult);
  }

  promptResult() {
    return cy.get(this.selectors.promptResult);
  }
}

export default new AlertsPage();
