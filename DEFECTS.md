# Defect Report — DemoQA

All defects below were **observed on https://demoqa.com during this work** (September 2026, Cypress 15.21 on Electron 138 / Chromium,
viewport 1366×900). Every defect except DEF-006 has an automated reproduction tagged `@known-defect`, which is
**expected to fail** until the application is fixed:

```bash
npm run test:known-defects
```

Screenshots were captured automatically by Cypress on failure and are stored in [`docs/evidence/`](docs/evidence).

| ID      | Title                                                                             | Severity | Priority | Automated check                                 |
| ------- | --------------------------------------------------------------------------------- | -------- | -------- | ----------------------------------------------- |
| DEF-004 | Practice Form: "Close" button of the confirmation modal crashes, modal stays open | High     | High     | `forms/practice-form.cy.js` → `DEF-004`         |
| DEF-001 | Practice Form accepts a Date of Birth in the future (and defaults to today)       | Medium   | Medium   | `forms/practice-form.cy.js` → `DEF-001`         |
| DEF-007 | Practice Form keeps the old City after the State changes (invalid pair submitted) | Medium   | Medium   | `forms/practice-form.cy.js` → `DEF-007`         |
| DEF-002 | Text Box keeps showing stale output after an invalid re-submission                | Medium   | Low      | `elements/text-box.cy.js` → `DEF-002`           |
| DEF-008 | Web Tables accepts a duplicate email when adding or editing a record              | Medium   | Low      | `elements/web-tables.cy.js` → `DEF-008`         |
| DEF-005 | Critical accessibility violations (missing labels, alt text, names)               | Medium   | Medium   | `accessibility/accessibility.cy.js` → `DEF-005` |
| DEF-003 | Web Tables shows "Page 1 of 0" and no empty-state for a search with no results    | Low      | Low      | `elements/web-tables.cy.js` → `DEF-003`         |
| DEF-006 | Typos in user-facing text ("Permananet", "Voilet")                                | Low      | Low      | Evidence from the DOM (no test, see notes)      |

**Severity** = impact on the user or data if it happens. **Priority** = how soon it should be fixed,
considering severity, frequency and whether a workaround exists.

---

## DEF-004 — Practice Form: "Close" button of the confirmation modal throws a TypeError and the modal stays open

- **Page:** `/automation-practice-form`
- **Severity:** High. The main control to dismiss the result of the page's primary flow does not work,
  and the app throws an unhandled JavaScript exception.
- **Priority:** High. Every user who submits the form hits it. A workaround exists (clicking outside the
  modal), but it is not discoverable.

**Steps to reproduce**

1. Open `https://demoqa.com/automation-practice-form`.
2. Fill in First Name `Ada`, Last Name `Lovelace`, Gender `Other`, Mobile `1234567890`.
3. Click **Submit**. The "Thanks for submitting the form" modal opens.
4. Click the **Close** button at the bottom of the modal.

**Expected:** the modal closes and the user is back on the form.

**Actual:** nothing visible happens and the modal stays open. The browser console shows an uncaught exception:

```
TypeError: Lr.findDOMNode is not a function
    at onClick (https://demoqa.com/assets/index-D_rDx8ml.js:36:57250)
```

Clicking the backdrop (outside the modal) closes it without errors.

**Notes / probable cause:** `ReactDOM.findDOMNode` was removed in React 19. A dependency used by this modal's
close handler (probably a transition/animation helper) still calls it. The modals on `/modal-dialogs` and the
Web Tables registration modal close correctly, so the problem is specific to this handler.

**Evidence:** `docs/evidence/DEF-004-close-button-typeerror.png`. The Cypress log shows the
`(uncaught exception) TypeError: Lr.findDOMNode is not a function` entry on the `click` command.

---

## DEF-001 — Practice Form accepts a Date of Birth in the future

- **Page:** `/automation-practice-form`
- **Severity:** Medium. Invalid data (a student not born yet) is accepted and "registered". The field also
  defaults to **today's date**, so a user who skips it submits a newborn's birth date without noticing.
