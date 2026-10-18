(function(root){
 'use strict';
 let apiPromise,current;
 const positions=new Map();
 function loadAPI(){
  if(root.YT?.Player)return Promise.resolve(root.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{const previous=root.onYouTubeIframeAPIReady;root.onYouTubeIframeAPIReady=()=>{previous?.();resolve(root.YT)};const script=root.document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{apiPromise=null;reject(Error('Lecteur YouTube indisponible'))};root.document.head.append(script)});
  return apiPromise;
 }
 function create(panel,videos,YT,clock=root){
  let index=positions.get(panel.dataset.trailer)||0;if(index>=videos.length)index=0;
  let player,interval,advance,endInterval,disposed=false,ready=false,endedAt=null;
  const timer=panel.querySelector('[data-trailer-timer]'),fill=panel.querySelector('[data-trailer-progress]'),caption=panel.querySelector('[data-trailer-countdown]');
  const title=panel.querySelector('[data-trailer-title]'),count=panel.querySelector('[data-trailer-count]'),external=panel.querySelector('[data-action="open-trailer"]');
  function hide(){timer.hidden=true;fill.style.transform='scaleX(0)'}
  function cancelEnd(){if(advance!==undefined)clock.clearTimeout(advance);if(endInterval!==undefined)clock.clearInterval(endInterval);advance=endInterval=undefined;endedAt=null}
  function labels(){positions.set(panel.dataset.trailer,index);title.textContent=videos[index].name;count.textContent=(index+1)+' / '+videos.length;external.dataset.video=videos[index].id}
  function show(progress,text){timer.hidden=false;fill.style.transform='scaleX('+Math.max(0,Math.min(1,progress))+')';caption.textContent=text}
  function change(direction){if(disposed||!ready||videos.length<2)return;cancelEnd();hide();index=(index+direction+videos.length)%videos.length;labels();player.loadVideoById(videos[index].id)}
  function tick(){if(disposed||videos.length<2||endedAt!==null)return;const duration=Number(player?.getDuration?.()),time=Number(player?.getCurrentTime?.()),state=player?.getPlayerState?.();if(duration>0&&duration-time<=5&&duration-time>=0&&(state===1||state===2)){show((5-(duration-time))/7,'Vidéo suivante après la fin')}else hide()}
  function state(event){if(disposed)return;if(event.data===0&&videos.length>1){if(advance!==undefined)return;endedAt=clock.Date.now();show(5/7,'Vidéo suivante dans 2 s');endInterval=clock.setInterval(()=>{const elapsed=clock.Date.now()-endedAt;show((5+elapsed/1000)/7,'Vidéo suivante dans '+Math.max(1,Math.ceil((2000-elapsed)/1000))+' s')},50);advance=clock.setTimeout(()=>change(1),2000)}else{cancelEnd();tick()}}
  const arrows=[...panel.querySelectorAll('[data-trailer-direction]')];const handlers=arrows.map(button=>{button.disabled=true;const fn=()=>change(Number(button.dataset.trailerDirection));button.addEventListener('click',fn);return fn});
  labels();hide();
  player=new YT.Player(panel.querySelector('iframe'),{events:{onReady:()=>{if(disposed)return;ready=true;arrows.forEach(button=>button.disabled=videos.length<2);if(index)player.cueVideoById(videos[index].id);interval=clock.setInterval(tick,100)},onStateChange:state,onError:()=>{cancelEnd();hide()}}});
  return {panel,destroy(){disposed=true;cancelEnd();if(interval!==undefined)clock.clearInterval(interval);arrows.forEach((b,i)=>b.removeEventListener('click',handlers[i]));player?.destroy?.()},change};
 }
 function mount(panel,videos){if(current?.panel===panel)return;current?.destroy();current=null;if(!panel||!videos?.length)return;const pending={panel,destroy(){this.cancelled=true}};current=pending;loadAPI().then(YT=>{if(current!==pending||pending.cancelled||!panel.isConnected)return;current=create(panel,videos,YT)}).catch(()=>{})}
 // Keep the live iframe connected: detaching and reinserting it also resets playback.
 function render(view,html){
  const template=view.ownerDocument.createElement('template');template.innerHTML=html;
  const old=view.querySelector('[data-trailer]'),next=template.content.querySelector('[data-trailer]');
  if(!old||!next||old.parentNode!==view||next.parentNode!==template.content||old.dataset.trailer!==next.dataset.trailer||!old.querySelector('iframe')||!next.querySelector('iframe')){view.innerHTML=html;return false}
  const before=[],after=[];let found=false;
  for(const node of [...template.content.childNodes]){if(node===next){found=true;continue}(found?after:before).push(node)}
  while(old.previousSibling)old.previousSibling.remove();
  while(old.nextSibling)old.nextSibling.remove();
  for(const node of before)view.insertBefore(node,old);
  for(const node of after)view.appendChild(node);
  return true;
 }
 const api={mount,create,render};if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailerCarousel=api;
})(typeof window==='object'?window:globalThis);
