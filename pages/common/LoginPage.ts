import { Page, Locator, expect } from '@playwright/test';
import { LOGIN_PAGE_DATA } from '@testdata/shared/login-data';

/**
 * Page object for the demoblaze.com nav-bar auth modals (Sign up / Log in / Log out).
 * Both modals are rendered on every page, so no navigation is required to use them.
 */
export class LoginPage {
  private readonly loginNavLink: Locator;
  private readonly signupNavLink: Locator;
  private readonly logoutNavLink: Locator;
  private readonly welcomeLabel: Locator;

  private readonly loginModal: Locator;
  private readonly loginUsernameInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginSubmitButton: Locator;

  private readonly signupModal: Locator;
  private readonly signupUsernameInput: Locator;
  private readonly signupPasswordInput: Locator;
  private readonly signupSubmitButton: Locator;

  constructor(private readonly page: Page) {
    this.loginNavLink = this.page.locator('#login2');
    this.signupNavLink = this.page.locator('#signin2');
    this.logoutNavLink = this.page.locator('#logout2');
    this.welcomeLabel = this.page.locator('#nameofuser');

    this.loginModal = this.page.locator('#logInModal');
    this.loginUsernameInput = this.loginModal.locator('#loginusername');
    this.loginPasswordInput = this.loginModal.locator('#loginpassword');
    this.loginSubmitButton = this.loginModal.locator('button.btn-primary');

    this.signupModal = this.page.locator('#signInModal');
    this.signupUsernameInput = this.signupModal.locator('#sign-username');
    this.signupPasswordInput = this.signupModal.locator('#sign-password');
    this.signupSubmitButton = this.signupModal.locator('button.btn-primary');
  }

  async open(baseUrl = LOGIN_PAGE_DATA.baseUrl): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  }

  async openLoginModal(): Promise<void> {
    // #login2 uses Bootstrap's data-toggle="modal", so clicking it while the
    // modal is already open would toggle it closed instead of opening it.
    if (!(await this.loginModal.isVisible())) {
      // force: true — the homepage carousel reflows continuously, which can
      // make Playwright's actionability "stable" check hang indefinitely.
      await this.loginNavLink.click({ force: true });
    }
    await expect(this.loginModal).toBeVisible();
  }

  async openSignupModal(): Promise<void> {
    if (!(await this.signupModal.isVisible())) {
      await this.signupNavLink.click({ force: true });
    }
    await expect(this.signupModal).toBeVisible();
  }

  // Submits the signup form and resolves with the app's alert text
  // (e.g. "Sign up successful." or "This user already exist.").
  async signup(username: string, password: string): Promise<string> {
    await this.openSignupModal();
    await this.signupUsernameInput.fill(username);
    await this.signupPasswordInput.fill(password);
    const alertMessage = this.captureNextAlert();
    await this.signupSubmitButton.click({ force: true });
    const message = await alertMessage;
    // The app never closes the modal itself after the alert is dismissed.
    await this.closeModal(this.signupModal);
    return message;
  }

  // Idempotent account bootstrap used by fixtures — accepts either a fresh
  // signup or an "already exists" response and fails only on a real error.
  async ensureAccountExists(username: string, password: string): Promise<void> {
    const message = await this.signup(username, password);
    const known = [LOGIN_PAGE_DATA.alerts.signupSuccess, LOGIN_PAGE_DATA.alerts.signupDuplicate];
    if (!known.includes(message)) {
      throw new Error(`Unexpected sign up response: "${message}"`);
    }
  }

  async login(username: string, password: string): Promise<void> {
    await this.openLoginModal();
    await this.loginUsernameInput.fill(username);
    await this.loginPasswordInput.fill(password);
    await this.loginSubmitButton.click({ force: true });
    await expect(this.welcomeLabel).toContainText(`Welcome ${username}`, {
      timeout: LOGIN_PAGE_DATA.timeouts.action,
    });
    console.log(`✅ Login OK | user: ${username}`);
  }

  // Submits the login form and resolves with the alert text instead of
  // asserting success — used to verify negative login scenarios.
  async loginExpectingAlert(username: string, password: string): Promise<string> {
    await this.openLoginModal();
    await this.loginUsernameInput.fill(username);
    await this.loginPasswordInput.fill(password);
    const alertMessage = this.captureNextAlert();
    await this.loginSubmitButton.click({ force: true });
    const message = await alertMessage;
    await this.closeModal(this.loginModal);
    return message;
  }

  async logout(): Promise<void> {
    await this.logoutNavLink.click({ force: true });
    await expect(this.loginNavLink).toBeVisible();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.logoutNavLink.isVisible();
  }

  async getWelcomeText(): Promise<string> {
    return this.welcomeLabel.innerText();
  }

  // Closes a Bootstrap modal via its "Close" button, if it's still open.
  private async closeModal(modal: Locator): Promise<void> {
    if (await modal.isVisible()) {
      await modal.locator('button.btn-secondary').click({ force: true });
      await expect(modal).toBeHidden();
      // Let the Bootstrap fade-out transition finish before the next action.
      await this.page.waitForTimeout(300);
    }
  }

  // Resolves with the message of the next native `window.alert` and accepts it.
  private captureNextAlert(): Promise<string> {
    return new Promise((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });
  }
}
