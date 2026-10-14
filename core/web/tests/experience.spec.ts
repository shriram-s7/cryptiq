import {test,expect} from '@playwright/test';
const api='http://127.0.0.1:8000', shop='http://127.0.0.1:5050';
test('separate fixes route and labeled transaction animations',async({page})=>{
 await page.goto('/p/p_demo/fix');await expect(page.getByRole('heading',{name:'Fixes',exact:true})).toBeVisible();
 await expect(page.locator('.repair-option')).toHaveCount(4);
 await page.goto('/p/p_demo/attack');await expect(page).toHaveURL(/\/hacker$/);
 await page.locator('.record-choice').first().click();
 await page.getByRole('button',{name:/Transaction integrity/}).click();
 await page.getByRole('button',{name:'Play scenario'}).click();
 await expect(page.locator('.attack-progress')).toContainText('Scripted animation');
 await expect(page.locator('.attack-verdict')).toContainText('SCRIPTED TRANSACTION SCENARIO');
});
test('plan entry, guided setup, honest URL scope, responsive experiences',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/See the exposure/})).toBeVisible();
 await page.screenshot({path:'D:/cryptiq/core/.runtime/redesign-home.png',fullPage:true});
 await page.getByRole('button',{name:'Explore Free',exact:true}).click();
 await page.getByRole('button',{name:/A public website/}).click();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByLabel('Website URL').fill('https://example.test');
 await page.getByRole('checkbox',{name:/I own this project/}).check();
 await page.getByRole('button',{name:'Confirm project'}).click();
 await expect(page.getByRole('heading',{name:'Website checks are coming.'})).toBeVisible();
 await page.goto('/p/p_demo/verify');
 await expect(page.getByRole('heading',{name:'Verification requires Starter'})).toBeVisible();
 await page.goto('/p/p_demo/fix');
 await expect(page.getByRole('link',{name:'Compare demo plans'})).toBeVisible();
 for(const route of ['/hacker','/partner-demo']){
  await page.goto(route);await expect(page.locator('h1')).toBeVisible();
  await page.screenshot({path:`D:/cryptiq/core/.runtime/redesign-${route.slice(1)}.png`,fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/','/scan','/hacker','/partner-demo']){await page.goto(route);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);}
 await page.goto(shop);await page.getByLabel('Search products').fill('honey');await expect(page.locator('.product:visible')).toHaveCount(1);
 await page.getByLabel('Search products').fill('');await page.getByRole('button',{name:'Fruits',exact:true}).click();await expect(page.locator('.product:visible')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.setViewportSize({width:1280,height:800});await page.goto(shop);await page.screenshot({path:'D:/cryptiq/core/.runtime/redesign-shop.png',fullPage:true});
 expect(errors).toEqual([]);
});
test('connected shop events, selected-account attack, repair and separate verification',async({page,request,context})=>{
 test.setTimeout(180000);
 const reset=await request.post(`${api}/api/demo/reset`,{data:{confirm:true}});expect(reset.ok()).toBeTruthy();
 await page.goto('/');await page.getByRole('button',{name:'Explore Business',exact:true}).click();
 await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('checkbox',{name:/I own this project/}).check();await page.getByRole('button',{name:'Confirm project'}).click();await page.getByRole('button',{name:'Start security scan'}).click();
 await expect(page.locator('.score-ring strong')).toHaveText('38',{timeout:20000});
 await page.screenshot({path:'D:/cryptiq/core/.runtime/redesign-overview.png',fullPage:true});
 const store=await context.newPage();await store.goto(`${shop}/login`);await store.getByLabel('Phone number or test email').fill('priya@example.test');await store.getByLabel('Test password').fill('priya@123');await store.getByRole('button',{name:'Log in',exact:true}).click();
 await store.getByRole('button',{name:'Add Farm tomatoes to basket'}).click();await store.getByRole('link',{name:'Basket (1)'}).click();await store.getByRole('button',{name:'Place demo order — no payment'}).click();await expect(store.getByText('DEMO ORDER CONFIRMED')).toBeVisible();
 await page.goto('/hacker');await page.getByRole('button',{name:/Sign-in observed/}).first().click();await page.getByRole('button',{name:'Run attempt'}).click();await expect(page.locator('.attack-verdict')).toContainText('priya@123',{timeout:20000});
 await page.screenshot({path:'D:/cryptiq/core/.runtime/redesign-hacker-result.png',fullPage:true});
 const events=await(await request.get(`${api}/api/demo/activity`)).json();expect(events.events.some((e:{kind:string})=>e.kind==='checkout')).toBeTruthy();expect(JSON.stringify(events)).not.toContain('priya@123');
 await page.goto('/p/p_demo/fix');await page.getByRole('button',{name:'Prepare fixes for review'}).click();await page.getByRole('button',{name:'Apply all four demo fixes'}).click();await expect(page.getByText('Migration complete. Verification is still required.')).toBeVisible({timeout:90000});
 await page.getByRole('link',{name:/Continue to verification/}).click();await page.getByRole('button',{name:'Run four verification checks'}).click();await expect(page.getByText('Verified. 4 of 4 checks passed.',{exact:true})).toBeVisible({timeout:60000});
 await page.screenshot({path:'D:/cryptiq/core/.runtime/redesign-verified.png',fullPage:true});
 await page.goto('/partner-demo');await expect(page.locator('.portfolio-metrics')).toContainText('91');
 await store.goto(`${shop}/signup`);await store.getByLabel('Name',{exact:true}).fill('Fresh Demo');await store.getByLabel('Test phone number').fill('9876543210');await store.getByLabel('Test password').fill('local-long-random-demo-4827!');await store.getByRole('button',{name:'Create demo account'}).click();await expect(store.getByText('Hello, Fresh')).toBeVisible();
 await page.goto('/hacker');await page.getByRole('button',{name:/New account created/}).first().click();await page.getByRole('button',{name:'Run attempt'}).click();await expect(page.getByRole('heading',{name:'No recovery for this account.'})).toBeVisible({timeout:20000});
 await page.screenshot({path:'D:/cryptiq/core/.runtime/redesign-protected.png',fullPage:true});
});
