const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage();
 await page.route('https://video.test/**',route=>route.fulfill({contentType:'text/html',body:'<script>window.playbackPosition=42</script>Video'}));
 await page.setContent('<main id="view"></main>');
 await page.addScriptTag({content:fs.readFileSync('trailer-carousel.js','utf8')});
 await page.evaluate(()=>{window.view=document.querySelector('#view');window.markup=(key,n)=>`<header>Title ${n}</header><section data-trailer="${key}"><iframe src="https://video.test/player"></iframe><span>Live player</span></section><p>Metadata ${n}</p>`;TrailerCarousel.render(view,markup('catalog:a',0))});
 const frame=await (await page.locator('iframe').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.playbackPosition===42);
 await frame.evaluate(()=>window.playbackPosition=87);
 await page.evaluate(()=>{window.original=document.querySelector('iframe');window.removals=0;new MutationObserver(records=>{for(const r of records)for(const node of r.removedNodes)if(node===original||node.contains?.(original))window.removals++}).observe(view,{childList:true,subtree:true});for(let i=1;i<=30;i++)TrailerCarousel.render(view,markup('catalog:a',i))});
 assert.equal(await page.evaluate(()=>document.querySelector('iframe')===original),true);
 assert.equal(await page.evaluate(()=>removals),0);
 assert.equal(await frame.evaluate(()=>window.playbackPosition),87);
 assert.equal(await page.locator('header').textContent(),'Title 30');assert.equal(await page.locator('main > p').textContent(),'Metadata 30');
 await page.evaluate(()=>TrailerCarousel.render(view,markup('catalog:b',0)));
 assert.equal(await page.evaluate(()=>document.querySelector('iframe')===original),false);
 await page.evaluate(()=>TrailerCarousel.render(view,'<h1>Catalogue</h1>'));assert.equal(await page.locator('iframe').count(),0);
 await browser.close();console.log('Trailer refresh: 30 metadata updates keep the live iframe connected and its playback state; navigation replaces it.');
})().catch(e=>{console.error(e);process.exit(1)});
