import { test, expect } from '@playwright/test';
test('real dictionary results, responsive API, bounded target and browser output', async ({ page,request }) => {
  expect((await request.post('http://localhost:8000/api/projects/p_demo/attacks',{data:{kind:'dictionary',budgetSeconds:999}})).status()).toBe(422);
  expect((await request.post('http://localhost:8000/api/projects/missing/attacks',{data:{kind:'dictionary'}})).status()).toBe(404);
  await page.goto('/p/p_demo/attack');
  await page.getByRole('button',{name:'Crack demo passwords',exact:true}).click();
  await expect(page.locator('.attack-output')).toContainText('1,350 / 3,000 recovered');
  expect((await request.get('http://localhost:8000/api/health')).ok()).toBeTruthy();
  await expect(page.locator('.attack-output')).toContainText('20 hash evaluations');
  await page.screenshot({path:'D:/cryptiq/core/.runtime/dictionary-live.png',fullPage:true});
});
