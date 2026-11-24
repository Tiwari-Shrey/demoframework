import { test, expect } from '@core/fixtures/ui.fixture';
import { LUNCH_DATA } from '@testdata/lunch-data';

test.describe('Daily Feast (lunch.sdettech.com)', () => {
  // Steps below mirror SDET360 test case DFTC-1 step by step.
  test(
    'Landing page shows title, heading and entry options',
    { tag: ['@DFTC-1'] },
    async ({ page, landingPage }) => {
      await test.step('1. Open the site — tab title is "Daily Feast – Book Your Lunch"', async () => {
        await landingPage.open();
        await expect(page).toHaveTitle(LUNCH_DATA.pageTitle);
      });

      await test.step('2. Heading "DAILY FEAST" with subtitle "BY SDET TECH" is displayed', async () => {
        await expect(landingPage.heading).toBeVisible();
        await expect(landingPage.subtitle).toBeVisible();
      });

      await test.step('3. SMASH TO ENTER, fruits image and SCOREBOARD are visible', async () => {
        await expect(landingPage.enterButton).toBeVisible();
        await expect(landingPage.heroImageButton).toBeVisible();
        await expect(landingPage.scoreboardButton).toBeVisible();
      });

      await test.step('4. First Tab focuses "Skip to main content" (→ #main-content)', async () => {
        await page.keyboard.press('Tab');
        await expect(landingPage.skipToContentLink).toBeFocused();
        await expect(landingPage.skipToContentLink).toHaveAttribute('href', '#main-content');
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-2 step by step.
  test(
    'Empty Employee ID shows a validation error',
    { tag: ['@DFTC-2'] },
    async ({ landingPage, loginPage, menuPage }) => {
      await test.step('1. Open the site — welcome screen is displayed', async () => {
        await landingPage.open();
        await expect(landingPage.main).toBeVisible();
      });

      await test.step('2. Click SMASH TO ENTER — EMPLOYEE ACCESS screen is displayed', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.employeeIdInput).toBeVisible();
        await expect(loginPage.accessProfileButton).toBeVisible();
      });

      await test.step('3. Submit with empty Employee ID — validation error is shown', async () => {
        await loginPage.employeeIdInput.fill('');
        await loginPage.accessProfileButton.click();
        await expect(loginPage.errorAlert).toHaveText(LUNCH_DATA.messages.emptyEmployeeId);
      });

      await test.step('4. User stays on EMPLOYEE ACCESS; menu is not shown', async () => {
        await expect(loginPage.main).toBeVisible();
        await expect(menuPage.main).toBeHidden();
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-3 step by step.
  test(
    'Unregistered Employee ID is rejected',
    { tag: ['@DFTC-3'] },
    async ({ landingPage, loginPage, menuPage }) => {
      const id = LUNCH_DATA.unregisteredEmployeeId;

      await test.step('1. Open the site — welcome screen is displayed', async () => {
        await landingPage.open();
        await expect(landingPage.main).toBeVisible();
      });

      await test.step('2. Click SMASH TO ENTER — EMPLOYEE ACCESS screen is displayed', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.employeeIdInput).toBeVisible();
        await expect(loginPage.accessProfileButton).toBeVisible();
      });

      await test.step(`3. Submit Employee ID "${id}" — "not registered" error is shown`, async () => {
        await loginPage.submitEmployeeId(id);
        await expect(loginPage.errorAlert).toContainText(
          LUNCH_DATA.messages.unregisteredEmployeeId(id)
        );
      });

      await test.step('4. User stays on EMPLOYEE ACCESS; menu is not shown', async () => {
        await expect(loginPage.main).toBeVisible();
        await expect(menuPage.main).toBeHidden();
      });
    }
  );
});
