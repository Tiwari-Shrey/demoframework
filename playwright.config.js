import { defineConfig } from '@playwright/test';
import { envConfig } from './core/config/environment';

// null = maximized window; otherwise a fixed window size (see `use` below).
const fixedViewport =
  process.env.START_MAXIMIZED === 'false'
    ? {
        width: Number(process.env.VIEWPORT_WIDTH) || 1280,
        height: Number(process.env.VIEWPORT_HEIGHT) || 720,
      }
    : null;

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
     * Maximized window by default. START_MAXIMIZED=false uses a fixed window
     * of VIEWPORT_WIDTH x VIEWPORT_HEIGHT (default 1280x720) instead, for machines
     * where maximizing fails. Keep it smaller than that machine's screen, or the
     * page is drawn bigger than the window and gets cut off.
     */
    launchOptions: {
      args: fixedViewport
        ? [`--window-size=${fixedViewport.width},${fixedViewport.height + 100}`]
        : ['--start-maximized'],
    },
    viewport: fixedViewport,
  },

  /**
   * Run tests sequentially.
   *
   * Keep this as 1 initially to avoid changing
   * existing test behavior.
   */
  workers: 1,
});
