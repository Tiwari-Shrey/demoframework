import { defineConfig } from '@playwright/test';
import { envConfig } from './core/config/environment';

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
    // (console logs) to the console. Without it nothing is printed.
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
    baseURL: envConfig.baseUrl,

    /**
     * Headed (visible browser) by default.
     * Set HEADLESS=true to run without a browser window (e.g. on servers).
     */
    headless: process.env.HEADLESS === 'true',

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
     * Browser to use. Empty = Playwright's bundled Chromium.
     * BROWSER_CHANNEL=msedge or chrome uses the browser installed on the machine.
     */
    channel: process.env.BROWSER_CHANNEL || undefined,

    /**
     * Maximized window by default. START_MAXIMIZED=false uses a fixed
     * 1920x1080 viewport instead (for machines where maximizing fails).
     */
    launchOptions: {
      args: process.env.START_MAXIMIZED === 'false' ? [] : ['--start-maximized'],
    },
    viewport: process.env.START_MAXIMIZED === 'false' ? { width: 1920, height: 1080 } : null,
  },

  /**
   * Run tests sequentially.
   *
   * Keep this as 1 initially to avoid changing
   * existing test behavior.
   */
  workers: 1,
});
