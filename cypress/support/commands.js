import { isThirdParty } from './utils/network';

/**
 * Stubs every third-party request (ads, trackers, iframes) with an empty 204.
 * Can be disabled with `--expose blockThirdParty=false` to reproduce the
 * "real world" page when investigating flakiness.
 */
Cypress.Commands.add('blockThirdPartyRequests', () => {
  if (Cypress.expose('blockThirdParty') === false) return;

  cy.intercept({ url: /^https?:\/\// }, (req) => {
    if (isThirdParty(req.url)) {
      req.reply({ statusCode: 204, body: '' });
    }
  });
});

/** Visits a DemoQA route with third-party noise removed. */
Cypress.Commands.add('visitPage', (path, options = {}) => {
  cy.blockThirdPartyRequests();
  cy.visit(path, options);
});

/**
 * Asserts the HTML5 constraint-validation state of a field. Retries until the
 * expectation is met, so it works with React re-renders.
 *
 * @example cy.get('#userNumber').shouldBeInvalid()
 */
Cypress.Commands.add('shouldBeInvalid', { prevSubject: 'element' }, (subject) =>
  cy.wrap(subject, { log: false }).should(($el) => {
    expect($el[0].checkValidity(), `"${$el.attr('id')}" is valid`).to.equal(false);
  }),
);

Cypress.Commands.add('shouldBeValid', { prevSubject: 'element' }, (subject) =>
  cy.wrap(subject, { log: false }).should(($el) => {
    expect($el[0].checkValidity(), `"${$el.attr('id')}" is valid`).to.equal(true);
  }),
);

/**
 * Types only when a value is provided. Keeps page-object "fill" methods
 * data-driven: fixtures can omit optional fields.
 */
Cypress.Commands.add('typeIfPresent', { prevSubject: 'element' }, (subject, value) => {
  if (value === undefined || value === null || value === '') return cy.wrap(subject);
  cy.wrap(subject).clear();
  return cy.wrap(subject).type(String(value));
});

/**
 * Runs axe-core against the current page (ad containers excluded), prints a
 * table of violations to the terminal and fails only on violations that are
 * not part of the known baseline.
 *
 * @param {object} options
 * @param {string} options.label     name used in logs
 * @param {string[]} options.impacts axe impact levels to evaluate
 * @param {string[]} options.known   rule ids already reported as defects
 */
Cypress.Commands.add('checkPageA11y', ({ label = 'page', impacts = ['critical'], known = [] } = {}) => {
  const context = {
    exclude: [['[id^="Ad.Plus"]'], ['#RightSide_Advertisement'], ['iframe']],
  };
  let violations = [];

  cy.injectAxe();
  cy.checkA11y(context, { includedImpacts: impacts }, (found) => (violations = found), true);

  cy.then(() => {
    const rows = violations.map(({ id, impact, nodes, description }) => ({
      rule: id,
      impact,
      nodes: nodes.length,
      status: known.includes(id) ? 'known' : 'NEW',
      description: description.slice(0, 70),
    }));
    cy.task('log', `\n[a11y] ${label}: ${rows.length} ${impacts.join('/')} violation(s)`);
    if (rows.length) cy.task('table', rows);

    const unexpected = rows.filter((row) => row.status === 'NEW').map((row) => row.rule);
    expect(unexpected, `unexpected ${impacts.join('/')} a11y violations on ${label}`).to.be.empty;
  });
});
