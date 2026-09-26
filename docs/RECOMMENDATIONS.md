# Recommendations for Improvement

Practical next steps to take this suite from "take-home" to a team-owned asset.

## 1. CI/CD integration

A working pipeline is already included: [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml).

| Stage         | Trigger             | What runs                                     | Blocking? |
| ------------- | ------------------- | --------------------------------------------- | --------- |
| Lint / format | every push & PR     | `npm run lint`, `npm run format:check`        | yes       |
| E2E (PR gate) | every push & PR     | main suite, Chrome + Electron matrix          | yes       |
| Nightly       | `cron` 06:00 UTC    | main suite (external app can change any time) | alerts    |
| Known defects | nightly / manual    | `@known-defect` tests (expected to fail)      | no        |
| Manual        | `workflow_dispatch` | any tag expression, e.g. `@smoke`             | n/a       |

Next steps:

- **Gate by risk, not by volume.** On PRs, run `@smoke` first (under 1 min) and the full `@regression` only
  when smoke passes. In a real product, trigger the smoke suite after each deploy to staging.
- **Parallelize** with the GitHub Actions matrix, splitting by spec file (e.g. `cypress-split`), or with
  Cypress Cloud `--parallel` for load balancing based on history. The suite is already parallel-safe:
  every test is isolated (`testIsolation: true`) and creates its own data.
- **Publish results in the PR.** Upload the Mochawesome HTML report as an artifact (already done) and
  post a JUnit summary with `dorny/test-reporter` so failures appear inline.
- **Notify on nightly failures** (Slack/Teams webhook) with a link to the report artifact.

## 2. Suite organization and tagging

The suite is organized **by feature** (`e2e/<area>/<page>.cy.js`) and uses tags on two levels:

- Feature tags on `describe`: `@forms`, `@elements`, `@widgets`, `@alerts`, `@a11y`
- Intent tags on `it`: `@smoke`, `@regression`, `@validation`, `@known-defect`

Recommended conventions as the suite grows:

- One page object per page; shared widgets (`ReactSelect`, `Modal`, `DatePicker`) live in
  `pages/components` and are **composed** into pages, never copied.
- A new `@known-defect` test **must** reference a `DEF-xxx` id from `DEFECTS.md`. When the bug is fixed,
  the test starts passing: remove the tag and the test becomes a regression guard.
- Keep spec files under ~20 tests. Split by behavior (e.g. `practice-form.validation.cy.js`) before
  they grow beyond that.
- Add `data-testid` attributes in the application (when the team owns it). This is the single biggest
  improvement to selector resilience. DemoQA exposes ids only, some of them duplicated (see DEF-005).

## 3. Test data management

- **Static, reviewable data** in `cypress/fixtures` (students, invalid inputs, a11y baseline). It drives
  data-driven tests, so a new case is a JSON change and needs no new code.
- **Dynamic, unique data** from `support/utils/dataFactory.js` (Faker) for records that must not collide.
- For an application with a backend: seed and clean up through the **API** (`cy.request`) in
  `beforeEach`, never through the UI; use `cy.session` for authentication; and give each CI job its own
  tenant or namespace to allow parallel runs.
- Version the a11y baseline with the code. Reviewing a baseline diff is a conscious decision to accept
  a new violation.

## 4. Flakiness strategy

What is already in place (see `TEST_REPORT.md`):

- Third-party network stubbed (ads, trackers), with no blanket `uncaught:exception` suppression
- No `cy.wait(ms)`: virtual clock (`cy.clock`/`cy.tick`) for timers, retry-able assertions everywhere
- Real CDP input (`cypress-real-events`) where synthetic events do not reproduce browser behavior
- `retries.runMode: 1` as a **safety net only**. A test that passes on retry is still reported as flaky.

Next steps:

- **Track flaky tests explicitly** (Cypress Cloud Flaky Test Management, or parse retry data from the
  Mochawesome JSON) and quarantine any test above 2% flake rate under a `@quarantine` tag with a ticket.
- **Burn-in new tests** before merge: `npx cypress run --spec <file> --expose burn=10` (supported by
  `@cypress/grep`).

## 5. Metrics to track

| Metric                                  | Why                                              | Target              |
| --------------------------------------- | ------------------------------------------------ | ------------------- |
| Pass rate (excl. known defects)         | Suite health                                     | 100% on `main`      |
| Flake rate (passed-on-retry / total)    | Trust in the signal                              | < 2%                |
| Suite duration (p50 / p95)              | Feedback speed. Drives parallelization decisions | Smoke < 1 min       |
| Defects found by automation vs. escaped | Effectiveness of coverage                        | Trend up            |
| Mean time to fix a red build            | Team responsiveness                              | < 1 day             |
| Critical a11y violations (count)        | Accessibility debt (baseline size)               | Trend down to 0     |
| Coverage of critical user journeys      | Risk-based coverage, not the raw test count      | 100% of P1 journeys |

## 6. Further extensions

- Visual regression for the submission modal and tables (e.g. Percy or `cypress-image-diff`).
- API-level contract checks for the Book Store API (`/Account`, `/BookStore`) that also exists on DemoQA.
- Responsive runs (mobile viewport) as a separate tagged job. The site's layout changes noticeably.
- Migrate to TypeScript for typed page objects and fixtures once the suite is shared by several people.
