# Daily Feast Automation

Playwright + TypeScript tests for [Daily Feast](https://lunch.sdettech.com/), the SDET Tech lunch booking portal.

## Setup

```bash
npm install
npx playwright install
cp .env.example .env   # then set EMPLOYEE_ID
```

| Variable      | Required | Default                          |
| ------------- | -------- | -------------------------------- |
| `BASE_URL`    | no       | `https://lunch.sdettech.com`     |
| `EMPLOYEE_ID` | yes      | — (test employee used to log in) |

## Running

```bash
npm test                              # all tests (headed — browser window visible)
npx playwright test --grep @DFTC-3    # a single test case by tag
npm run test:headless                 # without a browser window (HEADLESS=true)
```

Reports: `reports/playwright-report`, `reports/custom-report/index.html`, and Allure (`npm run allure`).

## Structure

- `tests/ui/daily-feast.spec.ts` — test cases, tagged `@DFTC-<n>`
- `pages/` — page objects: `LandingPage`, `LoginPage`, `MenuPage`, `LeaderboardPage`
- `core/fixtures/ui.fixture.ts` — page-object fixtures and the `loggedIn` fixture
- `core/config/environment.ts` — reads `.env`
- `testdata/lunch-data.ts` — expected texts and negative-test data

## Test cases

| Tag    | Scenario                                                                          |
| ------ | --------------------------------------------------------------------------------- |
| DFTC-1 | Landing page shows title, heading and entry options                               |
| DFTC-2 | Empty Employee ID shows a validation error                                        |
| DFTC-3 | Unregistered Employee ID is rejected                                              |

Tests never book or cancel a lunch, so they are safe to run at any time of day.
