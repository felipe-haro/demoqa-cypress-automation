import { isoDaysFromToday, parseIsoDate, toSubmissionFormat } from '../support/utils/dates';
import BasePage from './BasePage';
import DatePicker from './components/DatePicker';
import Modal from './components/Modal';
import ReactSelect from './components/ReactSelect';

class PracticeFormPage extends BasePage {
  constructor() {
    super({ path: '/automation-practice-form', title: 'Practice Form' });

    this.selectors = {
      form: '#userForm',
      firstName: '#firstName',
      lastName: '#lastName',
      email: '#userEmail',
      gender: (value) => `input[name="gender"][value="${value}"]`,
      genderRadios: 'input[name="gender"]',
      mobile: '#userNumber',
      dateOfBirth: '#dateOfBirthInput',
      hobbies: '#hobbiesWrapper',
      picture: '#uploadPicture',
      address: 'textarea#currentAddress',
      submit: '#submit',
      closeResult: '#closeLargeModal',
    };

    this.dateOfBirth = new DatePicker(this.selectors.dateOfBirth);
    this.subjects = new ReactSelect(() => cy.get('#subjectsContainer'));
    this.state = new ReactSelect(() => cy.get('#state'));
    this.city = new ReactSelect(() => cy.get('#city'));
    this.resultModal = new Modal();
  }

  field(name) {
    return cy.get(this.selectors[name]);
  }

  /**
   * Types with real CDP keyboard events. Needed for `minlength`: browsers only
   * evaluate `tooShort` for values edited by the user, which synthetic
   * `cy.type()` events do not count as.
   */
  typeLikeUser(name, value) {
    this.field(name).clear();
    this.field(name).focus();
    cy.realType(value);
    return this;
  }

  chooseGender(gender) {
    cy.get(this.selectors.gender(gender)).check();
    return this;
  }

  toggleHobby(hobby) {
    cy.get(this.selectors.hobbies).contains('label', hobby).click();
    return this;
  }

  uploadPicture(fileName) {
    cy.get(this.selectors.picture).selectFile(`cypress/fixtures/files/${fileName}`);
    return this;
  }

  /**
   * Fills any subset of the form. Keys map to the fixture format in
   * `cypress/fixtures/students.json`; missing keys are skipped.
   */
  fill(student) {
    const {
      firstName,
      lastName,
      email,
      gender,
      mobile,
      dateOfBirth,
      subjects = [],
      hobbies = [],
      picture,
      address,
      state,
      city,
    } = student;

    this.field('firstName').typeIfPresent(firstName);
    this.field('lastName').typeIfPresent(lastName);
    this.field('email').typeIfPresent(email);
    if (gender) this.chooseGender(gender);
    this.field('mobile').typeIfPresent(mobile);
    if (dateOfBirth) this.dateOfBirth.pick(dateOfBirth);
    this.subjects.selectMany(subjects, { search: true });
    hobbies.forEach((hobby) => this.toggleHobby(hobby));
    if (picture) this.uploadPicture(picture);
    this.field('address').typeIfPresent(address);
    if (state) this.state.select(state);
    if (city) this.city.select(city);
    return this;
  }

  submit() {
    cy.get(this.selectors.submit).click();
    return this;
  }

  /** Value cell for a given label in the "Thanks for submitting" modal. */
  submittedValue(label) {
    return this.resultModal.body().contains('td', label).next('td');
  }

  /**
   * Maps a student fixture to the rows rendered in the submission modal.
   * `dateOfBirth` falls back to today, which is the form's default value.
   */
  expectedSubmission(student) {
    const {
      firstName,
      lastName,
      email = '',
      gender,
      mobile,
      dateOfBirth = isoDaysFromToday(0),
      subjects = [],
      hobbies = [],
      picture = '',
      address = '',
      state,
      city,
    } = student;

    return {
      'Student Name': `${firstName} ${lastName}`,
      'Student Email': email,
      Gender: gender,
      Mobile: mobile,
      'Date of Birth': toSubmissionFormat(parseIsoDate(dateOfBirth)),
      Subjects: subjects.join(', '),
      Hobbies: hobbies.join(', '),
      Picture: picture,
      Address: address,
      'State and City': [state, city].filter(Boolean).join(' '),
    };
  }

  /** @param {Record<string, string>} expected label -> value */
  shouldShowSubmission(expected) {
    this.resultModal.shouldBeOpen('Thanks for submitting the form');
    Object.entries(expected).forEach(([label, value]) => {
      this.submittedValue(label).should('have.text', value);
    });
    return this;
  }

  /** Closes the result modal with its "Close" button (broken, see DEF-004). */
  closeResult() {
    cy.get(this.selectors.closeResult).click();
    this.resultModal.shouldBeClosed();
    return this;
  }

  /** Dismisses the result modal by clicking outside it (DEF-004 workaround). */
  dismissResult() {
    this.resultModal.closeWithBackdrop().shouldBeClosed();
    return this;
  }

  shouldNotBeSubmitted() {
    cy.get(this.selectors.form).should('have.class', 'was-validated');
    this.resultModal.shouldBeClosed();
    return this;
  }
}

export default new PracticeFormPage();
