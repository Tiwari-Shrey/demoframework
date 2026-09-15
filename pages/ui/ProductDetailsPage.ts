import { Page, Locator, expect } from '@playwright/test';

// Page object for the demoblaze.com product detail page (prod.html?idp_=<id>).
export class ProductDetailsPage {
  private readonly productName: Locator;
  private readonly productPrice: Locator;
  private readonly addToCartLink: Locator;

  constructor(private readonly page: Page) {
    this.productName = this.page.locator('.name');
    this.productPrice = this.page.locator('.price-container');
    this.addToCartLink = this.page.locator('a.btn-success', { hasText: 'Add to cart' });
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.productName).toBeVisible();
  }

  async getProductName(): Promise<string> {
    return this.productName.innerText();
  }

  // Returns the numeric price parsed out of "$360 *includes tax".
  async getProductPrice(): Promise<number> {
    const text = await this.productPrice.innerText();
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : NaN;
  }

  // Clicks "Add to cart" and resolves with the confirmation alert text
  // (e.g. "Product added.").
  async addToCart(): Promise<string> {
    const alertMessage = this.captureNextAlert();
    await this.addToCartLink.click({ force: true });
    return alertMessage;
  }

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
