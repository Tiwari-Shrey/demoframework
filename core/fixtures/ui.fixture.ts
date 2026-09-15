import { test as base, expect, Page } from '@playwright/test';
import { createAuthedPage, createGuestPage } from '@core/base/Hooks';
import { LoginPage } from '@pages/common/LoginPage';
import { HomePage } from '../../pages/ui/HomePage';
import { ProductDetailsPage } from '@pages/ui/ProductDetailsPage';
import { CartPage } from '@pages/ui/CartPage';
import { LOGIN_PAGE_DATA } from '@testdata/shared/login-data';
import { getLoginCredentialsOverride } from '@core/utils/LoginCredentials';

// Dedicated account for cart flows so this worker never races the shared
// login-spec account when both spec files run in parallel workers. Suffixed
// with the OS process id so concurrent projects (@smoke/@regression) loading
// this same file also get distinct, non-colliding accounts.
const CART_TEST_USERNAME = `${LOGIN_PAGE_DATA.credentials.username}_cart_${process.pid}`;

// Worker-scoped: the browser + page are created once per worker and shared
// across every test in the spec file, mirroring the shared-context pattern
// used for authenticated suites.
type PomFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
};

type GuestWorkerFixtures = PomFixtures & { sharedPage: Page };
type AuthedWorkerFixtures = PomFixtures & { sharedPage: Page };

// For guest flows (login mechanics, browsing, cart) — no auto-login.
export const test = base.extend<{}, GuestWorkerFixtures>({
  sharedPage: [
    async ({}, use) => {
      const { page, cleanup } = await createGuestPage();
      await use(page);
      await cleanup();
    },
    { scope: 'worker' },
  ],
  loginPage: [async ({ sharedPage }, use) => use(new LoginPage(sharedPage)), { scope: 'worker' }],
  homePage: [async ({ sharedPage }, use) => use(new HomePage(sharedPage)), { scope: 'worker' }],
  productDetailsPage: [
    async ({ sharedPage }, use) => use(new ProductDetailsPage(sharedPage)),
    { scope: 'worker' },
  ],
  cartPage: [async ({ sharedPage }, use) => use(new CartPage(sharedPage)), { scope: 'worker' }],
});

// For flows that require a logged-in user — signup/login runs once per worker.
export const authTest = base.extend<{}, AuthedWorkerFixtures>({
  sharedPage: [
    async ({}, use) => {
      // Pulls from testdata/ui/login-credentials.xlsx (TEST_FLOW="add-to-cart")
      // when $env:GLOBAL_VARIABLE_NAME = "add-to-cart" is set; otherwise uses the per-worker cart account.
      const override = getLoginCredentialsOverride();
      const username = override?.username ?? CART_TEST_USERNAME;
      const password = override?.password ?? LOGIN_PAGE_DATA.credentials.password;
      const { page, cleanup } = await createAuthedPage(username, password);
      await use(page);
      await cleanup();
    },
    { scope: 'worker' },
  ],
  loginPage: [async ({ sharedPage }, use) => use(new LoginPage(sharedPage)), { scope: 'worker' }],
  homePage: [async ({ sharedPage }, use) => use(new HomePage(sharedPage)), { scope: 'worker' }],
  productDetailsPage: [
    async ({ sharedPage }, use) => use(new ProductDetailsPage(sharedPage)),
    { scope: 'worker' },
  ],
  cartPage: [async ({ sharedPage }, use) => use(new CartPage(sharedPage)), { scope: 'worker' }],
});

export { expect };
