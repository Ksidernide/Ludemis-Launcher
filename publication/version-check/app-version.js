(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.LudemisVersion=api;api.sync({},root.document)}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function value(snapshot,doc){return String(snapshot?.app_version||doc?.documentElement?.dataset?.buildVersion||'…')}
 function sync(snapshot,doc){const version=value(snapshot,doc);if(doc)for(const label of doc.querySelectorAll('[data-app-version]'))label.textContent='VERSION '+version;return version}
 return {value,sync};
});
