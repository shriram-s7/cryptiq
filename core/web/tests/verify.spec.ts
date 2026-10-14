import {test,expect} from '@playwright/test';
test('four live checks publish the protected score',async({page,request})=>{
 test.setTimeout(90000);
 await page.goto('/p/p_demo/fix');
 await page.getByRole('button',{name:/Run four verification checks|Run verification again/}).click();
 await expect(page.getByText('Verified. 4 of 4 checks passed.',{exact:true})).toBeVisible({timeout:70000});
 const data=await(await request.get('http://localhost:8000/api/projects/p_demo/verification')).json();
 expect(data.published).toBe(true);
 expect(data.verification.attackEvidence.tried).toBeGreaterThan(0);
 await page.getByRole('link',{name:'Open verified overview'}).click();
 await expect(page.locator('.score-ring strong')).toHaveText('91');
 await expect(page.getByText('4 OF 4 CHECKS PASSED',{exact:true})).toBeVisible();
 await page.screenshot({path:'D:/cryptiq/core/.runtime/verified-overview.png'});
});
