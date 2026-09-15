import { test as base, chromium, Browser, Page } from '@playwright/test';
import { login } from '@core/fixtures/auth.fixture';

export interface AuthedPage {
  getPage: () => Page;
}

// Used by worker-scoped fixtures — caller owns teardown via the returned cleanup fn.
// Accepts optional credentials so parallel suites don't race the same demoblaze account.
export async function createAuthedPage(
  username?: string,
  password?: string
): Promise<{ page: Page; cleanup: () => Promise<void> }> {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();
  await login(page, username, password);
  console.log('✅ Login complete — suite ready');
  return {
    page,
    cleanup: async () => {
      await page.close();
      await browser.close();
      console.log('✅ Browser closed after spec file');
    },
  };
}

// Same shared-browser pattern as createAuthedPage, but without logging in —
// for suites that exercise guest flows (browsing, search, cart).
export async function createGuestPage(): Promise<{ page: Page; cleanup: () => Promise<void> }> {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();
  console.log('✅ Browser ready — suite ready');
  return {
    page,
    cleanup: async () => {
      await page.close();
      await browser.close();
      console.log('✅ Browser closed after spec file');
    },
  };
}

export function setupAuthedSuite<TExtra extends object = {}>(
  extend?: (page: Page) => TExtra
): () => AuthedPage & TExtra {
  let browser: Browser;
  let page: Page;
  let suite: AuthedPage & TExtra;

  base.beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await login(page);
    console.log('✅ Login complete — suite ready');
    const extra = (extend ? extend(page) : {}) as TExtra;
    suite = {
      getPage: () => page,
      ...extra,
    };
  });

  base.afterAll(async () => {
    if (page) await page.close();
    if (browser) await browser.close();
    console.log('✅ Browser closed after spec file');
  });

  return () => suite;
}
