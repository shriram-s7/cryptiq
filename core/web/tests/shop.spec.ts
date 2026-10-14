import { expect, test } from '@playwright/test';

test('real shop login, basket and no-payment checkout', async ({ page }) => {
  await page.goto('http://127.0.0.1:5050/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A little fresher.');
  await page.screenshot({ path: '../.runtime/shop-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await page.getByLabel('Test email').fill('priya@example.test');
  await page.getByLabel('Test password').fill('priya@123');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByText('Hello, Priya')).toBeVisible();
  await page.getByRole('button', { name: 'Add Farm tomatoes to basket' }).click();
  await page.getByRole('link', { name: 'Basket (1)' }).click();
  await expect(page.getByText('Farm tomatoes × 1')).toBeVisible();
  await page.getByRole('button', { name: 'Place demo order — no payment' }).click();
  await expect(page.getByText('DEMO ORDER CONFIRMED')).toBeVisible();
  await expect(page.getByText(/No money was charged/)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5050/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
