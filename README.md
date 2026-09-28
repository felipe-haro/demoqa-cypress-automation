# DemoQA — Cypress E2E Automation

[![E2E tests](https://github.com/felipe-haro/demoqa-cypress-automation/actions/workflows/e2e.yml/badge.svg)](https://github.com/felipe-haro/demoqa-cypress-automation/actions/workflows/e2e.yml)

End-to-end test suite for [demoqa.com](https://demoqa.com) built with **Cypress 15 + JavaScript**. It covers
forms, selections, dialogs and data tables with a Page Object Model, reusable widget components,
data-driven tests, lightweight accessibility checks and a GitHub Actions pipeline.

> 📄 **Deliverables:** [Test Report](docs/TEST_REPORT.md) · [Defects](DEFECTS.md) · [Bug reports](docs/bug-reports/) · [Issues](https://github.com/felipe-haro/demoqa-cypress-automation/issues) ·
> [Recommendations](docs/RECOMMENDATIONS.md) · [Run output](docs/results/)

---

## What is covered

| Area             | Page                                                         | Highlights                                                                                                                      |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Forms            | [Practice Form](https://demoqa.com/automation-practice-form) | Data-driven full submissions, required-only path, field validation, dependent State→City, autocomplete, datepicker, file upload |
| Elements         | [Text Box](https://demoqa.com/text-box)                      | Output rendering, partial input, invalid emails                                                                                 |
| Elements         | [Radio Button](https://demoqa.com/radio-button)              | Selection, mutual exclusion, disabled option                                                                                    |
| Elements         | [Web Tables](https://demoqa.com/webtables)                   | Full CRUD, search by column, form validation, input limits                                                                      |
| Widgets          | [Select Menu](https://demoqa.com/select-menu)                | Grouped/single/multi react-select, native select and multi-select                                                               |
| Alerts & dialogs | [Alerts](https://demoqa.com/alerts)                          | alert / delayed alert (virtual clock) / confirm accept+dismiss / prompt value+cancel                                            |
| Alerts & dialogs | [Modal Dialogs](https://demoqa.com/modal-dialogs)            | Open/close via button, "X", backdrop, Escape, reopen                                                                            |
| Accessibility    | all pages above                                              | axe-core scan for critical issues with a known-violations baseline                                                              |

The **main suite has 75 tests** (~2 min). Another 7 tests tagged `@known-defect` reproduce the bugs listed in
[DEFECTS.md](DEFECTS.md).

## Tech stack

| Purpose             | Tool                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Test runner         | [Cypress 15](https://www.cypress.io/) (JavaScript)                                                                             |
| Reporting           | [cypress-mochawesome-reporter](https://github.com/LironEr/cypress-mochawesome-reporter): HTML report with embedded screenshots |
| Tagging / filtering | [@cypress/grep](https://github.com/cypress-io/cypress/tree/develop/npm/grep)                                                   |
| Accessibility       | [cypress-axe](https://github.com/component-driven/cypress-axe) + axe-core                                                      |
| Real browser input  | [cypress-real-events](https://github.com/dmtrKovalenko/cypress-real-events) (CDP)                                              |
| Test data           | JSON fixtures + [@faker-js/faker](https://fakerjs.dev/)                                                                        |
| Code quality        | ESLint 10 (`eslint-plugin-cypress`) + Prettier                                                                                 |
| CI                  | GitHub Actions (`.github/workflows/e2e.yml`)                                                                                   |

## Project structure

```
.
├── cypress/
│   ├── e2e/                          # Specs, grouped by feature area
│   │   ├── accessibility/
│   │   ├── alerts-frames-windows/    # alerts.cy.js, modal-dialogs.cy.js
│   │   ├── elements/                 # text-box, radio-button, web-tables
│   │   ├── forms/                    # practice-form.cy.js
│   │   └── widgets/                  # select-menu.cy.js
│   ├── fixtures/                     # Test data (data-driven cases, a11y baseline, upload file)
│   ├── pages/                        # Page Objects — selectors live ONLY here
│   │   ├── components/               # Reusable widgets: ReactSelect, Modal, DatePicker
│   │   └── BasePage.js
│   └── support/
│       ├── commands.js               # Custom commands (visitPage, shouldBeInvalid, checkPageA11y…)
│       ├── e2e.js                    # Plugin registration
│       └── utils/                    # dataFactory (Faker), dates, network allow-list
├── docs/                             # Test report, recommendations, results and evidence
├── DEFECTS.md
├── cypress.config.js                 # baseUrl, timeouts, retries, reporter, plugins
└── .github/workflows/e2e.yml         # CI pipeline
```

## Prerequisites

- **Node.js 20+** (tested with Node 24) and npm
- Git
- Google Chrome (optional). Cypress ships with Electron, which is the default browser.

## Install

```bash
git clone https://github.com/felipe-haro/demoqa-cypress-automation.git
cd demoqa-cypress-automation
npm ci
```

`npm ci` also downloads the Cypress binary (~500 MB, first time only).

## Run

| Command                                 | What it does                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| **`npm test`**                          | **Main suite, headless** (Electron). Excludes `@known-defect`. Cleans old reports first. |
| `npm run test:headed`                   | Main suite with a visible browser                                                        |
| `npm run test:chrome`                   | Main suite in Chrome (headless)                                                          |
| `npm run cy:open`                       | Cypress interactive runner (pick specs, time-travel debugging)                           |
| `npm run test:smoke`                    | Only `@smoke` tests (10 tests, 1–2 per page)                                             |
| `npm run test:a11y`                     | Only accessibility checks                                                                |
| `npm run test:known-defects`            | Reproduces the bugs from `DEFECTS.md`. **Expected to fail.**                             |
| `npm run test:all`                      | Everything, including known defects                                                      |
| `npm run lint` / `npm run format:check` | ESLint / Prettier                                                                        |

Any tag expression can be combined through `@cypress/grep`:

```bash
npx cypress run --expose grepTags="@forms+@validation"   # forms AND validation
npx cypress run --expose grepTags="@elements @widgets"   # elements OR widgets
npx cypress run --expose grep="Web Tables"               # by title
```

**Tags:** feature: `@forms` `@elements` `@widgets` `@alerts` `@a11y` · intent: `@smoke` `@regression`
`@validation` `@known-defect`

## Viewing results

After `npm test`:

- **HTML report:** `reports/html/index.html`. It is a single self-contained file with charts, and screenshots
  of failed tests are embedded.
- **Screenshots of failures:** `reports/screenshots/`
- **Terminal:** Cypress summary table, plus an accessibility violations table for each page.
- **CI:** each workflow run uploads `reports/` as the artifact `cypress-report-<browser>`.

A snapshot of the latest local run is committed in [`docs/results/`](docs/results/).

## Configuration

`cypress.config.js`: `baseUrl: https://demoqa.com`, viewport 1366×900, `defaultCommandTimeout` 8 s,
`pageLoadTimeout` 60 s, `retries` 1 in run mode (0 in open mode), and `scrollBehavior: 'center'`.

Runtime switches (`--expose key=value`):

| Key                | Default | Purpose                                                               |
| ------------------ | ------- | --------------------------------------------------------------------- |
| `blockThirdParty`  | `true`  | Stub ads/trackers. Set to `false` to reproduce the "real" noisy page. |
| `grepTags`, `grep` | –       | Filter tests (see above)                                              |

## Key design decisions

- **Page Object Model with composition.** Specs never contain selectors. DemoQA reuses the same widgets
  on many pages (react-select, Bootstrap modal, react-datepicker), so each one is a component class that
  pages **compose**. `ReactSelect` is used 6 times across 2 pages.
- **Resilient locators.** Stable ids where they exist, ARIA roles/labels for widgets
  (`[role="option"]`, `[aria-label="Remove Blue"]`), visible text for user-facing choices, and never
  generated CSS classes (`css-13cymwt-control`) or `react-select-N` ids.
- **Data-driven tests.** Students, invalid inputs, state→city mapping and search cases live in fixtures
  or in small tables inside the spec. A new case is a data change.
- **Flakiness handled at the source.** See [Test Report → Flakiness](docs/TEST_REPORT.md#flakiness--how-it-was-handled).
- **Known defects stay visible.** Bugs are reproduced by `@known-defect` tests. They are excluded from the
  gate but run nightly, and the gate stays green without hiding them.

## Troubleshooting

| Symptom                                           | Fix                                                                                                                                                                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cypress.exe: bad option: --smoke-test` (Windows) | The terminal inherited `ELECTRON_RUN_AS_NODE=1` (common in VS Code-based tools). Run `set ELECTRON_RUN_AS_NODE=` (cmd), `$env:ELECTRON_RUN_AS_NODE=$null` (PowerShell) or `unset ELECTRON_RUN_AS_NODE` (bash). |
| Slow first run / timeouts on `visit`              | DemoQA is a public site. Re-run, or raise `pageLoadTimeout` in `cypress.config.js`.                                                                                                                            |
| Report not generated                              | Make sure the run was not interrupted. The report is written in the `after:run` hook.                                                                                                                          |
