import { test,expect } from '@playwright/test';
test('review actual diffs and merge the full demo storage',async({page,request})=>{
 test.setTimeout(120000);
 await page.goto('/p/p_demo/fix');
 await page.getByRole('button',{name:'Prepare fixes for review',exact:true}).click();
 await expect(page.getByText('Require secure session cookies')).toBeVisible();
 await page.getByText('config.py',{exact:true}).click();
 await expect(page.locator('.diff-code').filter({hasText:'SESSION_COOKIE_SECURE'})).toContainText('+SESSION_COOKIE_SECURE = True');
 await page.getByRole('button',{name:'Merge four demo fixes'}).click();
 await expect(page.getByText('Migration complete. Verification is still required.')).toBeVisible({timeout:100000});
 const preview=await(await request.get('http://localhost:8000/api/projects/p_demo/leak-preview')).json();
 expect(preview.mode).toBe('after');expect(preview.rows[0].phone).toMatch(/^pqc:v1:/);
 const project=await(await request.get('http://localhost:8000/api/projects/p_demo')).json();expect(project.verified).toBe(false);
 await page.screenshot({path:'D:/cryptiq/core/.runtime/merge-live.png',fullPage:true});
});
