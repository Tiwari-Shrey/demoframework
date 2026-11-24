import { Page, Locator } from '@playwright/test';

/** Logged-in "Today's Menu and RSVP" screen. */
export class MenuPage {
  readonly main: Locator;
  readonly loggedInLabel: Locator;
  readonly xpPoints: Locator;
  readonly todaysSpecialHeading: Locator;
  readonly menuItems: Locator;
  readonly rsvpQuest: Locator;
  readonly logoutButton: Locator;
  readonly logoutDialog: Locator;
  readonly confirmLogoutButton: Locator;
  readonly cancelLogoutButton: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main', { name: "Today's Menu and RSVP" });
    this.loggedInLabel = this.main.getByText(/^Logged in:/);
    this.xpPoints = this.main.getByLabel('Your XP points');
    this.todaysSpecialHeading = this.main.getByRole('heading', { name: /TODAY'S SPECIAL/ });
    this.menuItems = this.main
      .getByRole('list', { name: "Today's menu items" })
      .getByRole('listitem');
    this.rsvpQuest = this.main.getByRole('region', { name: 'RSVP Quest' });
    this.logoutButton = this.main.getByRole('button', { name: 'Logout' });
    this.logoutDialog = page.getByRole('dialog', { name: 'Logging out?' });
    this.confirmLogoutButton = this.logoutDialog.getByRole('button', { name: /Yes, Bye/ });
    this.cancelLogoutButton = this.logoutDialog.getByRole('button', { name: 'Wait, no!' });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.confirmLogoutButton.click();
  }
}