- **Priority:** Medium. It is a data-integrity rule that is easy to fix (`maxDate` on the datepicker plus a
  submit validation), but it does not block the flow.

**Steps to reproduce**

1. Open `https://demoqa.com/automation-practice-form`.
2. Fill in the required fields (First Name, Last Name, Gender, Mobile `1234567890`).
3. Open **Date of Birth** and select any date in the future (e.g. one year from today).
4. Click **Submit**.

**Expected:** future dates cannot be selected, or submitting shows a validation error on Date of Birth.

**Actual:** the form is submitted, and the confirmation modal lists the future date as the student's
Date of Birth.

**Evidence:** `docs/evidence/DEF-001-future-date-of-birth.png`

---

## DEF-002 — Text Box keeps showing stale output after an invalid re-submission

- **Page:** `/text-box`
- **Severity:** Medium. The page shows data that no longer matches the form (the old email next to a field
  marked invalid), which can mislead the user into thinking the new value was accepted.
- **Priority:** Low. This is a demo component without persistence.

**Steps to reproduce**

1. Open `https://demoqa.com/text-box`.
2. Fill in Full Name `Ana Souza`, Email `ana.souza@qa.example.com` and both addresses, then click **Submit**.
   The output panel shows the data.
3. Replace the email with `not-an-email` and click **Submit** again.

**Expected:** the output panel is cleared (or updated), because the current submission is invalid.

**Actual:** the email field gets the red `field-error` border, but the output panel still shows
`Email:ana.souza@qa.example.com` from the previous submission.

**Evidence:** `docs/evidence/DEF-002-stale-output.png`

---

## DEF-007 — Practice Form keeps the previously selected City after the State changes

- **Page:** `/automation-practice-form`
- **Severity:** Medium. The form submits a combination that cannot exist (e.g. "Haryana Delhi"), so the
  registered address is wrong. The user sees nothing wrong in the UI.
- **Priority:** Medium. It affects any user who corrects their State. The fix is small: clear City when State
  changes.

**Steps to reproduce**

1. Open `https://demoqa.com/automation-practice-form`.
2. Select State **NCR**, then City **Delhi**.
3. Change State to **Haryana**.
4. Fill in the required fields (First Name, Last Name, Gender, Mobile `1234567890`) and click **Submit**.

**Expected:** after step 3, City is cleared, because Delhi does not belong to Haryana. The user has to pick a
Haryana city (Karnal or Panipat).

**Actual:** City still shows **Delhi**, although its dropdown now lists only Karnal and Panipat. The confirmation
modal shows **State and City: "Haryana Delhi"**.

**Evidence:** `docs/evidence/DEF-007-stale-city-after-state-change.png`

---

## DEF-008 — Web Tables accepts a duplicate email when adding or editing a record

- **Page:** `/webtables`
- **Severity:** Medium. Email is the only field that identifies a person in this table. Duplicates make records
  ambiguous, and any lookup, edit or delete by email can hit the wrong row.
- **Priority:** Low. This is a demo table without persistence. In a real CRUD, this would be Medium/High.

**Steps to reproduce**

1. Open `https://demoqa.com/webtables`.
2. Click **Add** and fill in any valid data, using Email **`cierra@example.com`** (it belongs to an existing record).
3. Click **Submit**.

The same happens when you **edit** an existing record (e.g. Alden) and change its email to `cierra@example.com`.

**Expected:** the form stays open with a validation message such as "Email already exists", and no record is
created or changed.

**Actual:** the record is saved, and the table shows **two rows** with `cierra@example.com`.

**Evidence:** `docs/evidence/DEF-008-duplicate-email.png`

---

## DEF-005 — Critical accessibility violations on every tested page

- **Pages:** all six tested pages
- **Severity:** Medium. These are WCAG 2.1 level A failures (1.1.1 Non-text Content, 1.3.1 Info and
  Relationships, 4.1.2 Name, Role, Value). Screen-reader users cannot identify several form fields.
