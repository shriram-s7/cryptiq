import { expect, test } from '@playwright/test';

test('all Core routes render before, after and error fixtures without API requests', async ({ page }) => {
  let apiRequests = 0;
  await page.route('**/api/**', route => { apiRequests++; return route.abort(); });
  for (const path of ['/scan', '/p/p_demo', '/p/p_demo/findings', '/p/p_demo/attack', '/p/p_demo/fix', '/p/p_demo/report']) {
    await page.goto(path);
    await expect(page.getByText('Mock data · not a live scan', { exact: true })).toBeVisible();
    await expect(page.getByTestId('mock-results')).toContainText('38/100');
    await page.getByLabel('Scenario').selectOption('after');
    await expect(page.getByTestId('mock-results')).toContainText('91/100');
    await page.getByLabel('Scenario').selectOption('error');
    await expect(page.getByRole('alert')).toContainText('Mock scenario: scan service unavailable');
    await page.getByLabel('Scenario').selectOption('before');
    await expect(page.getByTestId('mock-results')).toContainText('38/100');
  }
  expect(apiRequests).toBe(0);
});
