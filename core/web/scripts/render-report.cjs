const {chromium}=require('playwright');
(async()=>{
 const [url,output]=process.argv.slice(2);
 const browser=await chromium.launch({headless:true});
 try{const page=await browser.newPage();await page.goto(url);await page.evaluate(()=>document.fonts.ready);await page.pdf({path:output,format:'A4',printBackground:true,preferCSSPageSize:true});}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
