import { test as base, expect } from '@playwright/test';
import { LandingPage } from '@pages/LandingPage';
import { LoginPage } from '@pages/LoginPage';
import { MenuPage } from '@pages/MenuPage';
import { LeaderboardPage } from '@pages/LeaderboardPage';
import { envConfig } from '@core/config/environment';

type PageFixtures = {
  landingPage: LandingPage;
  loginPage: LoginPage;
  menuPage: MenuPage;
  leaderboardPage: LeaderboardPage;
  /** Opens the site and logs in with EMPLOYEE_ID from .env. */
  loggedIn: MenuPage;
};

// Test-scoped: every test gets a fresh page, so tests are independent and
// a failed login/logout in one test cannot leak into the next.
export const test = base.extend<PageFixtures>({
  landingPage: async ({ page }, use) => use(new LandingPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  menuPage: async ({ page }, use) => use(new MenuPage(page)),
  leaderboardPage: async ({ page }, use) => use(new LeaderboardPage(page)),
  loggedIn: async ({ landingPage, loginPage, menuPage }, use) => {
    await landingPage.open();
    await landingPage.enter();
    await loginPage.submitEmployeeId(envConfig.employeeId);
    await expect(menuPage.main).toBeVisible();
    await use(menuPage);
  },
});

export { expect };
