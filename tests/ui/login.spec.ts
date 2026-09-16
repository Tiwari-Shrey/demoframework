import { test, expect } from '@core/fixtures/ui.fixture';
import { LOGIN_PAGE_DATA } from '@testdata/shared/login-data';
import { getLoginCredentialsOverride } from '@core/utils/LoginCredentials';

// Each test signs up its own throwaway account. demoblaze.com is a shared public
// backend and this suite's file runs concurrently across multiple projects
// (@smoke / @regression), so a single fixed account would race across workers.
function uniqueUsername(label: string): string {
  return `copilot_${label}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

const PASSWORD = 'Copilot@123';

test.describe('demoblaze.com — Login',
  {
    tag: ['@WPDTC-2'],
  }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    if (await loginPage.isLoggedIn()) {
      await loginPage.logout();
    }
  });

  test('should sign up a new user successfully', async ({ loginPage }) => {
    const message = await loginPage.signup(uniqueUsername('signup'), PASSWORD);

    expect(message).toBe(LOGIN_PAGE_DATA.alerts.signupSuccess);
  });

  test('should show an error when signing up with an already registered username @regression', async ({
    loginPage,
  }) => {
    const username = uniqueUsername('dup');
    await loginPage.ensureAccountExists(username, PASSWORD);

    const message = await loginPage.signup(username, PASSWORD);

    expect(message).toBe(LOGIN_PAGE_DATA.alerts.signupDuplicate);
  });

  test('should show an error when logging in with a wrong password', async ({ loginPage }) => {
    const username = uniqueUsername('wrongpw');
    await loginPage.ensureAccountExists(username, PASSWORD);

    const message = await loginPage.loginExpectingAlert(username, LOGIN_PAGE_DATA.invalidPassword);

    expect(message).toBe(LOGIN_PAGE_DATA.alerts.loginWrongPassword);
    expect(PASSWORD).not.toBe(LOGIN_PAGE_DATA.invalidPassword);
  });

  test('should show an error when logging in with a non-existent username', async ({
    loginPage,
  }) => {
    const message = await loginPage.loginExpectingAlert(
      uniqueUsername('missing'),
      'whatever-password'
    );

    expect(message).toBe(LOGIN_PAGE_DATA.alerts.loginUserNotFound);
  });

  test('should log in successfully with valid credentials', async ({ loginPage }) => {
    // Pulls from testdata/ui/login-credentials.xlsx (TEST_FLOW="login")
    // when $env:GLOBAL_VARIABLE_NAME = "login" is set; otherwise uses a fresh account.
    const override = getLoginCredentialsOverride();
    const username = override?.username ?? uniqueUsername('valid');
    const password = override?.password ?? PASSWORD;
    await loginPage.ensureAccountExists(username, password);

    await loginPage.login(username, password);

    await expect.poll(() => loginPage.isLoggedIn()).toBe(true);
    expect(await loginPage.getWelcomeText()).toBe(`Welcome ${username}`);
  });
});