- **Priority:** Medium. Most fixes are one-line markup changes (`for`/`htmlFor`, `alt`, `aria-label`).

**Steps to reproduce:** run axe-core (browser extension, or `npm run test:a11y`) on the pages below.

**Expected:** no critical violations.

**Actual:** critical violations found by axe-core 4.13 (ads excluded from the scan):

| Page          | `image-alt` | `label` | `select-name` | `button-name` |
| ------------- | :---------: | :-----: | :-----------: | :-----------: |
| Practice Form |      1      |    4    |               |               |
| Text Box      |      1      |    1    |               |               |
| Web Tables    |      1      |         |       1       |       1       |
| Select Menu   |      1      |    3    |       2       |               |
| Alerts        |      1      |         |               |               |
| Modal Dialogs |      1      |         |               |               |

- `image-alt`: the ToolsQA header logo (`header img`) has no `alt`, on every page.
- `label`: `<label>` elements are not associated with their inputs (no `for` attribute).
- `select-name`: the "Show N rows" select (Web Tables) and native selects on Select Menu have no accessible name.
- `button-name`: the search button in Web Tables contains only an icon.

Related markup issue found during selector design: **duplicate `id`s**. `id="subjects-label"` is used for
the Subjects, Hobbies **and** Picture labels on the Practice Form, and `id="currentAddress"` is used for
both the textarea and the output line on Text Box.

**Evidence:** terminal table printed by `cy.checkPageA11y` (see `docs/results/run-output.txt`) and
`docs/evidence/DEF-005-a11y-practice-form.png`.

**How the suite handles it:** the known violations are recorded in `cypress/fixtures/a11yBaseline.json`.
The a11y tests fail only on **new** critical violations, and `DEF-005` checks the Practice Form strictly.

---

## DEF-003 — Web Tables: "Page 1 of 0" and no empty-state message when a search has no results

- **Page:** `/webtables`
- **Severity:** Low. It is a cosmetic/UX problem, and no data is lost.
- **Priority:** Low

**Steps to reproduce**

1. Open `https://demoqa.com/webtables`.
2. Type `no-such-employee` in the search box.

**Expected:** an empty-state message such as "No rows found", and pagination showing `Page 1 of 1` (or hidden).

**Actual:** the table body is empty with no message, and the pagination reads **`Page 1 of 0`**, which is
not possible.

**Evidence:** `docs/evidence/DEF-003-page-1-of-0.png`

---

## DEF-006 — Typos in user-facing text

- **Severity:** Low. **Priority:** Low. These are cosmetic, but they appear in content users read and that tests
  assert on.

| Page           | Where                            | Actual                 | Expected             |
| -------------- | -------------------------------- | ---------------------- | -------------------- |
| `/text-box`    | Output panel after Submit        | `Permananet Address :` | `Permanent Address:` |
| `/select-menu` | "Old Style Select Menu" option 8 | `Voilet`               | `Violet`             |

**Notes:** the "Prompt" button id on `/alerts` is `promtButton` (sic). It is not user-facing, but it leaks into
test code. The page object hides it behind the `promptButton` key.

**Evidence:** DOM snapshot, e.g. `<p id="permanentAddress">Permananet Address :…</p>` and
`<option value="7">Voilet</option>`.

---

## Investigated and **not** reported

Two apparent failures turned out not to be application defects:

- **Email with a space accepted on Text Box.** The field is `type="email"`, and the browser strips the space
  while typing (`ana souza@…` becomes `anasouza@…`), so the value submitted is valid. The case was removed
  from the test data.
- **9-digit mobile accepted by `cy.type()`.** Browsers evaluate `minlength` only for values edited by a real
  user. Synthetic events did not trigger it. With real CDP keyboard input (`cypress-real-events`), the field is
  correctly invalid, so this was a tooling limitation.
