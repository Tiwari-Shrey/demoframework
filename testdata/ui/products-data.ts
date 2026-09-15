import type { ProductCategory } from '@pages/wpd-planogram/HomePage';

export const PRODUCTS_DATA: Record<ProductCategory, { name: string; price: number }[]> = {
  Phones: [
    { name: 'Samsung galaxy s6', price: 360 },
    { name: 'Nokia lumia 1520', price: 820 },
    { name: 'Nexus 6', price: 650 },
  ],
  Laptops: [
    { name: 'Sony vaio i5', price: 790 },
    { name: 'Sony vaio i7', price: 790 },
    { name: 'MacBook air', price: 700 },
  ],
  Monitors: [{ name: 'Apple monitor 24', price: 400 }],
};

export const SAMPLE_PRODUCT = { name: 'Samsung galaxy s6', price: 360 };
export const SECOND_PRODUCT = { name: 'Nokia lumia 1520', price: 820 };
export const NON_EXISTENT_PRODUCT_NAME = 'Definitely not a real product 12345';
