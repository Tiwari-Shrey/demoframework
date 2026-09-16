import { test, expect } from '@core/fixtures/ui.fixture';
import { PRODUCTS_DATA, SAMPLE_PRODUCT } from '@testdata/ui/products-data';

test.describe('demoblaze.com — Search / browse products',
  {
    tag: ['@WPDTC-3'],
  }, () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should display the full product catalog on the home page', async ({ homePage }) => {
    const productCount = await homePage.getProductCount();

    expect(productCount).toBeGreaterThan(0);
  });

  test('should find a known product by name in the catalog', async ({ homePage }) => {
    const productNames = await homePage.getProductNames();

    expect(productNames).toContain(SAMPLE_PRODUCT.name);
  });

  test('should filter products by the "Phones" category', async ({ homePage }) => {
    await homePage.filterByCategory('Phones');

    const productNames = await homePage.getProductNames();

    for (const product of PRODUCTS_DATA.Phones) {
      expect(productNames).toContain(product.name);
    }
  });

  test('should filter products by the "Laptops" category', async ({ homePage }) => {
    await homePage.filterByCategory('Laptops');

    const productNames = await homePage.getProductNames();

    expect(productNames.length).toBeGreaterThan(0);
    expect(productNames).not.toContain(SAMPLE_PRODUCT.name);
  });

  test('should open a product from search results and show matching details', async ({
    homePage,
    productDetailsPage,
  }) => {
    await homePage.openProduct(SAMPLE_PRODUCT.name);
    await productDetailsPage.waitUntilLoaded();

    expect(await productDetailsPage.getProductName()).toBe(SAMPLE_PRODUCT.name);
    expect(await productDetailsPage.getProductPrice()).toBe(SAMPLE_PRODUCT.price);
  });
});
