import { expect, test } from '@playwright/test';

test('six routes render, five sidebar links work, and missing pages recover', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const routes = [
    ['/scan', 'Find out what needs protecting.'],
    ['/p/p_demo', 'Overview'], ['/p/p_demo/findings', 'Findings'],
    ['/p/p_demo/attack', 'Attack Lab'], ['/p/p_demo/fix', 'Fix & Verify'], ['/p/p_demo/report', 'Report'],
  ];
  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await expect(page.getByRole('navigation', { name: 'Project navigation' }).getByRole('link')).toHaveCount(5);
    await expect(page.getByRole('link', { name: 'CryptIQ home on Hub' })).toHaveAttribute('href', 'http://localhost:5174/');
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
    expect(dimensions.width).toBeLessThanOrEqual(1280);
    if (route === '/p/p_demo') expect(dimensions.height).toBeLessThanOrEqual(800);
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Findings', exact: true }).click();
  await expect(page).toHaveURL(/\/findings$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Findings', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.goto('/p/another-project/attack');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Report', exact: true })).toHaveAttribute('href', '/p/another-project/report');
  for (const route of ['/missing', '/p/p_demo/missing']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page isn’t in your workspace.');
    await page.getByRole('link', { name: 'Back to start' }).click();
    await expect(page).toHaveURL(/\/scan$/);
  }
  await page.goto('/');
  await expect(page).toHaveURL(/\/scan$/);
  expect(errors).toEqual([]);
});

test('keyboard skip link, narrow layout, local fonts, and report cross-link', async ({ page }) => {
  await page.goto('/scan');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('400 15px Inter'))).toBe(true);
  await page.screenshot({ path: 'D:/cryptiq/core/.runtime/scan-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'D:/cryptiq/core/.runtime/scan-mobile.png', fullPage: true });
  await page.goto('/p/p_demo/report');
  await expect(page.getByRole('link', { name: 'Open Hub badge page (separate app)' })).toHaveAttribute('href', 'http://localhost:5174/badge/chennai-organics');
});
