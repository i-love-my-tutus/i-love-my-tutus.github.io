/* Site statique bilingue : choix de langue et de musique à chaque ouverture. */
(function (global) {
 'use strict';
 const UNLOCK_AT = Date.parse('2026-10-08T20:59:00Z');
 function countdown(now) {
  const seconds = Math.max(0, Math.ceil((UNLOCK_AT - now) / 1000));
  return [Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];
 }
 function paragraphs(text) { return text.split(/(?:\r?\n){2,}/).filter(p=>p.trim().length); }
 const core = { UNLOCK_AT, countdown, paragraphs, isUnlocked: now => now >= UNLOCK_AT };
 global.BirthdayCore = core;
 if (typeof document === 'undefined') return;
 const $ = id => document.getElementById(id);
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const local = ['localhost','127.0.0.1','[::1]',''].includes(location.hostname);
 // Preview exclusivement local : aucun paramètre ne peut contourner le gate sur GitHub Pages.
 const preview = local && new URLSearchParams(location.search).get('preview') === 'true';
 let opened=false, loading=false, audio=null, fadeFrame=0, lastTrigger=null;
 let language='fr', soundPreference='off', choicesMade=false, experienceStarted=false, loadedContent=null;
 const t=key=>global.BIRTHDAY_I18N[language][key];
 $('welcome-form').reset();
 // Un retour depuis le cache de navigation doit aussi redemander les choix.
 addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
 function applyLocale(next){
  language=next;document.documentElement.lang=language;document.title=t('title');
  document.querySelector('meta[name="description"]').content=t('description');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-lines]').forEach(el=>{
   const key=el.dataset.i18nLines,lines=t(key).split('|');el.replaceChildren();
   lines.forEach((line,index)=>{
    if(index)el.append(key==='brand'?' ':document.createElement('br'));
    if(index===lines.length-1){const em=document.createElement('em');em.textContent=line;el.append(em);}else el.append(document.createTextNode(line));
   });
  });
  $('countdown').querySelectorAll('small').forEach((el,index)=>el.textContent=t(['days','hours','minutes','seconds'][index]));
 }
 $('welcome-form').addEventListener('change',event=>{
  if(event.target.name==='language')applyLocale(event.target.value);
 });
 $('welcome-form').addEventListener('submit',event=>{
  event.preventDefault();
  const values=new FormData(event.currentTarget);
  if(!['fr','tr'].includes(values.get('language'))||!['on','off'].includes(values.get('sound')))return;
  applyLocale(values.get('language'));soundPreference=values.get('sound');choicesMade=true;
  $('start').disabled=true;
  // Le clic de confirmation autorise la lecture ; aucune musique avant ce choix.
  if(audio && soundPreference==='on')playMusic();
  if(loadedContent)revealExperience();else{showWelcomeStatus('loading');}
 });
 const stars=document.createDocumentFragment();
 for(let i=0;i<75;i++) {
  const star=document.createElement('i'); star.className='star';
  star.style.cssText=`left:${(i*37.719)%100}%;top:${(i*61.313)%100}%;--opacity:${.25+(i%6)*.1};--duration:${3+i%7}s;--delay:-${i%9}s`;
  stars.append(star);
 }
 $('stars').append(stars);
 const labels=['jours','heures','minutes','secondes'];
 labels.forEach(label=>{ const cell=document.createElement('div'); const value=document.createElement('strong'); value.textContent='00';const small=document.createElement('small');small.textContent=label;cell.append(value,small);$('countdown').append(cell); });
 const digits=$('countdown').querySelectorAll('strong');
 function tick(){
  if(opened)return;
  // Vérification de l'heure temporairement désactivée pour tester le site.
  // countdown(Date.now()).forEach((value,i)=>digits[i].textContent=String(value).padStart(2,'0'));
  // if(preview || core.isUnlocked(Date.now())) openExperience();
  openExperience();
 }
 const clock=setInterval(tick,1000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
 function openExperience(){
  if(opened||loading)return; loading=true;
  const script=document.createElement('script'); script.src='assets/content.js';
  script.onload=()=>{
   const content=global.BIRTHDAY_CONTENT;
   if(!content){loadFailure();return;}
   loadedContent=content;opened=true;loading=false;clearInterval(clock);
   if(content.audio)setupAudio(content.audio);
   else{$('music-yes').disabled=true;document.querySelector('input[name="sound"][value="off"]').checked=true;}
   if(choicesMade){if(audio&&soundPreference==='on')playMusic();revealExperience();}
  };
  script.onerror=loadFailure; document.head.append(script);
 }
 function revealExperience(){
  if(experienceStarted)return;experienceStarted=true;render(loadedContent);
  $('welcome').hidden=true;$('gate').hidden=true;$('experience').hidden=false;document.querySelector('.skip').hidden=false;
  $('music').hidden=!audio||Boolean(audio.error);musicState();setupReveals();
  scrollToId('intro');$('intro-title').focus({preventScroll:true});
 }
 function showWelcomeStatus(key){$('welcome-status').hidden=false;$('welcome-status').dataset.i18n=key;$('welcome-status').textContent=t(key);}
 function loadFailure(){
  loading=false;$('start').disabled=false;showWelcomeStatus('loadError');
  if(!$('retry')){const button=document.createElement('button');button.id='retry';button.className='primary';button.dataset.i18n='retry';button.textContent=t('retry');button.addEventListener('click',()=>{$('welcome-status').hidden=true;openExperience();});$('welcome').append(button);}
  clearInterval(clock);
 }
 function sentence(text, includes){
  const parts=text.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/gu)||[];
  return parts.find(part=>part.includes(includes))?.trim()||'';
 }
 function setText(id,text){$(id).textContent=text;}
 function render(content){
  const message=content.messages?.[language]||(language==='fr'?content.message:'')||'';
  const blocks=paragraphs(message);
  setText('intro-excerpt',sentence(message,t('excerptIntro')));
  const story=t('excerptStory').map(needle=>sentence(message,needle)).filter(Boolean);
  story.forEach(line=>{const section=document.createElement('div');section.className='story-line';const p=document.createElement('p');p.className='reveal';p.textContent=line;section.append(p);$('story-lines').append(section);});
  setText('portrait-excerpt',sentence(message,t('excerptPortrait')));
  setText('together-excerpt',sentence(message,t('excerptTogether')));
  for(const group of ['hers','together']) {
   const target=$(group==='hers'?'portrait-gallery':'together-gallery');
   const photos=content.photos?.[group]||[];
   photos.forEach((photo,i)=>target.append(photoFigure(photo,group,i)));
   if(!photos.length){const p=document.createElement('p');p.className='empty';p.textContent=t('emptyPhotos');target.append(p);}
  }
  blocks.forEach(block=>{const p=document.createElement('p');p.className='reveal';p.textContent=block;$('letter-content').append(p);});
  if(!blocks.length)setText('letter-content',t('emptyLetter'));
  setText('last-words',blocks.at(-1)||t('lastFallback'));
  const finalPhoto=content.photos?.together?.at(-1);
  if(finalPhoto){const figure=photoFigure(finalPhoto,'together',0,false);$('final-photo').append(figure);}
  for(let i=0;i<64;i++){
   const t=i/64*Math.PI*2,x=16*Math.sin(t)**3,y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
   const point=document.createElement('i');point.className='heart-star';
   point.style.cssText=`left:${125+x*6}px;top:${95-y*6}px;--dx:${Math.sin(i*7)*180}px;--dy:${Math.cos(i*13)*180}px;--delay:${(i%8)*.06}s`;
   $('heart').append(point);
  }
 }
 function photoFigure(photo,group,index,caption=true){
  const figure=document.createElement('figure');figure.className='photo-frame reveal';
  const button=document.createElement('button');button.className='photo-button';
  const alt=`${t(group==='hers'?'photoHers':'photoTogether')} ${index+1}`;
  button.setAttribute('aria-label',`${t('enlarge')} : ${alt}`);
  const image=document.createElement('img');image.src=photo.src;image.srcset=photo.srcset;image.sizes=caption?(group==='hers'?'(max-width:700px) 50vw, 28vw':'(max-width:700px) 90vw, 40vw'):'(max-width:700px) 90vw, 430px';image.width=photo.width;image.height=photo.height;image.alt=alt;image.loading='lazy';image.decoding='async';image.style.objectPosition=photo.position;
  image.addEventListener('error',()=>{image.hidden=true;button.disabled=true;const fallback=document.createElement('p');fallback.className='photo-error';fallback.textContent=t('photoError');button.append(fallback);},{once:true});
  button.append(image);button.addEventListener('click',()=>openPhoto(photo,alt,button));figure.append(button);
  if(caption){const cap=document.createElement('figcaption');const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');const symbol=document.createElement('span');symbol.textContent='♡';cap.append(number,symbol);figure.append(cap);}
  return figure;
 }
 function openPhoto(photo,alt,trigger){
  lastTrigger=trigger;const image=$('large-photo');image.srcset=photo.srcset;image.sizes='90vw';image.src=photo.src;image.alt=alt;
  $('lightbox').showModal();document.body.classList.add('modal-open');$('close-photo').focus();
 }
 $('close-photo').addEventListener('click',()=>$('lightbox').close());
 $('lightbox').addEventListener('click',event=>{if(event.target===$('lightbox'))$('lightbox').close();});
 $('lightbox').addEventListener('close',()=>{document.body.classList.remove('modal-open');lastTrigger?.focus({preventScroll:true});});
 let observer;
 function setupReveals(){
  if(!('IntersectionObserver' in global))return;
  document.body.classList.add('motion-ready');
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.reveal,#final').forEach(el=>observer.observe(el));
 }
 function scrollToId(id){$(id).scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}
 $('begin').addEventListener('click',()=>{scrollToId('mystery');if(audio&&soundPreference!=='off')playMusic();});
 $('reading').addEventListener('click',()=>{const on=document.body.classList.toggle('reading-mode');$('reading').setAttribute('aria-pressed',String(on));$('reading').textContent=t(on?'readingOff':'readingOn');if(on)scrollToId('letter-content');});
 $('last').addEventListener('click',()=>{const show=$('last-words').hidden;$('last-words').hidden=!show;$('last').setAttribute('aria-expanded',String(show));});
 $('replay').addEventListener('click',()=>scrollToId('intro'));
 let scrollFrame=false;
 function progress(){scrollFrame=false;const length=document.documentElement.scrollHeight-innerHeight;$('progress').style.transform=`scaleX(${length>0?scrollY/length:0})`;}
 addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(progress);}},{passive:true});
 function saveSound(value){soundPreference=value;if(value==='off')removeMusicRetry();}
 function musicState(){const playing=audio&&!audio.paused;$('music').setAttribute('aria-pressed',String(playing));$('music').setAttribute('aria-label',t(playing?'musicPause':'musicPlay'));$('music').querySelector('span').textContent=t(playing?'musicPlaying':'musicPaused');}
 function setupAudio(src){
  audio=new Audio(src);audio.loop=true;audio.preload='none';audio.volume=.3;
  audio.addEventListener('play',musicState);audio.addEventListener('pause',musicState);
  audio.addEventListener('error',()=>{cancelAnimationFrame(fadeFrame);audio.pause();$('music').hidden=true;});
  $('music').addEventListener('click',()=>{if(audio.paused){saveSound('on');playMusic();}else{cancelAnimationFrame(fadeFrame);audio.pause();saveSound('off');}});
 }
 function retryMusicOnInteraction(event){
  if(event.target instanceof Element && event.target.closest('#music'))return;
  if(choicesMade&&soundPreference!=='off'&&audio?.paused)playMusic();
 }
 function removeMusicRetry(){
  document.removeEventListener('pointerdown',retryMusicOnInteraction);
  document.removeEventListener('keydown',retryMusicOnInteraction);
 }
 function playMusic(){
  if(!choicesMade||soundPreference!=='on'||!audio||!audio.paused)return;
  cancelAnimationFrame(fadeFrame);audio.volume=0;
  audio.play().then(()=>{removeMusicRetry();const start=performance.now();function fade(now){audio.volume=Math.min(.3,(now-start)/2500*.3);if(now-start<2500&&!audio.paused)fadeFrame=requestAnimationFrame(fade);}fadeFrame=requestAnimationFrame(fade);}).catch(error=>{
   musicState();
   if(error.name==='NotAllowedError'){
    document.addEventListener('pointerdown',retryMusicOnInteraction);
    document.addEventListener('keydown',retryMusicOnInteraction);
   }
  });
 }
 tick();
})(globalThis);
