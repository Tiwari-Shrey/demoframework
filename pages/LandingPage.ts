import { Page, Locator } from '@playwright/test';

/** Welcome screen shown at the site root before login. */
export class LandingPage {
  readonly main: Locator;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly enterButton: Locator;
  readonly heroImageButton: Locator;
  readonly scoreboardButton: Locator;
  readonly skipToContentLink: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main', { name: 'Daily Feast Welcome Screen' });
    this.heading = page.getByRole('heading', { level: 1, name: 'DAILY FEAST' });
    this.subtitle = this.main.getByText('BY SDET TECH', { exact: true });
    this.enterButton = page.getByRole('button', { name: 'Smash to enter and book your lunch' });
    this.heroImageButton = page.getByRole('button', { name: 'Tap to enter and book lunch' });
    this.scoreboardButton = page.getByRole('button', { name: 'View the scoreboard' });
    this.skipToContentLink = page.getByRole('link', { name: 'Skip to main content' });
  }

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async enter(): Promise<void> {
    await this.enterButton.click();
  }

  async openScoreboard(): Promise<void> {
    await this.scoreboardButton.click();
  }
}
