const { chromium } = require('playwright');
(async()=>{
 let text='';for await(const chunk of process.stdin)text+=chunk;
 const input=JSON.parse(text), result={app:{pass:false,detail:''},signup:{pass:false,detail:''},email:input.email,orderId:null};
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();page.setDefaultTimeout(10000);
  await page.goto('http://localhost:5050/login');
  await page.locator('[name=email]').fill('priya@example.test');await page.locator('[name=password]').fill('priya@123');
  await page.getByRole('button',{name:'Log in',exact:true}).click();await page.waitForURL('http://localhost:5050/');
  await page.locator('button.add').first().click();await page.goto('http://localhost:5050/checkout');
  await page.getByRole('button',{name:'Place demo order — no payment'}).click();await page.waitForURL(/\/orders\/\d+$/);
  result.orderId=Number(page.url().split('/').pop());
  const cookies=await page.context().cookies();
  if(!cookies.some(c=>c.name==='session'&&c.secure))throw Error('Session cookie is not Secure');
  result.app={pass:true,detail:'Existing Priya login, real HTTP checkout and Secure cookie passed in Chromium.'};
  await page.route('**/signup', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    const form = new URLSearchParams(route.request().postData());
    form.set('email', input.email); // Internal identity for cleanup; not a visible signup field.
    form.set('id_number', 'FAKE-VERIFY');
    form.set('address', 'Fake verification street');
    await route.continue({postData: form.toString()});
  });
  await page.goto('http://localhost:5050/signup');
  for(const [field,value] of Object.entries({name:'Verification Test',phone:'9000000000',password:input.password}))await page.locator(`[name=${field}]`).fill(value);
  await page.getByRole('button',{name:'Create demo account'}).click();await page.waitForURL('http://localhost:5050/');
  result.signup={pass:true,detail:'Fresh signup succeeded over the live shop HTTP interface.'};
 }catch(error){result.error=error.message;}finally{await browser.close();console.log(JSON.stringify(result));}
})();
