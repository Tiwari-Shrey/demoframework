import { test, expect } from '@core/fixtures/ui.fixture';
import { LUNCH_DATA } from '@testdata/lunch-data';
import { envConfig } from '@core/config/environment';

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

  // Steps below mirror SDET360 test case DFTC-20 step by step.
  // INTENTIONAL FAILURE: step 4 expects Today's Menu for an unregistered ID,
  // which the app always rejects — so this test fails on every run (report demo).
  test(
    'Welcome screen entry leads to the employee login form',
    { tag: ['@DFTC-20'] },
    async ({ page, landingPage, loginPage, menuPage }) => {
      const id = LUNCH_DATA.unregisteredEmployeeId;

      await test.step('1. Navigate to welcome screen — SMASH TO ENTER and fruits image are displayed', async () => {
        await landingPage.open();
        await expect(landingPage.main).toBeVisible();
        await expect(landingPage.enterButton).toBeVisible();
        await expect(landingPage.heroImageButton).toBeVisible();
      });

      await test.step('2. "DAILY FEAST" with "BY SDET TECH" and the SCOREBOARD button are displayed', async () => {
        await expect(landingPage.heading).toBeVisible();
        await expect(landingPage.subtitle).toBeVisible();
        await expect(landingPage.scoreboardButton).toBeVisible();
      });

      await test.step('3. Click SMASH TO ENTER — EMPLOYEE ACCESS with portal text, Employee ID and ACCESS PROFILE', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.portalSubtitle).toBeVisible();
        await expect(loginPage.employeeIdInput).toBeVisible();
        await expect(loginPage.accessProfileButton).toBeVisible();
      });

      await test.step(`4. Enter Employee ID "${id}" and click ACCESS PROFILE — Today's Menu opens`, async () => {
        await loginPage.submitEmployeeId(id);
        // Fails by design: the app shows "Employee ID 999999 not registered" instead.
        await expect(menuPage.main).toBeVisible();
        await expect(menuPage.todaysSpecialHeading).toBeVisible();
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-21 step by step.
  // Never clicks YES in QUEST: RSVP, so no lunch is booked. Works whether or not
  // the employee has booked today (login opens Today's Menu or the Leaderboard).
  test(
    'SMASH TO ENTER button opens EMPLOYEE ACCESS screen',
    { tag: ['@DFTC-21'] },
    async ({ page, landingPage, loginPage, menuPage, leaderboardPage }) => {
      const { id, name } = LUNCH_DATA.bookedEmployee;
      // Logged-in screen after ACCESS PROFILE: Today's Menu (not booked) or Leaderboard (booked).
      const loggedInScreen = menuPage.main.or(leaderboardPage.main);
      const logoutButton = page.getByRole('button', { name: 'Logout' }).filter({ visible: true });

      const expectLoggedIn = async () => {
        await expect(loggedInScreen).toBeVisible();
        await expect(
          page.getByText(`Logged in: ${name}`, { exact: true }).filter({ visible: true })
        ).toBeVisible();
        await expect(page.getByLabel('Your XP points').filter({ visible: true })).toBeVisible();
        if (await menuPage.main.isVisible()) {
          await expect(menuPage.todaysSpecialHeading).toBeVisible();
        } else {
          await expect(leaderboardPage.heading).toBeVisible();
        }
      };

      await test.step('1. Open the site — title, DAILY FEAST, BY SDET TECH, fruits image, SMASH TO ENTER and SCOREBOARD', async () => {
        await landingPage.open();
        await expect(page).toHaveTitle(LUNCH_DATA.pageTitle);
        await expect(landingPage.main).toBeVisible();
        await expect(landingPage.heading).toBeVisible();
        await expect(landingPage.subtitle).toBeVisible();
        await expect(landingPage.heroImageButton).toBeVisible();
        await expect(landingPage.enterButton).toBeVisible();
        await expect(landingPage.scoreboardButton).toBeVisible();
      });

      await test.step('2. Click SMASH TO ENTER — EMPLOYEE ACCESS with portal text, Employee ID, hint, ACCESS PROFILE and DAILY FEAST back button', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.heading).toBeVisible();
        await expect(loginPage.portalSubtitle).toBeVisible();
        await expect(loginPage.employeeIdInput).toBeVisible();
        await expect(loginPage.employeeIdInput).toHaveAttribute(
          'placeholder',
          LUNCH_DATA.employeeIdPlaceholder
        );
        await expect(loginPage.main.getByText(LUNCH_DATA.employeeIdHint, { exact: true })).toBeVisible();
        await expect(loginPage.accessProfileButton).toBeVisible();
        await expect(loginPage.accessProfileButton).toContainText('ACCESS PROFILE');
        await expect(loginPage.backButton).toBeVisible();
        await expect(loginPage.backButton).toContainText('DAILY FEAST');
        await expect(landingPage.main).toBeHidden();
      });

      await test.step('3. Click DAILY FEAST back button — welcome screen is displayed again', async () => {
        await loginPage.backButton.click();
        await expect(landingPage.main).toBeVisible();
        await expect(loginPage.main).toBeHidden();
      });

      await test.step('4. Click the fruits image — EMPLOYEE ACCESS opens', async () => {
        await landingPage.heroImageButton.click();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.heading).toBeVisible();
      });

      await test.step(`5. Enter Employee ID "${id}" — field shows ${id}`, async () => {
        await loginPage.employeeIdInput.fill(id);
        await expect(loginPage.employeeIdInput).toHaveValue(id);
      });

      await test.step('6. Click ACCESS PROFILE — logged in; Today\'s Menu or Leaderboard with name and XP badge', async () => {
        await loginPage.accessProfileButton.click();
        await expectLoggedIn();
      });

      await test.step('7. Click HOME in the bottom navigation — welcome screen is displayed', async () => {
        await leaderboardPage.homeButton.click();
        await expect(landingPage.main).toBeVisible();
      });

      await test.step(`8. Click SMASH TO ENTER — EMPLOYEE ACCESS with ${id} pre-filled`, async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.employeeIdInput).toHaveValue(id);
      });

      await test.step('9. Click ACCESS PROFILE — logged in again on the same screen', async () => {
        await loginPage.accessProfileButton.click();
        await expectLoggedIn();
      });

      await test.step('10. Click Logout — "Logging out?" dialog with message, WAIT, NO! and YES, BYE! 👋', async () => {
        const dialog = LUNCH_DATA.logoutDialog;
        await logoutButton.click();
        await expect(menuPage.logoutDialog).toBeVisible();
        await expect(
          menuPage.logoutDialog.getByRole('heading', { name: dialog.title, exact: true })
        ).toBeVisible();
        await expect(menuPage.logoutDialog.getByText(dialog.message, { exact: true })).toBeVisible();
        await expect(menuPage.cancelLogoutButton).toHaveText(dialog.cancelButton);
        await expect(menuPage.confirmLogoutButton).toHaveText(dialog.confirmButton);
      });

      await test.step('11. Click WAIT, NO! — dialog closes; user stays logged in', async () => {
        await menuPage.cancelLogoutButton.click();
        await expect(menuPage.logoutDialog).toBeHidden();
        await expectLoggedIn();
      });

      await test.step('12. Click Logout, then YES, BYE! 👋 — "Logged out successfully" and welcome screen', async () => {
        await logoutButton.click();
        await menuPage.confirmLogoutButton.click();
        await expect(
          page.getByRole('alert').filter({ hasText: LUNCH_DATA.messages.loggedOut })
        ).toBeVisible();
        await expect(landingPage.main).toBeVisible();
      });

      await test.step('13. Click SMASH TO ENTER — EMPLOYEE ACCESS with Employee ID field empty', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.employeeIdInput).toHaveValue('');
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

      await test.step('1. Open the site — title, "DAILY FEAST" heading and "BY SDET TECH" subtitle', async () => {
        await landingPage.open();
        await expect(page).toHaveTitle(LUNCH_DATA.pageTitle);
        await expect(landingPage.heading).toBeVisible();
        await expect(landingPage.subtitle).toBeVisible();
      });

      await test.step('2. SMASH TO ENTER, fruits image and SCOREBOARD are visible', async () => {
        await expect(landingPage.enterButton).toBeVisible();
        await expect(landingPage.heroImageButton).toBeVisible();
        await expect(landingPage.scoreboardButton).toBeVisible();
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
      });

      await test.step(`4. Enter Employee ID "${id}" — field shows ${id}`, async () => {
        await loginPage.employeeIdInput.fill(id);
        await expect(loginPage.employeeIdInput).toHaveValue(id);
      });

      // The app routes by today's booking status: already booked → Leaderboard,
      // not booked yet → Today's Menu. Both are valid, so the test follows
      // whichever one the app shows and checks the right things for it.
      let alreadyBooked = false;
      await test.step('5. Click ACCESS PROFILE — Leaderboard (already booked) or Today\'s Menu (not booked)', async () => {
        await loginPage.accessProfileButton.click();
        await expect(leaderboardPage.main.or(menuPage.main)).toBeVisible();
        alreadyBooked = await leaderboardPage.main.isVisible();

        if (alreadyBooked) {
          await expect(
            page.getByRole('alert').filter({ hasText: LUNCH_DATA.messages.alreadyBooked(name) })
          ).toBeVisible();
          await expect(leaderboardPage.heading).toBeVisible();
          await expect(menuPage.main).toBeHidden();
        } else {
          // Not booked today: menu opens with FEAST in the bottom nav; go to BOARD
          // so the remaining Leaderboard steps run the same way.
          await expect(menuPage.loggedInLabel).toHaveText(`Logged in: ${name}`);
          await expect(menuPage.todaysSpecialHeading).toBeVisible();
          await expect(leaderboardPage.bottomNavLabels).toHaveText(['HOME', 'BOARD', 'FEAST']);
          await leaderboardPage.boardButton.click();
          await expect(leaderboardPage.main).toBeVisible();
          await expect(leaderboardPage.heading).toBeVisible();
        }
      });

      let headerXp = 0;
      await test.step('6. Header shows "Logged in: <name>", XP badge, Logout and Refresh icons', async () => {
        await expect(leaderboardPage.loggedInLabel).toHaveText(`Logged in: ${name}`);
        // Badge text = icon ligature ("monetization_on") + the XP number.
        await expect(leaderboardPage.xpPoints).toHaveText(/\d+\s*$/);
        headerXp = Number((await leaderboardPage.xpPoints.innerText()).match(/(\d+)\s*$/)![1]);
        await expect(leaderboardPage.logoutButton).toBeVisible();
        await expect(leaderboardPage.refreshButton).toBeVisible();
      });

      await test.step('7. Banner "🏆 Top Food Smashers · <year> 🏆"; ranking card XP matches header and shows a badge', async () => {
        await expect(leaderboardPage.banner).toHaveText(LUNCH_DATA.leaderboardBanner);
        await expect(leaderboardPage.currentRankingCard).toContainText(`${headerXp} XP`);
        // Badge = emoji followed by an upper-case title, e.g. "🏅 GRAND MASTER".
        await expect(leaderboardPage.currentRankingCard).toContainText(
          /\p{Extended_Pictographic}\s*[A-Z][A-Z ]+[A-Z]/u
        );
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
      });

      await test.step('9. Bottom navigation: HOME and BOARD; FEAST only if not booked today', async () => {
        await expect(leaderboardPage.bottomNav).toBeVisible();
        await expect(leaderboardPage.bottomNavLabels).toHaveText(
          alreadyBooked ? ['HOME', 'BOARD'] : ['HOME', 'BOARD', 'FEAST']
        );
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
      });

      await test.step('11. Click HOME — welcome screen opens', async () => {
        await leaderboardPage.homeButton.click();
        await expect(landingPage.main).toBeVisible();
        await expect(leaderboardPage.main).toBeHidden();
      });

      await test.step('12. Click SMASH TO ENTER again — EMPLOYEE ACCESS with Employee ID field empty', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.employeeIdInput).toHaveValue('');
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-23 step by step.
  // Precondition: EMPLOYEE_ID (.env) has not booked lunch today. A booked user lands
  // on the Leaderboard directly, where BOARD is not a clickable button.
  test(
    'Logged-in employee accesses leaderboard from bottom navigation BOARD button',
    { tag: ['@DFTC-23'] },
    async ({ loggedIn: menuPage, leaderboardPage }) => {
      await test.step('1. Log in with a valid test Employee ID — bottom navigation with BOARD button is visible', async () => {
        // Login is done by the `loggedIn` fixture; confirm we are logged in.
        await expect(menuPage.main).toBeVisible();
        await expect(menuPage.loggedInLabel).toBeVisible();
        await expect(leaderboardPage.bottomNav).toBeVisible();
        await expect(leaderboardPage.boardButton).toBeVisible();
        await expect(leaderboardPage.boardButton).toContainText('BOARD');
      });

      await test.step('2. Click BOARD — Leaderboard with Hall of Fame, Global Rankings, Refresh and YOUR CURRENT RANKING', async () => {
        await leaderboardPage.boardButton.click();
        await expect(leaderboardPage.main).toBeVisible();
        await expect(leaderboardPage.heading).toBeVisible();
        await expect(menuPage.main).toBeHidden();
        await expect(leaderboardPage.hallOfFameHeading).toBeVisible();
        await expect(leaderboardPage.globalRankingsHeading).toBeVisible();
        await expect(leaderboardPage.refreshButton).toBeVisible();
        await expect(leaderboardPage.currentRankingCard).toBeVisible();
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-24 steps 1–6.
  // Steps 7–8 ("navigate directly to menu / booking screen URL") are not automated:
  // the app is a single-page app where every screen lives at "/" with no URL routing
  // (/menu, /booking return 404), so there is no such URL to open.
  test(
    'Successful logout from leaderboard screen clears session and redirects to welcome screen',
    {
      tag: ['@DFTC-24'],
      annotation: {
        type: 'not automated',
        description:
          'Steps 7–8 skipped: the app has no menu/booking screen URLs (single-page app, all screens at "/"). Test case needs updating in SDET360.',
      },
    },
    async ({ page, context, landingPage, loginPage, menuPage, leaderboardPage }) => {
      const dialog = LUNCH_DATA.logoutDialog;

      await test.step('1. Open the site and log in with a valid Employee ID — employee is logged in', async () => {
        await landingPage.open();
        await landingPage.enter();
        await loginPage.submitEmployeeId(envConfig.employeeId);
        // Not booked today → Today's Menu; already booked → Leaderboard.
        await expect(menuPage.main.or(leaderboardPage.main)).toBeVisible();
        await expect(page.getByText(/^Logged in:/).filter({ visible: true })).toBeVisible();
      });

      await test.step('2. Navigate to the Leaderboard — Leaderboard with Logout option is displayed', async () => {
        if (await menuPage.main.isVisible()) {
          await leaderboardPage.boardButton.click();
        }
        await expect(leaderboardPage.main).toBeVisible();
        await expect(leaderboardPage.heading).toBeVisible();
        await expect(leaderboardPage.logoutButton).toBeVisible();
        // Precondition for step 6: the session is saved in the browser while logged in.
        expect(await page.evaluate(() => localStorage.getItem('employeeId'))).toBe(
          envConfig.employeeId
        );
      });

      await test.step('3. Click Logout — "Logging out?" dialog with message, "Wait, no!" and "Yes, Bye! 👋"', async () => {
        await leaderboardPage.logoutButton.click();
        await expect(menuPage.logoutDialog).toBeVisible();
        await expect(
          menuPage.logoutDialog.getByRole('heading', { name: dialog.title, exact: true })
        ).toBeVisible();
        await expect(menuPage.logoutDialog.getByText(dialog.message, { exact: true })).toBeVisible();
        await expect(menuPage.cancelLogoutButton).toHaveText(dialog.cancelButton);
        await expect(menuPage.confirmLogoutButton).toHaveText(dialog.confirmButton);
      });

      await test.step('4. Click "Yes, Bye! 👋" — success message and welcome screen', async () => {
        await menuPage.confirmLogoutButton.click();
        await expect(
          page.getByRole('alert').filter({ hasText: LUNCH_DATA.messages.loggedOutFull })
        ).toBeVisible();
        await expect(landingPage.main).toBeVisible();
        await expect(leaderboardPage.main).toBeHidden();
      });

      await test.step('5. Open EMPLOYEE ACCESS — Employee ID field is empty', async () => {
        await landingPage.enter();
        await expect(loginPage.main).toBeVisible();
        await expect(loginPage.employeeIdInput).toHaveValue('');
      });

      await test.step('6. Saved Employee ID and name are removed from browser storage', async () => {
        const storage = await page.evaluate(() => ({
          local: { ...localStorage },
          session: { ...sessionStorage },
        }));
        expect(storage.local, 'localStorage').not.toHaveProperty('employeeId');
        expect(storage.local, 'localStorage').not.toHaveProperty('employeeName');
        const saved = JSON.stringify([storage, await context.cookies()]);
        expect(saved, 'browser storage contains Employee ID').not.toContain(
          `"${envConfig.employeeId}"`
        );
      });
    }
  );

  // Steps below mirror SDET360 test case DFTC-25 step by step.
  // Precondition: EMPLOYEE_ID (.env) has not booked lunch today, so login opens Today's Menu.
  // The app saves the session in localStorage as "employeeId" and "employeeName".
  test(
    'Employee ID and name are removed from browser storage after logout',
    { tag: ['@DFTC-25'] },
    async ({ page, context, loggedIn: menuPage, landingPage }) => {
      const id = envConfig.employeeId;
      let name = '';

      const readBrowserStorage = async () => ({
        ...(await page.evaluate(() => ({
          local: { ...localStorage },
          session: { ...sessionStorage },
        }))),
        cookies: await context.cookies(),
      });

      await test.step('1. Log in with a valid test Employee ID — employee is on the menu screen', async () => {
        // Login is done by the `loggedIn` fixture; confirm we are on the menu screen.
        await expect(menuPage.main).toBeVisible();
        await expect(menuPage.loggedInLabel).toHaveText(/^Logged in: .+/);
        // textContent keeps the original casing (the label is upper-cased by CSS).
        name = (await menuPage.loggedInLabel.textContent())!.replace(/^Logged in:/, '').trim();
      });

      await test.step('2. Employee ID and name are present in browser storage', async () => {
        const storage = await readBrowserStorage();
        expect(storage.local, 'localStorage').toHaveProperty('employeeId', id);
        expect(storage.local, 'localStorage').toHaveProperty('employeeName', name);
      });

      await test.step('3. Click Logout and confirm with "Yes, Bye! 👋" — logout completes and welcome screen opens', async () => {
        await menuPage.logoutButton.click();
        await expect(menuPage.logoutDialog).toBeVisible();
        await expect(menuPage.confirmLogoutButton).toHaveText(LUNCH_DATA.logoutDialog.confirmButton);
        await menuPage.confirmLogoutButton.click();
        await expect(
          page.getByRole('alert').filter({ hasText: LUNCH_DATA.messages.loggedOut })
        ).toBeVisible();
        await expect(landingPage.main).toBeVisible();
        await expect(menuPage.main).toBeHidden();
      });

      await test.step('4. Employee ID and name are no longer in localStorage, sessionStorage or cookies', async () => {
        const storage = await readBrowserStorage();
        for (const [area, entries] of Object.entries({
          localStorage: storage.local,
          sessionStorage: storage.session,
        })) {
          expect(entries, area).not.toHaveProperty('employeeId');
          expect(entries, area).not.toHaveProperty('employeeName');
          const values = Object.values(entries);
          expect(values, `${area} holds the Employee ID`).not.toContain(id);
          expect(values, `${area} holds the employee name`).not.toContain(name);
        }
        const cookies = JSON.stringify(storage.cookies);
        expect(cookies, 'cookies hold the Employee ID').not.toContain(`"${id}"`);
        expect(cookies, 'cookies hold the employee name').not.toContain(name);
      });
    }
  );
});
