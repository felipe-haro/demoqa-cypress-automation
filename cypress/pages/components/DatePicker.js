import { parseIsoDate } from '../../support/utils/dates';

/**
 * react-datepicker helper. Picks a date through the UI (month/year dropdowns
 * + day cell) instead of typing, because typing into this input appends to the
 * existing value and is a well-known source of flaky tests.
 */
export default class DatePicker {
  constructor(inputSelector) {
    this.inputSelector = inputSelector;
  }

  input() {
    return cy.get(this.inputSelector);
  }

  /** @param {string} isoDate YYYY-MM-DD */
  pick(isoDate) {
    const { year, monthIndex, day } = parseIsoDate(isoDate);
    const dayClass = `.react-datepicker__day--${String(day).padStart(3, '0')}`;

    this.input().click();
    cy.get('.react-datepicker__year-select').select(String(year));
    cy.get('.react-datepicker__month-select').select(String(monthIndex));
    cy.get(`${dayClass}:not(.react-datepicker__day--outside-month)`).click();
    cy.get('.react-datepicker__month-container').should('not.exist');
    return this;
  }
}
