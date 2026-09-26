import students from '../../fixtures/students.json';
import practiceForm from '../../pages/PracticeFormPage';
import { isoDaysFromToday, parseIsoDate, toInputFormat } from '../../support/utils/dates';

describe('Forms - Student Registration (Practice Form)', { tags: ['@forms'] }, () => {
  beforeEach(() => {
    practiceForm.visit();
  });

  context('Successful submission', () => {
    students.complete.forEach((student) => {
      it(`submits a student with ${student.scenario}`, { tags: ['@smoke', '@regression'] }, () => {
        practiceForm.fill(student).submit();

        practiceForm.shouldShowSubmission(practiceForm.expectedSubmission(student));
      });
    });

    it(
      'submits with only the required fields and leaves optional rows empty',
      { tags: '@regression' },
      () => {
        const { requiredOnly } = students;

        practiceForm.fill(requiredOnly).submit();

        practiceForm.shouldShowSubmission(practiceForm.expectedSubmission(requiredOnly));
      },
    );

    // The "Close" button is broken (DEF-004); the backdrop is the working path.
    it('dismisses the confirmation modal and keeps the user on the form', { tags: '@regression' }, () => {
      practiceForm.fill(students.requiredOnly).submit();

      practiceForm.dismissResult();
      cy.location('pathname').should('eq', practiceForm.path);
      practiceForm.field('firstName').should('be.visible');
    });
  });

  context('Validation', { tags: '@validation' }, () => {
    it('blocks an empty submission and flags every required field', () => {
      practiceForm.submit();

      practiceForm.shouldNotBeSubmitted();
      ['firstName', 'lastName', 'mobile'].forEach((field) => practiceForm.field(field).shouldBeInvalid());
      cy.get(practiceForm.selectors.genderRadios).each(($radio) => cy.wrap($radio).shouldBeInvalid());
      practiceForm.field('email').shouldBeValid(); // optional field
    });

    students.invalidMobiles.forEach(({ value, reason }) => {
      it(`rejects a mobile number with ${reason}`, () => {
        const { mobile: _validMobile, ...requiredWithoutMobile } = students.requiredOnly;
        practiceForm.fill(requiredWithoutMobile).typeLikeUser('mobile', value).submit();

        practiceForm.field('mobile').shouldBeInvalid();
        practiceForm.shouldNotBeSubmitted();
      });
    });

    it('limits the mobile number to 10 characters', () => {
      practiceForm.field('mobile').type('123456789012345');

      practiceForm.field('mobile').should('have.value', '1234567890');
    });

    students.invalidEmails.forEach((email) => {
      it(`rejects the malformed email "${email}"`, () => {
        practiceForm.fill({ ...students.requiredOnly, email }).submit();

        practiceForm.field('email').shouldBeInvalid();
        practiceForm.shouldNotBeSubmitted();
      });
    });
  });

  context('Dependent and composite widgets', { tags: '@regression' }, () => {
    it('keeps City disabled until a State is selected', () => {
      practiceForm.city.shouldBeDisabled();

      practiceForm.state.select('Haryana');

      practiceForm.city.input().should('be.enabled');
    });

    Object.entries(students.citiesByState).forEach(([state, cities]) => {
      it(`offers only the cities of ${state}`, () => {
        practiceForm.state.select(state);
        practiceForm.city.open();

        practiceForm.city.options().should(($options) => {
          expect([...$options].map((option) => option.innerText)).to.deep.equal(cities);
        });
      });
    });

    it('adds and removes subjects from the autocomplete', () => {
      practiceForm.subjects.selectMany(['Physics', 'Chemistry', 'Biology'], { search: true });
      practiceForm.subjects.shouldHaveValues(['Physics', 'Chemistry', 'Biology']);

      practiceForm.subjects.remove('Chemistry');

      practiceForm.subjects.shouldHaveValues(['Physics', 'Biology']);
    });

    it('does not add a subject that does not exist', () => {
      practiceForm.subjects.search('Astrology');
      practiceForm.subjects.options().should('not.exist');

      practiceForm.subjects.input().type('{enter}');

      practiceForm.subjects.shouldHaveValues([]);
    });

    it('shows the date picked in the calendar in the input', () => {
      practiceForm.dateOfBirth.pick('1988-12-31');

      practiceForm.field('dateOfBirth').should('have.value', toInputFormat(parseIsoDate('1988-12-31')));
    });
  });

  context('Known defects', { tags: '@known-defect' }, () => {
    it('DEF-001: rejects a Date of Birth in the future', () => {
      const nextYear = isoDaysFromToday(365);

      practiceForm.fill({ ...students.requiredOnly, dateOfBirth: nextYear }).submit();

      practiceForm.shouldNotBeSubmitted();
    });

    it('DEF-004: closes the confirmation modal with the "Close" button', () => {
      practiceForm.fill(students.requiredOnly).submit();

      practiceForm.closeResult();
    });
  });
});
