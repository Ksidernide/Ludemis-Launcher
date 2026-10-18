const {chromium}=require(require.resolve('playwright',{paths:[process.cwd()]})),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage();
 await page.setContent('<html data-build-version="1.13"><body><small data-app-version>VERSION 1.13</small></body></html>');
 await page.addScriptTag({content:fs.readFileSync('../publication/version-check/app-version.js','utf8')});
 await page.evaluate(()=>LudemisVersion.sync({app_version:'1.17'},document));
 assert.equal(await page.locator('[data-app-version]').textContent(),'VERSION 1.17');
 await page.evaluate(()=>LudemisVersion.sync({app_version:'2.38.1'},document));
 assert.equal(await page.locator('[data-app-version]').textContent(),'VERSION 2.38.1');
 await browser.close();console.log('Sidebar follows actual backend version and future updates, replacing stale build labels.');
})().catch(e=>{console.error(e);process.exit(1)});
