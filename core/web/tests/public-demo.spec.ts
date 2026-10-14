import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const host=process.env.CRYPTIQ_DEMO_URL || 'http://localhost:8000';
test('public demo: plans, shop, exact attack, repair, reattack, verify and PDF',async({page,context,request})=>{
 test.setTimeout(240000);
 if (host.startsWith('https://')) expect((await request.get(host+'/api/demo/activity')).status()).toBe(401);
 const key=readFileSync('D:/cryptiq/core/.runtime/public-access.key','utf8').trim();
 await page.goto(host+'/?access='+key);await expect(page).toHaveURL(host+'/');
 await expect(page.getByRole('button',{name:'Explore Business',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Explore Business',exact:true}).click();
 await expect(page).toHaveURL(host+'/scan');
 // Begin a fresh fake-shop run, retaining the prior database backup locally.
 const api=context.request;
 expect((await api.post(host+'/api/demo/reset',{data:{confirm:true}})).ok()).toBeTruthy();
 const scan=await(await api.post(host+'/api/projects/p_demo/scans',{data:{source:'demo'}})).json();
 await expect.poll(async()=> (await(await api.get(host+`/api/scans/${scan.scanId}`)).json()).status).toBe('done');
 await page.evaluate(()=>localStorage.setItem('cryptiq-fixed-parts-p_demo',JSON.stringify(['fix_argon2','fix_field_enc','fix_secret_env','fix_cookie'])));
 await page.goto(host+'/p/p_demo/fix');await expect(page.locator('.counter-badge')).toHaveText('0 / 4 Applied');
 await page.getByRole('button',{name:'Select for review',exact:true}).first().click();
 await expect(page.getByRole('button',{name:'Selected for review',exact:true})).toHaveCount(1);
 await expect(page.locator('.counter-badge')).toHaveText('0 / 4 Applied');
 const popup=context.waitForEvent('page');await page.getByRole('link',{name:'Hacker console ↗',exact:true}).click();const hacker=await popup;
 await expect(hacker).toHaveURL(host+'/hacker');await expect(hacker.getByText('INTERCEPT FEED ACTIVE')).toBeVisible();
 await page.getByRole('link',{name:'Chennai Organics',exact:true}).click();await expect(page).toHaveURL(host+'/shop/');
 async function register(name:string){
  await page.goto(host+'/shop/signup');await page.getByLabel('Name',{exact:true}).fill(name);
  await page.getByLabel('Test phone number').fill('9876543210');await page.getByLabel('Test password').fill('prosculpt123');
  await page.getByRole('button',{name:'Create demo account',exact:true}).click();await expect(page).toHaveURL(host+'/shop/');
  await hacker.getByRole('region',{name:'Shop activity notifications'}).getByRole('button',{name:/New registration/}).first().click({timeout:15000});
  await hacker.getByRole('button',{name:'Run attempt',exact:true}).click();
 }
 await register('Public Before');await expect(hacker.locator('.attack-verdict')).toContainText('prosculpt123',{timeout:20000});
 await page.goto(host+'/p/p_demo/fix');await page.getByRole('button',{name:'Fix It Now',exact:true}).click();
 await expect(page.locator('progress')).toHaveCount(1,{timeout:15000});await expect(page.locator('.counter-badge')).toHaveText('0 / 4 Applied');
 await expect(page.locator('.counter-badge')).toHaveText('4 / 4 Applied',{timeout:120000});
 // Retest the SAME account and password after a real migration.
 await hacker.getByRole('button',{name:'Run attempt',exact:true}).click();
 await expect(hacker.locator('.attack-verdict')).toContainText('No recovery for this account.',{timeout:20000});
 await register('Public After');await expect(hacker.locator('.attack-verdict')).toContainText('No recovery for this account.',{timeout:20000});
 await page.goto(host+'/shop/login');await page.getByLabel('Phone number or test email').fill('9876543210');await page.getByLabel('Test password').fill('prosculpt123');await page.getByRole('button',{name:'Log in',exact:true}).click();await expect(page).toHaveURL(host+'/shop/');
 await page.goto(host+'/p/p_demo/verify');await page.getByRole('button',{name:/Run four verification checks|Run verification again/}).click();
 await expect(page.getByText('Verified. 4 of 4 checks passed.',{exact:true})).toBeVisible({timeout:90000});
 await page.goto(host+'/p/p_demo/report');await expect(page.getByRole('button',{name:'Export PDF Report',exact:true})).toBeEnabled();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export PDF Report',exact:true}).click();
 const file=await download;await file.saveAs('D:/cryptiq/core/.runtime/public-evidence.pdf');
 expect(readFileSync('D:/cryptiq/core/.runtime/public-evidence.pdf').subarray(0,5).toString()).toBe('%PDF-');
 expect(await page.locator('.report-readable-panel').first().evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
 await page.screenshot({path:'D:/cryptiq/core/.runtime/public-report.png',fullPage:true});
 await page.getByRole('link',{name:'Partner console',exact:true}).click();await expect(page.getByText('Northstar Security Advisory',{exact:true})).toBeVisible();
 await page.screenshot({path:'D:/cryptiq/core/.runtime/public-partner.png',fullPage:true});
});
