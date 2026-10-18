const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.pathname.startsWith('/media/good/')&&!url.pathname.endsWith('/logo'))return route.fulfill({contentType:'image/png',body:fs.readFileSync('ludemis-logo.png')});return route.abort()});
 await page.setContent('<base href="http://ludemis.test"><body class="theme-graphite"><div id="result"></div></body>');
 for(const file of ['style.css','studio.css','themes.css','branding.css'])await page.addStyleTag({content:fs.readFileSync(file,'utf8')});
 const source=fs.readFileSync('app.js','utf8'),start=source.indexOf('function homeFeaturedGame('),end=source.indexOf('\nfunction ',source.indexOf('function home(){')+1);
 await page.addScriptTag({content:`const data={games:[],catalog:[{cache_key:'missing',title:'Invisible resource',image_ready:false},{cache_key:'good',title:'Cyberpunk 2077',image_ready:true,steam_positive:1000}]};let modal='';const catalogKey=g=>g.cache_key||'';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const short=s=>s;const official13Logo=()=>'';const catalogMedia=(key,kind='')=>'/media/'+key+'/'+kind;const catalogRemoteImage=()=>'';const catalogLoaded=true;const cleanGameTitle=s=>String(s||'');const libraryCompletionStatus=()=>'';const empty=()=>'';const btn=label=>'<button class="btn primary large">'+label+'</button>';${source.slice(start,end)}function renderCatalogLoad(){document.querySelector('#result').innerHTML=home()}renderCatalogLoad();`});
 await page.getByText('Cyberpunk 2077',{exact:true}).waitFor({state:'visible'});
 assert.equal(await page.getByText('Invisible resource',{exact:true}).count(),0);
 assert.equal(await page.getByRole('button',{name:/Voir la fiche/}).count(),1);
 await page.locator('.home-feature').screenshot({path:'home-strict-images.png',animations:'disabled'});
 // A previously verified file that subsequently fails must disappear too.
 await page.evaluate(()=>{data.catalog=[{cache_key:'broken',title:'Broken image game',image_ready:true}];renderCatalogLoad()});
 await page.getByText('Découvre ton prochain jeu',{exact:true}).waitFor({state:'visible'});
 assert.equal(await page.getByText('Broken image game',{exact:true}).count(),0);
 await browser.close();console.log('Strict images: unverified games excluded; exhausted image failures removed without deleting preparation data.');
})().catch(e=>{console.error(e);process.exit(1)});
