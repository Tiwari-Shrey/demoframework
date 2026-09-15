import { Page, Locator, expect } from '@playwright/test';
import { LOGIN_PAGE_DATA } from '@testdata/shared/login-data';

export type ProductCategory = 'Phones' | 'Laptops' | 'Monitors';

// Page object for the demoblaze.com storefront (product listing + category filters).
export class HomePage {
  private readonly categoryLink: (category: ProductCategory) => Locator;
  private readonly productCards: Locator;
  private readonly productLinkByName: (name: string) => Locator;

  constructor(private readonly page: Page) {
    this.categoryLink = (category) => this.page.locator(`a.list-group-item:text-is("${category}")`);
    this.productCards = this.page.locator('.card');
    this.productLinkByName = (name) => this.page.locator('.card-title a.hrefch', { hasText: name });
  }

  async open(baseUrl = LOGIN_PAGE_DATA.baseUrl): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await expect(this.productCards.first()).toBeVisible({ timeout: 15_000 });
  }

  async filterByCategory(category: ProductCategory): Promise<void> {
    const byCatResponse = this.page.waitForResponse(
      (res) => res.url().includes('/bycat') && res.request().method() === 'POST'
    );
    // The homepage carousel animates continuously, which can make Playwright's
    // actionability "stable" check on the sidebar links hang indefinitely.
    await this.categoryLink(category).click({ force: true });
    await byCatResponse;
    await expect(this.productCards.first()).toBeVisible();
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('.card-title a.hrefch').allInnerTexts();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async openProduct(name: string): Promise<void> {
    await this.productLinkByName(name).click({ force: true });
  }
}
