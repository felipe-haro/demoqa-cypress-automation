import alerts from '../../pages/AlertsPage';

describe('Alerts - Browser dialogs', { tags: ['@alerts'] }, () => {
  it('shows a simple alert with the expected message', { tags: ['@smoke', '@regression'] }, () => {
    alerts.visit();
    const onAlert = cy.stub().as('alert');
    cy.on('window:alert', onAlert);

    alerts.click('alertButton');

    cy.get('@alert').should('have.been.calledOnceWith', 'You clicked a button');
  });

  it(
    'opens the delayed alert after exactly 5 seconds (virtual clock, no real wait)',
    { tags: '@regression' },
    () => {
      // cy.clock replaces the 5s real wait with a deterministic virtual timer.
      cy.clock();
      alerts.visit();
      const onAlert = cy.stub().as('alert');
      cy.on('window:alert', onAlert);

      alerts.click('timerAlertButton');

      cy.tick(4999);
      cy.get('@alert').should('not.have.been.called');
      cy.tick(1);
      cy.get('@alert').should('have.been.calledOnceWith', 'This alert appeared after 5 seconds');
    },
  );

  [
    { accept: true, expected: 'You selected Ok' },
    { accept: false, expected: 'You selected Cancel' },
  ].forEach(({ accept, expected }) => {
    it(
      `reports "${expected}" when the confirm box is ${accept ? 'accepted' : 'dismissed'}`,
      { tags: '@regression' },
      () => {
        alerts.visit();
        cy.on('window:confirm', (message) => {
          expect(message).to.equal('Do you confirm action?');
          return accept;
        });

        alerts.click('confirmButton');

        alerts.confirmResult().should('have.text', expected);
      },
    );
  });

  it('echoes the name typed into the prompt', { tags: '@regression' }, () => {
    alerts.visit();
    cy.window().then((win) => cy.stub(win, 'prompt').as('prompt').returns('Felipe'));

    alerts.click('promptButton');

    cy.get('@prompt').should('have.been.calledOnceWith', 'Please enter your name');
    alerts.promptResult().should('have.text', 'You entered Felipe');
  });

  it('shows no result when the prompt is cancelled', { tags: '@validation' }, () => {
    alerts.visit();
    cy.window().then((win) => cy.stub(win, 'prompt').as('prompt').returns(null));

    alerts.click('promptButton');

    cy.get('@prompt').should('have.been.calledOnce');
    alerts.promptResult().should('not.exist');
  });
});
