import { test, expect } from '@playwright/test';
test('real dictionary results, responsive API, bounded target and browser output', async ({ page,request }) => {
  expect((await request.post('http://localhost:8000/api/projects/p_demo/attacks',{data:{kind:'dictionary',budgetSeconds:999}})).status()).toBe(422);
  expect((await request.post('http://localhost:8000/api/projects/missing/attacks',{data:{kind:'dictionary'}})).status()).toBe(404);
  await page.goto('/p/p_demo/attack');
  await page.getByRole('button',{name:'Crack demo passwords',exact:true}).click();
  await expect(page.locator('.attack-output')).toContainText('1,350 / 3,000 recovered');
  expect((await request.get('http://localhost:8000/api/health')).ok()).toBeTruthy();
  await expect(page.locator('.attack-output')).toContainText('20 work iterations');
  await page.screenshot({path:'D:/cryptiq/core/.runtime/dictionary-live.png',fullPage:true});
});

test('RSA simulation visibly decrypts actual fake IDs',async({page})=>{
 await page.goto('/p/p_demo/attack');
 await page.getByRole('button',{name:'Run RSA simulation (tiny demo key)'}).click();
 await expect(page.locator('.attack-output')).toContainText('3,000 / 3,000 recovered');
 await expect(page.locator('.attack-output')).toContainText('private exponent reconstructed');
 await expect(page.locator('.newest-row .recovered-password')).toContainText('DEMO-ID-003000');
});
