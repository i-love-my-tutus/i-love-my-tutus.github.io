import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import http from 'node:http';
const root=path.resolve('.');
const requestedPaths=[];
const server=http.createServer(async(req,res)=>{
 try{
  const prefix='/i-love-my-tutus/';const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  requestedPaths.push(pathname);
  if(!pathname.startsWith(prefix))throw Error('Chemin inconnu');
  const file=path.resolve(root,pathname.slice(prefix.length)||'index.html');
  if(!file.startsWith(root+path.sep))throw Error('Chemin hors site');
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.svg':'image/svg+xml'};
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'tutus-qa-'));
const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--disable-background-networking','--no-first-run','--remote-allow-origins=*','--remote-debugging-port=9239',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let socket;
try{
 let tabs;
 for(let i=0;i<40;i++){try{tabs=await(await fetch('http://127.0.0.1:9239/json/list')).json();break;}catch{await new Promise(r=>setTimeout(r,250));}}
 assert.ok(tabs,'Edge démarré');
 socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let id=0;const pending=new Map(),exceptions=[];
 socket.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.id){const item=pending.get(data.id);if(item){pending.delete(data.id);data.error?item.reject(data.error):item.resolve(data.result);}}if(data.method==='Runtime.exceptionThrown')exceptions.push(data.params.exceptionDetails);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>reject(new Error(`Délai CDP : ${method}`)),10000);pending.set(key,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});socket.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
 const frozenClock=await send('Page.addScriptToEvaluateOnNewDocument',{source:'Date.now=()=>globalThis.__testNow ?? Date.parse("2026-10-08T20:58:59Z");'});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`
  const OriginalAudio=window.Audio;
  window.Audio=function(...args){
   const audio=new OriginalAudio(...args);window.__testAudio=audio;
   const originalPlay=audio.play.bind(audio);let first=true;
   audio.play=function(){if(first){first=false;return Promise.reject(new DOMException('Autoplay bloqué pour le test','NotAllowedError'));}return originalPlay();};
   return audio;
  };
 `});
 const url=`http://127.0.0.1:${server.address().port}/i-love-my-tutus/`;
 const waitFor=async(expression,label)=>{for(let i=0;i<80;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}const audioState=await evaluate('window.__testAudio ? {paused:__testAudio.paused,volume:__testAudio.volume,time:__testAudio.currentTime,ready:__testAudio.readyState,error:__testAudio.error?.code,visibility:document.visibilityState} : null');assert.fail(`${label}: ${JSON.stringify(audioState)}`);};
 const choose=async(language,sound)=>{
  await evaluate(`document.querySelector('input[name="language"][value="${language}"]').click();document.querySelector('input[name="sound"][value="${sound}"]').click();document.getElementById('start').click()`);
  await waitFor('!document.getElementById("experience").hidden','Expérience après confirmation');
 };
 await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
 await send('Page.navigate',{url});
 await waitFor('document.getElementById("countdown") && document.querySelectorAll("#countdown strong").length===4','Teaser chargé');
 assert.equal(await evaluate('document.getElementById("gate").hidden'),false,'Compte à rebours avant ouverture');
 assert.equal(await evaluate('document.getElementById("welcome").hidden'),true,'Aucun choix avant ouverture');
 assert.equal(await evaluate('document.getElementById("experience").hidden'),true,'Aucune lettre avant ouverture');
 assert.equal(await evaluate('typeof BIRTHDAY_CONTENT'),'undefined','Contenu privé non chargé');
 assert.equal(await evaluate('typeof window.__testAudio'),'undefined','Aucun audio avant ouverture');
 for(const timezoneId of ['Europe/Paris','Europe/Sofia','America/New_York']){
  await send('Emulation.setTimezoneOverride',{timezoneId});
  assert.deepEqual(await evaluate('[...document.querySelectorAll("#countdown strong")].map(el=>Number(el.textContent))'),[0,0,0,1],timezoneId);
 }
 for(const width of [320,375,430,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`Teaser ${width}px`);
 }
 assert.equal(requestedPaths.some(p=>/assets\/(content\.js|photos\/|audio\/)/.test(p)),false,'Aucune requête privée avant l’heure');
 await evaluate('globalThis.__testNow=Date.parse("2026-10-08T20:59:00Z")');
 await waitFor('!document.getElementById("welcome").hidden','Passage automatique à l’accueil, sans rechargement');
 assert.equal(await evaluate('document.getElementById("gate").hidden'),true);
 assert.equal(await evaluate('document.getElementById("experience").hidden'),true,'Les choix restent demandés');
 await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:frozenClock.identifier});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:'Date.now=()=>Date.parse("2026-10-08T20:59:01Z");'});
 await waitFor('window.__testAudio!==undefined','Contenu prêt avant le choix');
 assert.equal(await evaluate('document.getElementById("welcome").hidden'),false,'Choix à l’ouverture');
 assert.equal(await evaluate('document.getElementById("experience").hidden'),true,'Lettre cachée avant le choix');
 assert.equal(await evaluate('document.getElementById("welcome-form").checkValidity()'),false,'Les deux choix sont obligatoires');
 assert.equal(await evaluate('window.__testAudio.paused'),true,'Pas de son avant accord');
 for(const width of [320,375,430,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`Accueil ${width}px`);
 }
 await choose('fr','on');
 assert.equal(await evaluate('document.getElementById("experience").hidden'),false);
 await evaluate('document.fonts.ready');
 assert.equal(await evaluate('document.fonts.check(\'18px "Edu QLD Hand"\')'),true,'Police locale chargée');
 assert.equal(await evaluate('[...document.fonts].some(font=>font.family==="Edu QLD Hand" && font.status==="loaded")'),true,'Fichier de police décodé');
 assert.equal(await evaluate('getComputedStyle(document.querySelector("h1")).fontFamily.includes("Edu QLD Hand")'),true,'Police des titres');
 assert.equal(await evaluate('getComputedStyle(document.getElementById("letter-content")).fontFamily.includes("Edu QLD Hand")'),true,'Police de la lettre');
 assert.equal(await evaluate('document.querySelectorAll("#portrait-gallery img").length'),15);
 assert.equal(await evaluate('document.querySelectorAll("#together-gallery img").length'),5);
 assert.equal(await evaluate('document.getElementById("music").hidden'),false);
 assert.equal(await evaluate('document.getElementById("music").getAttribute("aria-pressed")'),'false','Autoplay refusé : contrôle fidèle');
 await evaluate('document.getElementById("begin").scrollIntoView({behavior:"instant"})');
 const begin=await evaluate('(()=>{const r=document.getElementById("begin").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
 await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...begin});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...begin});
 for(let i=0;i<40;i++){if(await evaluate('document.getElementById("music").getAttribute("aria-pressed")==="true"'))break;await new Promise(r=>setTimeout(r,100));}
 assert.equal(await evaluate('document.getElementById("music").getAttribute("aria-pressed")'),'true');
 await waitFor('window.__testAudio.volume>=.29 && window.__testAudio.currentTime>0','Lecture du MP3 et fondu');
 assert.equal(await evaluate('window.__testAudio.error'),null);
 assert.equal(await evaluate('window.__testAudio.loop'),true);
 await evaluate('document.getElementById("music").click()');
 assert.equal(await evaluate('document.getElementById("music").getAttribute("aria-pressed")'),'false');
 assert.equal(await evaluate('window.__testAudio.paused'),true);
 assert.equal(await evaluate('JSON.stringify([...document.querySelectorAll("#letter-content p")].map(p=>p.textContent))===JSON.stringify(BirthdayCore.paragraphs(BIRTHDAY_CONTENT.message))'),true);
 for(const width of [320,375,430,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
  await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,`Largeur ${width}`);
  assert.equal(await evaluate('document.getElementById("last").getBoundingClientRect().height >= 48'),true,'Bouton tactile');
 }
 await evaluate('Promise.all([...document.querySelectorAll(".photo-button img")].map(img=>{img.loading="eager";return img.decode()}))');
 assert.equal(await evaluate('[...document.querySelectorAll(".photo-button img")].every(img=>img.complete&&img.naturalWidth>0)'),true,'Toutes les photos se décodent');
 await evaluate('document.querySelector("#portrait-gallery button").click()');
 assert.equal(await evaluate('document.getElementById("lightbox").open'),true);
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 assert.equal(await evaluate('document.getElementById("lightbox").open'),false);
 await waitFor('document.activeElement===document.querySelector("#portrait-gallery button")','Focus rendu à la photo');
 await evaluate('document.querySelector("#together-gallery button").click();document.getElementById("close-photo").click()');
 assert.equal(await evaluate('document.getElementById("lightbox").open'),false);
 await evaluate('document.getElementById("reading").click()');
 assert.equal(await evaluate('document.body.classList.contains("reading-mode")'),true);
 await evaluate('document.getElementById("last").scrollIntoView({behavior:"instant"});document.getElementById("last").focus()');
 assert.equal(await evaluate('getComputedStyle(document.getElementById("last")).backgroundImage!=="none"'),true,'Fond de bouton visible');
 assert.equal(await evaluate('getComputedStyle(document.getElementById("last")).outlineStyle'),'solid','Focus clavier visible');
 assert.equal(await evaluate('document.activeElement===document.getElementById("last")'),true,'Bouton final ciblé au clavier');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.equal(await evaluate('document.getElementById("last-words").hidden'),false);
 assert.equal(await evaluate('document.getElementById("last").getAttribute("aria-expanded")'),'true');
 await evaluate('document.getElementById("last").click()');
 assert.equal(await evaluate('document.getElementById("last-words").hidden'),true);
 assert.equal(await evaluate('document.getElementById("last").getAttribute("aria-expanded")'),'false');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".star")).animationName'),'none');
 await evaluate('document.getElementById("reading").click()');
 assert.equal(await evaluate('document.body.classList.contains("reading-mode")'),false);
 await evaluate('document.getElementById("replay").click()');
 await waitFor('scrollY<100','Relecture retourne en haut');
 await send('Page.navigate',{url});
 await waitFor('window.__testAudio!==undefined','Nouvelle ouverture');
 assert.equal(await evaluate('document.getElementById("welcome").hidden'),false,'Choix redemandé après rechargement');
 assert.equal(await evaluate('document.querySelectorAll("#welcome-form input:checked").length'),0,'Aucun choix réutilisé');
 assert.equal(await evaluate('window.__testAudio.paused'),true,'Silence avant le nouveau choix');
 await choose('tr','off');
 assert.equal(await evaluate('document.documentElement.lang'),'tr');
 assert.equal(await evaluate('document.title'),'Sadece senin için, Tütüşüm');
 assert.equal(await evaluate('JSON.stringify([...document.querySelectorAll("#letter-content p")].map(p=>p.textContent))===JSON.stringify(BirthdayCore.paragraphs(BIRTHDAY_CONTENT.messages.tr))'),true,'Lettre turque intégrale');
 assert.equal(await evaluate('[...document.querySelectorAll("#experience [data-i18n]")].every(el=>el.textContent===BIRTHDAY_I18N.tr[el.dataset.i18n])'),true,'Toute l’interface en turc');
 assert.equal(await evaluate('document.querySelector("#portrait-gallery img").alt'),'Tütüş’ün portresi 1');
 assert.equal(await evaluate('document.getElementById("music").getAttribute("aria-label")'),'Müziği aç');
 assert.equal(await evaluate('document.querySelectorAll("#story-lines p").length'),4,'Aperçus turcs présents');
 await evaluate('document.getElementById("begin").click()');
 assert.equal(await evaluate('window.__testAudio.paused'),true,'Sans musique reste silencieux au clic et au scroll');
 for(const width of [320,375,430,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`Turc ${width}px`);
 }
 await evaluate('document.getElementById("music").click()');
 // Premier essai artificiellement refusé : le second clic doit bien démarrer.
 await evaluate('document.getElementById("music").click()');
 await waitFor('!window.__testAudio.paused','Reprise manuelle');
 const before=await evaluate('window.__testAudio.currentTime');
 await evaluate('document.getElementById("final").scrollIntoView({behavior:"instant"});document.getElementById("replay").click()');
 assert.equal(await evaluate('window.__testAudio.paused'),false,'Relecture conserve le son');
 assert.ok(await evaluate('window.__testAudio.currentTime')>=before,'Relecture ne recommence pas le morceau');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:900,deviceScaleFactor:1,mobile:true});
 await evaluate('document.documentElement.style.fontSize="200%"');
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Texte à 200 % sans débordement');
 await evaluate('document.documentElement.style.fontSize=""');
 // Une image manquante ne doit pas casser la galerie.
 await evaluate('(()=>{const img=document.querySelector("#portrait-gallery img");img.loading="eager";img.removeAttribute("srcset");img.src="missing-photo.jpg"})()');
 await waitFor('document.querySelector("#portrait-gallery .photo-error")!==null','Repli photo manquante');
 assert.equal(await evaluate('document.querySelector("#portrait-gallery button").disabled'),true);
 assert.equal(await evaluate('document.querySelector("#portrait-gallery .photo-error").textContent'),'Bu fotoğraf yüklenemedi.','Erreur photo traduite');
 // Un échec de chargement du contenu doit pouvoir être corrigé avec Réessayer.
 await send('Network.setBlockedURLs',{urls:['*assets/content.js*']});
 await send('Page.navigate',{url});
 await waitFor('document.getElementById("retry")!==null','Bouton Réessayer');
 await evaluate('document.querySelector("input[name=language][value=tr]").click();document.querySelector("input[name=sound][value=off]").click();document.getElementById("start").click()');
 assert.equal(await evaluate('document.getElementById("retry").textContent'),'Yeniden dene','Réessayer traduit');
 await send('Network.setBlockedURLs',{urls:[]});
 await evaluate('document.getElementById("retry").click()');
 await waitFor('!document.getElementById("experience").hidden','Réessayer récupère le contenu');
 // Un retour depuis le cache de navigation doit rouvrir les questions.
 await evaluate('dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true}))');
 await waitFor('document.getElementById("welcome") && !document.getElementById("welcome").hidden && document.getElementById("experience").hidden','Choix après retour depuis le cache');
 assert.equal(await evaluate('document.querySelectorAll("#welcome-form input:checked").length'),0,'Choix remis à zéro');
 assert.equal(exceptions.length,0,JSON.stringify(exceptions));
 console.log('Edge : teaser seul avant 20:59 UTC, 3 fuseaux, zéro requête privée avant l’heure, ouverture automatique sans rechargement, /i-love-my-tutus/, choix français/turc et musique, police/MP3/21 images, 5 largeurs, zoom 200 %, clavier/focus, erreurs/réessai, zéro exception : OK.');
}finally{socket?.close();browser.kill();server.closeAllConnections();server.close();}
