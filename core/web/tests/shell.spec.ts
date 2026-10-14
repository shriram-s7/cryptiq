import {expect,test} from '@playwright/test';
test('current product routes render without browser errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const route of ['/','/scan','/p/p_demo','/p/p_demo/findings','/p/p_demo/fix','/p/p_demo/verify','/p/p_demo/report','/hacker','/partner-demo']){
  await page.goto(route);await expect(page.locator('h1').first()).toBeVisible();
 }
 await page.goto('/p/p_demo/attack');await expect(page).toHaveURL(/\/hacker$/);
 await expect(page.getByRole('region',{name:'Shop activity notifications'})).toBeAttached();
 expect(errors).toEqual([]);
});
