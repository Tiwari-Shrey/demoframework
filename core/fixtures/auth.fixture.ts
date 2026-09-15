import { Page } from '@playwright/test';
import { LoginPage } from '@pages/common/LoginPage';
import { LOGIN_PAGE_DATA } from '@testdata/shared/login-data';

// Signs up (idempotent) then logs in with the shared test credentials.
export async function login(
  page: Page,
  username = LOGIN_PAGE_DATA.credentials.username,
  password = LOGIN_PAGE_DATA.credentials.password
): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.ensureAccountExists(username, password);
  await loginPage.login(username, password);
  console.log('✅ Login complete');
}
