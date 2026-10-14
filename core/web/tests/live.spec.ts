import { test, expect } from '@playwright/test';

test('live demo scan, persisted overview, findings evidence and mobile layout', async ({ page, request }) => {
  await page.goto('/scan');
  await page.getByRole('button', { name: 'Start security scan' }).click();
  await expect(page).toHaveURL(/\/p\/p_demo$/);
  await expect(page.locator('.score-ring strong')).toHaveText('38');
  await expect(page.getByText('3,000 demo customers', { exact: false })).toBeVisible();
  const project = await (await request.get('http://localhost:8000/api/projects/p_demo')).json();
  expect(project.scan.stages).toHaveLength(5);
  expect(project.scan.findings).toHaveLength(8);
  await page.reload();
  await expect(page.locator('.score-ring strong')).toHaveText('38');
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(800);
  await page.screenshot({ path: 'D:/cryptiq/core/.runtime/overview-live.png' });
  await page.getByRole('link', { name: 'Review 8 findings' }).click();
  await expect(page.locator('.finding-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'Critical', exact: true }).click();
  await expect(page.locator('.finding-card')).toHaveCount(3);
  await page.getByRole('combobox').selectOption('developer');
  await page.getByRole('button', { name: 'Details', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Source evidence', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.setViewportSize({ width:390, height:844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('API failure is actionable and retry recovers', async ({ page }) => {
  await page.route('**/api/projects/p_demo', route => route.abort());
  await page.goto('/p/p_demo');
  await expect(page.getByRole('alert')).toContainText('Cannot reach the Core API');
  await page.unroute('**/api/projects/p_demo');
  await page.getByRole('button', { name:'Try again' }).click();
  await expect(page.locator('.score-ring strong')).toHaveText('38');
});

test('ZIP validation and navigation cancel live polling', async ({ page }) => {
  await page.goto('/scan');
  await page.getByRole('radio', { name: /Upload your source ZIP/ }).check();
  await page.locator('input[type=file]').setInputFiles({ name:'bad.zip', mimeType:'application/zip', buffer:Buffer.from('invalid') });
  await page.getByRole('button', { name:'Start security scan' }).click();
  await expect(page.getByRole('alert')).toContainText('valid ZIP');
  await page.getByRole('radio', { name: /Chennai Organics/ }).check();
  let polls=0;
  await page.route('**/api/scans/*', async route => {
    polls++;
    await route.fulfill({ json:{ id:'pending', status:'running', stages:[] } });
  });
  await page.getByRole('button', { name:'Start security scan' }).click();
  await expect(page.getByRole('button', { name:'Scanning' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name:'Findings', exact:true }).click();
  const count=polls;
  await page.waitForTimeout(700);
  expect(polls).toBe(count);
  await expect(page).toHaveURL(/findings$/);
});
