import { authTest as test, expect } from '@core/fixtures/ui.fixture';
import { SAMPLE_PRODUCT, SECOND_PRODUCT } from '@testdata/ui/products-data';

test.describe('demoblaze.com — Add to cart',
  {
    tag: ['@WPDTC-1'],
  }, () => {
  test.beforeEach(async ({ cartPage }) => {
    // Start every test from an empty cart so item counts are deterministic.
    await cartPage.clearCart();
  });

  test('should add a product to the cart from the product page', async ({
    homePage,
    productDetailsPage,
    cartPage,
  }) => {
    await homePage.open();
    await homePage.openProduct(SAMPLE_PRODUCT.name);
    await productDetailsPage.waitUntilLoaded();

    const alertMessage = await productDetailsPage.addToCart();
    expect(alertMessage).toBe('Product added.');

    await cartPage.open();
    await cartPage.waitForItemCount(1);
    expect(await cartPage.isProductInCart(SAMPLE_PRODUCT.name)).toBe(true);
    expect(await cartPage.getTotal()).toBe(SAMPLE_PRODUCT.price);
  });

  test('should add multiple products and reflect their combined total', async ({
    homePage,
    productDetailsPage,
    cartPage,
  }) => {
    for (const product of [SAMPLE_PRODUCT, SECOND_PRODUCT]) {
      await homePage.open();
      await homePage.openProduct(product.name);
      await productDetailsPage.waitUntilLoaded();
      await productDetailsPage.addToCart();
    }

    await cartPage.open();
    await cartPage.waitForItemCount(2);
    expect(await cartPage.getTotal()).toBe(SAMPLE_PRODUCT.price + SECOND_PRODUCT.price);
  });

  test('should show the "Place Order" action once the cart has items', async ({
    homePage,
    productDetailsPage,
    cartPage,
  }) => {
    await homePage.open();
    await homePage.openProduct(SAMPLE_PRODUCT.name);
    await productDetailsPage.waitUntilLoaded();
    await productDetailsPage.addToCart();

    await cartPage.open();
    await cartPage.waitForItemCount(2);

    expect(await cartPage.isPlaceOrderVisible()).toBe(true);
  });
});
