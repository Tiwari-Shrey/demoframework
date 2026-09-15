# ASWatson Automation

Playwright + TypeScript automation framework. The active suite automates
[demoblaze.com](https://www.demoblaze.com/) — a public demo e‑commerce site —
covering **login**, **product search/browse**, and **add to cart** flows.

## Tech Stack

- Playwright (`@playwright/test`)
- TypeScript
- Node.js (CommonJS project mode)
- `xlsx` for optional Excel-driven test data

## Project Structure (high level)

- `tests/ui/` — active spec files: `login.spec.ts`, `search-product.spec.ts`, `add-to-cart.spec.ts`
- `pages/common/LoginPage.ts` — nav-bar Sign up / Log in / Log out modals (shared across all specs)
- `pages/ui/` — `HomePage.ts` (catalog/category filters), `ProductDetailsPage.ts`, `CartPage.ts`
- `core/fixtures/ui.fixture.ts` — Playwright fixtures wiring the page objects to a shared browser page
  - `test` — guest session (no login), used by `search-product.spec.ts` and most of `login.spec.ts`
  - `authTest` — pre-authenticated session, used by `add-to-cart.spec.ts`
- `core/fixtures/auth.fixture.ts` / `core/base/Hooks.ts` — shared login helpers (`login()`, `createAuthedPage()`, `createGuestPage()`)
- `core/config/environment.ts` — reads `.env` (`BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`)
- `core/utils/ExcelReader.ts` — generic helper to read any `.xlsx` sheet into row objects
- `core/utils/LoginCredentials.ts` — Excel-driven login credential override (see below)
- `testdata/shared/login-data.ts` — resolved base URL / credentials / alert-text constants
- `testdata/ui/products-data.ts` — expected product catalog data used in assertions
- `testdata/ui/login-credentials.xlsx` — Excel sheet with login credentials, keyed by `TEST_FLOW`
- `playwright.config.js` — Playwright runtime configuration

> Other top-level folders (`api/`, `batch/`, `database/`, `tests/pogc`, `tests/Workflows`, etc.) are
> leftover scaffolding from a previous project and are not used by the current demoblaze suite.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browser binaries:

```bash
npx playwright install
```

3. Create a `.env` file (copy `.env.example`) with your base URL and login credentials:

```
BASE_URL=https://www.demoblaze.com
TEST_USERNAME=yourusername
TEST_PASSWORD=yourpassword
```

All three have fallback defaults in `core/config/environment.ts`, so the suite runs even
without a `.env` file — but `TEST_USERNAME` / `TEST_PASSWORD` back the account used by
`add-to-cart.spec.ts` (via a `_cart_<pid>` suffixed variant) and the fallback account in
`login.spec.ts`.

## Run Tests — Normal Mode (no Excel data)

This is the default behavior — no setup required beyond `.env`.

```bash
# run everything
npx playwright test

# run one spec file
npx playwright test tests/ui/login.spec.ts
npx playwright test tests/ui/search-product.spec.ts
npx playwright test tests/ui/add-to-cart.spec.ts

# list tests without running them
npx playwright test --list
```

In this mode:

- `login.spec.ts`'s tests each **sign up a fresh, unique throwaway account**
  (`copilot_<purpose>_<timestamp>_<random>`) so repeated/parallel runs never collide on the
  shared public demoblaze.com backend.
- `add-to-cart.spec.ts` logs in with a per-run account derived from `.env`
  (`TEST_USERNAME` + `_cart_<processId>`).
- `search-product.spec.ts` never logs in — it's guest browsing only.

## Run Tests — Picking Data from the Excel Sheet

`testdata/ui/login-credentials.xlsx` holds login credentials keyed by a `TEST_FLOW` column:

| TEST_FLOW     | username | password | notes                                              |
| ------------- | -------- | -------- | -------------------------------------------------- |
| `login`       | ...      | ...      | used by `login.spec.ts`'s "valid credentials" test |
| `add-to-cart` | ...      | ...      | used by `add-to-cart.spec.ts`'s login step         |

To make a test pull its username/password from that sheet instead of generating/using the
default one, set the `GLOBAL_VARIABLE_NAME` environment variable to the matching `TEST_FLOW`
value before running Playwright:

```powershell
# login.spec.ts's "should log in successfully with valid credentials" test
$env:GLOBAL_VARIABLE_NAME = "login"; npx playwright test tests/ui/login.spec.ts

# add-to-cart.spec.ts's login step (used for the whole file's shared session)
$env:GLOBAL_VARIABLE_NAME = "add-to-cart"; npx playwright test tests/ui/add-to-cart.spec.ts
```

```bash
# bash / macOS / Linux equivalent
GLOBAL_VARIABLE_NAME=login npx playwright test tests/ui/login.spec.ts
GLOBAL_VARIABLE_NAME=add-to-cart npx playwright test tests/ui/add-to-cart.spec.ts
```

How it works (`core/utils/LoginCredentials.ts`):

1. Reads `process.env.GLOBAL_VARIABLE_NAME`.
2. Opens `testdata/ui/login-credentials.xlsx` and finds the row whose `TEST_FLOW` matches
   (case-insensitive).
3. Returns that row's `username`/`password`.
4. If the env var isn't set, the sheet doesn't exist, or no row matches, the function returns
   `undefined` and the spec silently falls back to its normal-mode behavior described above —
   no error, no code changes needed to switch between the two modes.

To add/change credentials, just edit the rows in `login-credentials.xlsx` directly — no code
changes required. To wire up a new spec/flow the same way, add a new `TEST_FLOW` row and call
`getLoginCredentialsOverride()` at that spec's login point, falling back to its existing default
when it returns `undefined`.

Unset the variable afterwards so subsequent runs go back to normal mode:

```powershell
Remove-Item Env:\GLOBAL_VARIABLE_NAME
```

## Reports and Artifacts

### Playwright Report

- HTML report: `reports/playwright-report/index.html`
- Additional outputs: `test-results/`

Open the Playwright report after a run:

```bash
npx playwright show-report
```

### Allure Report

Allure results are generated in:

- `reports/allure-results`

The generated Allure report is stored in:

- `reports/allure-report`

Run the default `test` script and open a fresh Allure report:

```bash
npm run allure
```

This command performs the following sequence:

1. Deletes previous Allure results and reports (`allure:clean`).
2. Runs the `test` npm script (defined in `package.json` — update it to point at one of the
   `tests/ui/*.spec.ts` files if you want `npm run allure` to run the demoblaze suite).
3. Generates a new Allure report.
4. Opens the generated report.

> **Note:** The `test` script in `package.json` still references an old, now-removed spec file.
> Use the manual sequence below (`allure:clean` → `npx playwright test ...` → `report:allure` →
> `report:open`) to generate a report for the demoblaze suite instead.

#### Generate Allure Report for Selected Tests

To include only selected tests in the report, clean the previous results before running them.

Run a specific spec file:

```powershell
npm run allure:clean
npx playwright test tests\ui\login.spec.ts
npm run report:allure
npm run report:open
```

Run all three demoblaze specs:

```powershell
npm run allure:clean
npx playwright test tests/ui
npm run report:allure
npm run report:open
```

The commands can also be chained when the tests are expected to pass:

```powershell
npm run allure:clean && npx playwright test tests/ui && npm run report:allure && npm run report:open
```

> **Note:** When commands are joined using `&&`, report generation will not run if a test fails. Use separate commands when an Allure report must also be generated for failed tests.

#### Individual Allure Commands

Clean existing Allure results and reports:

```bash
npm run allure:clean
```

Generate the report from existing results:

```bash
npm run report:allure
```

Open the generated report:

```bash
npm run report:open
```

Generate and serve a temporary report directly from the results:

```bash
npm run report:serve
```

Verify that Allure result files were created:

```powershell
Get-ChildItem .\reports\allure-results -Filter "*-result.json"
```

## Code Formatting

This project uses [Prettier](https://prettier.io/) for consistent code style.

Format all files:

```bash
npm run format
```

Check formatting without writing changes:

```bash
npm run format:check
```
