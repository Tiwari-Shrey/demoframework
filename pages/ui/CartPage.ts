import { Page, Locator, expect } from '@playwright/test';
import { LOGIN_PAGE_DATA } from '@testdata/shared/login-data';

// Page object for the demoblaze.com cart page (cart.html).
export class CartPage {
  private readonly cartRows: Locator;
  private readonly totalLabel: Locator;
  private readonly placeOrderButton: Locator;
  private readonly rowByName: (name: string) => Locator;

  constructor(private readonly page: Page) {
    this.cartRows = this.page.locator('#tbodyid tr');
    this.totalLabel = this.page.locator('#totalp');
    this.placeOrderButton = this.page.locator('button', { hasText: 'Place Order' });
    this.rowByName = (name) => this.cartRows.filter({ hasText: name });
  }

  async open(baseUrl = LOGIN_PAGE_DATA.baseUrl): Promise<void> {
    await this.page.goto(`${baseUrl}/cart.html`, { waitUntil: 'domcontentloaded' });
  }

  // Cart rows are populated asynchronously after the page loads/updates —
  // wait for the expected count instead of relying on a fixed sleep.
  async waitForItemCount(count: number, timeout = 15_000): Promise<void> {
    await expect(this.cartRows).toHaveCount(count, { timeout });
  }

  async getItemNames(): Promise<string[]> {
    return this.cartRows.locator('td:nth-child(2)').allInnerTexts();
  }

  async getItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async isProductInCart(name: string): Promise<boolean> {
    return (await this.rowByName(name).count()) > 0;
  }

  async getTotal(): Promise<number> {
    const text = await this.totalLabel.innerText();
    return Number(text.trim()) || 0;
  }

  async deleteItem(name: string): Promise<void> {
    await this.rowByName(name).locator('a', { hasText: 'Delete' }).click({ force: true });
    await expect(this.rowByName(name)).toHaveCount(0);
  }

  // Empties the cart so add-to-cart scenarios start from a known, deterministic state.
  async clearCart(): Promise<void> {
    await this.open();
    // Let the initial async row population settle before counting.
    await this.page.waitForTimeout(2000);
    for (let i = 0; i < 20 && (await this.getItemCount()) > 0; i++) {
      await this.cartRows.first().locator('a', { hasText: 'Delete' }).click({ force: true });
      await this.page.waitForTimeout(600);
    }
    // Guards against rows that were still loading when the loop above checked;
    // this retries instead of trusting a single, possibly-stale read.
    await this.waitForItemCount(0, 20_000);
  }

  async isPlaceOrderVisible(): Promise<boolean> {
    return this.placeOrderButton.isVisible();
  }
}
