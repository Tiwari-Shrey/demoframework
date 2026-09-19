import { defineConfig } from '@playwright/test';
import { LOGIN_PAGE_DATA } from './testdata/shared/login-data';

export default defineConfig({
  /**
   * Test specifications
   */
  testDir: './tests',
  /**
   * Global test timeout
   */
  timeout: 120_000,

  /**
   * Expect timeout
   */
  expect: {
    timeout: 10_000,
  },

  /**
   * Retry configuration
   */
  retries: 0,

  /**
   * Reporting
   */
  reporter: [
    // Terminal reporter — prints test progress AND forwards worker stdout
    // (the pino per-shelf logs) to the console. Without it nothing is printed.
    ['list'],
    ['./core/reporters/SinglePageReporter.ts', { outputFile: 'reports/custom-report/index.html' }],
    ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
      },
    ],
  ],

  /**
   * Shared test configuration
   */
  use: {
    /**
     * Keep the existing base URL behavior.
     *
     * Later this can be moved to:
     * config/environments/
     */
    baseURL: LOGIN_PAGE_DATA.baseUrl,

    /**
     * Keep current execution behavior.
     */
    headless: true,

    /**
     * Required for the current application/environment.
     */
    ignoreHTTPSErrors: true,

    /**
     * Evidence configuration
     */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    /**
     * Browser launch configuration
     */
    launchOptions: {
      args: ['--start-maximized'],
    },

    /**
     * Use browser window size instead of fixed viewport.
     */
    viewport: null,
  },

  /**
   * Run tests sequentially.
   *
   * Keep this as 1 initially to avoid changing
   * existing test behavior.
   */
  workers: 1,
});
