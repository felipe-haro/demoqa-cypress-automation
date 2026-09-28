# Test Summary Report — DemoQA E2E

**Run date:** 2026-09-28 · **Env:** https://demoqa.com (public) · Cypress 15.21.1 · Electron 138 headless ·
Node 24 · Windows 11 · **Command:** `npm test`

## Results

| Suite                           |  Tests | Passed | Failed |        Duration | Notes                                               |
| ------------------------------- | -----: | -----: | -----: | --------------: | --------------------------------------------------- |
| Main suite (`npm test`)         | **75** | **75** |      0 |          2m 05s | 0 retries used                                      |
| Stability runs ×2 (`retries=0`) |  75 ×2 |  75 ×2 |      0 | 2m 05s / 2m 26s | Same result without the retry safety net            |
| Known defects (`@known-defect`) |      7 |      0 |  **7** |          2m 05s | Expected: each one reproduces a DEF in `DEFECTS.md` |

Per area: Practice Form 23 · Web Tables 15 · Text Box 7 · Select Menu 7 · Accessibility 7 · Alerts 6 ·
Modal Dialogs 6 · Radio Button 4. Artifacts: [`docs/results/`](results/) (HTML reports + terminal output).

## Approach and key decisions

- **Risk-based scope.** I chose one page per interaction type in the brief: a complex form (Practice Form),
  CRUD with a modal form (Web Tables), selections (Select Menu, Radio), and dialogs (Alerts, Modals). On each
  page, the happy path comes first, then edge cases: validation, boundaries (maxlength, leap day, accents and
  apostrophes in names), dependent fields (State→City), cancel paths (confirm/prompt), and keyboard (Esc).
- **Page Objects plus components.** Selectors exist only in `cypress/pages`. The three widgets that DemoQA
  reuses (react-select, Bootstrap modal, react-datepicker) are classes composed into pages, so the fix for a
  widget quirk (e.g. the menu toggling on click) is made once and applies everywhere.
- **Data-driven.** 36 of the 75 tests are generated from fixtures or data tables. Faker produces unique Web
  Tables records.
- **Meaningful assertions.** Full-row equality for tables, every row of the submission modal, and the
  HTML5 `checkValidity()` state (custom `shouldBeInvalid`) instead of CSS colors.

## Flakiness — how it was handled

| Observed source                                                                                         | Handling                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ads, trackers and bidding iframes (Google Ads, GTM, OpenX…): slow, cause layout shifts and throw errors | Every non-`demoqa.com` request is stubbed with a 204 (`cy.visitPage`). No global `uncaught:exception` suppression, so real app errors still fail tests. This is how DEF-004 was found. |
| Fixed footer covers elements near the bottom of the viewport                                            | `scrollBehavior: 'center'`, instead of `{ force: true }` (forbidden by lint)                                                                                                           |
| Delayed alert (5 s timer)                                                                               | `cy.clock()` / `cy.tick()`: deterministic and instant, asserted at 4999 ms and 5000 ms                                                                                                 |
| react-select: clicking the control toggles the menu (failed on the 2nd pick)                            | Open with `{downArrow}`, which is idempotent                                                                                                                                           |
| react-select ids (`react-select-4-input`) depend on mount order                                         | Widgets are scoped by stable container or caption, then by ARIA roles                                                                                                                  |
| `minlength` not enforced for synthetic `cy.type()` input                                                | Real CDP keystrokes (`cypress-real-events`) for that check                                                                                                                             |
| `.clear().type()` chains break when React re-renders                                                    | Split into separate commands (`cypress/unsafe-to-chain-command` rule on)                                                                                                               |

No `cy.wait(ms)` in the suite (enforced by ESLint). `retries.runMode: 1` stays only as a safety net and was not needed.

## Findings

8 defects reported in [DEFECTS.md](../DEFECTS.md). The most important is **DEF-004 (High)**: the **Close** button of
the Practice Form confirmation modal throws `TypeError: findDOMNode is not a function` and does not close the
modal. Two other apparent failures were investigated and recorded as **not** defects: the email space is stripped
by the browser, and `minlength` was not enforced only because of the synthetic events described above.

## Known limitations and trade-offs

- **Third-party blocking** gives a deterministic run, but it does not test the page as users see it with ads.
  `--expose blockThirdParty=false` switches it off.
- **A11y** runs axe for _critical_ impact only, and known violations are baselined, so the check catches
  regressions but does not replace a manual WCAG audit.
- **Public, shared environment.** There is no backend state to seed or reset, and data changes do not persist
  between reloads, so every test starts from the seeded state. Site changes can break selectors, which is why
  CI also runs nightly.
- **Coverage:** desktop viewport and Electron locally (Chrome + Electron in CI). There is no mobile layout,
  visual regression or Book Store (auth) flows. See [RECOMMENDATIONS.md](RECOMMENDATIONS.md).
