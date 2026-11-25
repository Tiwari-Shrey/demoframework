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

  // Steps below mirror SDET360 test case DFTC-17 step by step.
  test(
    'Logout shows "Logging out?" confirmation dialog with correct text and buttons',
    { tag: ['@DFTC-17'] },
    async ({ loggedIn: menuPage }) => {
      const dialog = LUNCH_DATA.logoutDialog;

      await test.step('1. Log in with a valid Employee ID — menu screen is displayed', async () => {
        // Login is done by the `loggedIn` fixture; confirm we are on the menu screen.
        await expect(menuPage.main).toBeVisible();
        await expect(menuPage.logoutButton).toBeVisible();
      });

      await test.step('2. Click Logout — "Logging out?" dialog with message and both buttons', async () => {
        await menuPage.logoutButton.click();
        await expect(menuPage.logoutDialog).toBeVisible();
        await expect(
          menuPage.logoutDialog.getByRole('heading', { name: dialog.title, exact: true })
        ).toBeVisible();
        await expect(
          menuPage.logoutDialog.getByText(dialog.message, { exact: true })
        ).toBeVisible();
        await expect(menuPage.cancelLogoutButton).toBeVisible();
        await expect(menuPage.cancelLogoutButton).toHaveText(dialog.cancelButton);
        await expect(menuPage.confirmLogoutButton).toBeVisible();
        await expect(menuPage.confirmLogoutButton).toHaveText(dialog.confirmButton);
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-21 step by step.
  test(
    'SMASH TO ENTER button opens EMPLOYEE ACCESS screen',
    { tag: ['@DFTC-21'] },
    async ({ landingPage, loginPage }) => {
      await test.step('1. Open the site — welcome screen with SMASH TO ENTER and fruits image', async () => {
        await landingPage.open();
        await expect(landingPage.main).toBeVisible();
        await expect(landingPage.enterButton).toBeVisible();
        await expect(landingPage.heroImageButton).toBeVisible();
      });

      await test.step('2. Click SMASH TO ENTER — EMPLOYEE ACCESS with Employee ID, ACCESS PROFILE and DAILY FEAST back button', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.heading).toBeVisible();
        await expect(loginPage.employeeIdInput).toBeVisible();
        await expect(loginPage.accessProfileButton).toBeVisible();
        await expect(loginPage.accessProfileButton).toContainText('ACCESS PROFILE');
        await expect(loginPage.backButton).toBeVisible();
        await expect(loginPage.backButton).toContainText('DAILY FEAST');
        await expect(landingPage.main).toBeHidden();
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-22 step by step.
  // Precondition: LUNCH_DATA.bookedEmployee has already booked lunch today.
  test(
    'Already-booked user lands on Leaderboard without FEAST navigation',
    { tag: ['@DFTC-22'] },
    async ({ page, landingPage, loginPage, menuPage, leaderboardPage }) => {
      const { id, name } = LUNCH_DATA.bookedEmployee;
      // Short pause after each step so the run is easy to follow (~6 s in total).
      const pause = () => page.waitForTimeout(500);

      await test.step('1. Open the site — title, "DAILY FEAST" heading and "BY SDET TECH" subtitle', async () => {
        await landingPage.open();
        await expect(page).toHaveTitle(LUNCH_DATA.pageTitle);
        await expect(landingPage.heading).toBeVisible();
        await expect(landingPage.subtitle).toBeVisible();
        await pause();
      });

      await test.step('2. SMASH TO ENTER, fruits image and SCOREBOARD are visible', async () => {
        await expect(landingPage.enterButton).toBeVisible();
        await expect(landingPage.heroImageButton).toBeVisible();
        await expect(landingPage.scoreboardButton).toBeVisible();
        await pause();
      });

      await test.step('3. Click SMASH TO ENTER — EMPLOYEE ACCESS with portal text, Employee ID and ACCESS PROFILE', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.heading).toBeVisible();
        await expect(loginPage.portalSubtitle).toBeVisible();
        await expect(loginPage.employeeIdInput).toBeVisible();
        await expect(loginPage.employeeIdInput).toHaveAttribute(
          'placeholder',
          LUNCH_DATA.employeeIdPlaceholder
        );
        await expect(loginPage.accessProfileButton).toBeVisible();
        await pause();
      });

      await test.step(`4. Enter Employee ID "${id}" — field shows ${id}`, async () => {
        await loginPage.employeeIdInput.fill(id);
        await expect(loginPage.employeeIdInput).toHaveValue(id);
        await pause();
      });

      await test.step('5. Click ACCESS PROFILE — "already booked" message; LEADERBOARD opens instead of the menu', async () => {
        await loginPage.accessProfileButton.click();
        await expect(
          page.getByRole('alert').filter({ hasText: LUNCH_DATA.messages.alreadyBooked(name) })
        ).toBeVisible();
        await expect(leaderboardPage.main).toBeVisible();
        await expect(leaderboardPage.heading).toBeVisible();
        await expect(menuPage.main).toBeHidden();
        await pause();
      });

      let headerXp = 0;
      await test.step('6. Header shows "Logged in: <name>", XP badge, Logout and Refresh icons', async () => {
        await expect(leaderboardPage.loggedInLabel).toHaveText(`Logged in: ${name}`);
        // Badge text = icon ligature ("monetization_on") + the XP number.
        await expect(leaderboardPage.xpPoints).toHaveText(/\d+\s*$/);
        headerXp = Number((await leaderboardPage.xpPoints.innerText()).match(/(\d+)\s*$/)![1]);
        await expect(leaderboardPage.logoutButton).toBeVisible();
        await expect(leaderboardPage.refreshButton).toBeVisible();
        await pause();
      });

      await test.step('7. Banner "🏆 Top Food Smashers · <year> 🏆"; ranking card XP matches header and shows a badge', async () => {
        await expect(leaderboardPage.banner).toHaveText(LUNCH_DATA.leaderboardBanner);
        await expect(leaderboardPage.currentRankingCard).toContainText(`${headerXp} XP`);
        // Badge = emoji followed by an upper-case title, e.g. "🏅 GRAND MASTER".
        await expect(leaderboardPage.currentRankingCard).toContainText(
          /\p{Extended_Pictographic}\s*[A-Z][A-Z ]+[A-Z]/u
        );
        await pause();
      });

      await test.step('8. Hall of Fame newest month first; Global Rankings 🥇🥈🥉 then 4,5,6…, by XP desc, ≤ 25 rows', async () => {
        await expect(leaderboardPage.hallOfFameHeading).toBeVisible();
        await expect(leaderboardPage.hallOfFameEntries.first()).toBeVisible();
        const hallOfFame = await leaderboardPage.getHallOfFame();
        for (const entry of hallOfFame) {
          expect(entry.month, 'Hall of Fame month').toMatch(/^[A-Za-z]+ \d{4}$/);
          expect(entry.winner.replace('👑', '').trim(), `winner for ${entry.month}`).not.toBe('');
        }
        const monthTimes = hallOfFame.map((e) => new Date(`1 ${e.month}`).getTime());
        expect(monthTimes.every((t) => !Number.isNaN(t)), 'Hall of Fame months parse').toBe(true);
        expect(monthTimes, 'Hall of Fame newest first').toEqual(
          [...monthTimes].sort((a, b) => b - a)
        );

        await expect(leaderboardPage.globalRankingsHeading).toBeVisible();
        await expect(leaderboardPage.rankingRows.first()).toBeVisible();
        const rankings = await leaderboardPage.getRankings();
        expect(rankings.length).toBeGreaterThan(0);
        expect(rankings.length).toBeLessThanOrEqual(LUNCH_DATA.maxRankingRows);
        const expectedRanks = rankings.map((_, i) => ['🥇', '🥈', '🥉'][i] ?? String(i + 1));
        expect(rankings.map((r) => r.rank)).toEqual(expectedRanks);
        const xps = rankings.map((r) => r.xp);
        expect(xps, 'Global Rankings sorted by XP desc').toEqual([...xps].sort((a, b) => b - a));
        await pause();
      });

      await test.step('9. Bottom navigation shows only HOME and BOARD (no FEAST)', async () => {
        await expect(leaderboardPage.bottomNav).toBeVisible();
        await expect(leaderboardPage.bottomNavLabels).toHaveText(['HOME', 'BOARD']);
        await pause();
      });

      await test.step('10. Click Refresh — rankings reload without a page reload; user stays logged in', async () => {
        // A window flag survives an in-page refresh but is lost on a full page reload.
        await page.evaluate(() => ((window as any).__dftc22NoReload = true));
        const leaderboardResponse = page.waitForResponse(
          (res) => res.url().includes('/api/bookings/leaderboard') && res.ok()
        );
        await leaderboardPage.refreshButton.click();
        await leaderboardResponse;
        expect(await page.evaluate(() => (window as any).__dftc22NoReload)).toBe(true);
        await expect(leaderboardPage.rankingRows.first()).toBeVisible();
        await expect(leaderboardPage.loggedInLabel).toHaveText(`Logged in: ${name}`);
        await pause();
      });

      await test.step('11. Click HOME — welcome screen opens', async () => {
        await leaderboardPage.homeButton.click();
        await expect(landingPage.main).toBeVisible();
        await expect(leaderboardPage.main).toBeHidden();
        await pause();
      });

      await test.step(`12. Click SMASH TO ENTER again — EMPLOYEE ACCESS with ${id} pre-filled`, async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.employeeIdInput).toHaveValue(id);
        await pause();
      });
    }
  );
});
