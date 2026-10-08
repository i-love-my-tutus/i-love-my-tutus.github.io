import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
await import('../app.js');
const core=globalThis.BirthdayCore;
test('Ouverture absolue, bornes exactes et décompte',()=>{
 assert.equal(core.isUnlocked(core.UNLOCK_AT-1),false);
 assert.equal(core.isUnlocked(core.UNLOCK_AT),true);
 assert.equal(core.isUnlocked(core.UNLOCK_AT+1),true);
 assert.deepEqual(core.countdown(core.UNLOCK_AT-90061000),[1,1,1,1]);
 assert.deepEqual(core.countdown(core.UNLOCK_AT-1),[0,0,0,1]);
 assert.deepEqual(core.countdown(core.UNLOCK_AT+10000),[0,0,0,0]);
});
test('Paris, Sofia et New York ouvrent au même instant',()=>{
 for(const instant of ['2026-10-08T23:59:00+03:00','2026-10-08T22:59:00+02:00','2026-10-08T16:59:00-04:00'])assert.equal(Date.parse(instant),core.UNLOCK_AT);
});
test('Le mode aperçu est réservé aux adresses locales',()=>{
 for(const hostname of ['localhost','127.0.0.1','[::1]',''])assert.equal(core.isLocalPreview(hostname,'?preview=true'),true);
 for(const hostname of ['i-love-my-tutus.github.io','example.com','localhost.example.com'])assert.equal(core.isLocalPreview(hostname,'?preview=true'),false);
 assert.equal(core.isLocalPreview('localhost',''),false);
});
test('Contenu intégral, caractères et chemins des photos',async()=>{
 const context={window:{}};vm.runInNewContext(await fs.readFile('assets/content.js','utf8'),context);
 const content=context.window.BIRTHDAY_CONTENT;
 assert.equal(content.message,await fs.readFile('message.txt','utf8'));
 assert.ok(content.message.includes('Tütüşüm'));
 assert.ok(!content.message.includes('\uFFFD'));
 assert.deepEqual(core.paragraphs(content.message),content.message.split(/(?:\r?\n){2,}/).filter(p=>p.trim()));
 for(const group of ['hers','together']){
  const originals=(await fs.readdir(`images/${group}`)).filter(f=>/\.(jpe?g|png|webp|avif|heic|heif)$/i.test(f));
  assert.equal(content.photos[group].length,originals.length);
  for(const photo of content.photos[group]){assert.ok(photo.width>0&&photo.height>0);await fs.access(photo.src);for(const variant of photo.srcset.split(', '))await fs.access(variant.split(' ')[0]);}
 }
});
test('HTML autonome et chemins compatibles sous-répertoire GitHub Pages',async()=>{
 const html=await fs.readFile('index.html','utf8');
 for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g))if(!url.startsWith('#')){assert.ok(!url.startsWith('/'));await fs.access(url);}
 assert.ok(!html.includes('assets/content.js'));
});
test('Le MP3 fourni est copié fidèlement et référencé dans le contenu',async()=>{
 const context={window:{}};vm.runInNewContext(await fs.readFile('assets/content.js','utf8'),context);
 const audio=context.window.BIRTHDAY_CONTENT.audio;
 assert.ok(audio && !audio.startsWith('/'));
 const source='redproductions-piano-moving-solo-cinematic-romantic-emotional-music-183163.mp3';
 assert.deepEqual(await fs.readFile(audio),await fs.readFile(source));
 assert.deepEqual(await fs.readFile(`dist/${audio}`),await fs.readFile(source));
});
test('Les JPEG optimisés ne contiennent pas de métadonnées EXIF',async()=>{
 const files=(await fs.readdir('assets/photos')).filter(file=>file.endsWith('.jpg'));
 for(const file of files){const bytes=await fs.readFile(`assets/photos/${file}`);assert.equal(bytes.includes(Buffer.from('Exif\0\0')),false,file);}
});
test('La version publiée contient bien les dernières sources statiques',async()=>{
 for(const file of ['index.html','app.js','i18n.js','style.css','favicon.svg'])assert.deepEqual(await fs.readFile(`dist/${file}`),await fs.readFile(file),file);
 const files=await fs.readdir('dist');
 for(const privateSource of ['message.txt','message.tr.txt','images','plan.md','tests','scripts'])assert.ok(!files.includes(privateSource),privateSource);
});
test('Traduction turque complète et dictionnaires sans clés manquantes',async()=>{
 const context={window:{}};vm.runInNewContext(await fs.readFile('assets/content.js','utf8'),context);
 const {messages}=context.window.BIRTHDAY_CONTENT;
 assert.equal(messages.fr,await fs.readFile('message.txt','utf8'));
 assert.equal(messages.tr,await fs.readFile('message.tr.txt','utf8'));
 assert.equal(core.paragraphs(messages.fr).length,core.paragraphs(messages.tr).length);
 assert.ok(messages.tr.includes('Tütüşüm'));
 assert.ok(!messages.tr.includes('\uFFFD'));
 const dictContext={};vm.runInNewContext(await fs.readFile('i18n.js','utf8'),dictContext);
 const dictionaries=dictContext.BIRTHDAY_I18N;
 assert.deepEqual(Object.keys(dictionaries.fr).sort(),Object.keys(dictionaries.tr).sort());
 const html=await fs.readFile('index.html','utf8');
 for(const [,key] of html.matchAll(/data-i18n(?:-aria|-lines)?="([^"]+)"/g))for(const lang of ['fr','tr'])assert.ok(typeof dictionaries[lang][key]==='string'&&dictionaries[lang][key].length,`${lang}/${key}`);
});
test('Publication unique depuis main et fichiers statiques prêts à la racine',async()=>{
 let workflows=[];try{workflows=(await fs.readdir('.github/workflows')).filter(file=>/\.ya?ml$/.test(file));}catch(error){if(error.code!=='ENOENT')throw error;}
 assert.deepEqual(workflows,[],'Aucun workflow concurrent à la publication automatique Pages');
 await fs.access('.nojekyll');
 const ignore=await fs.readFile('.gitignore','utf8');
 assert.ok(!ignore.includes('assets/content.js')&&!ignore.includes('assets/photos/'));
 assert.deepEqual(await fs.readFile('assets/content.js'),await fs.readFile('dist/assets/content.js'));
 for(const file of await fs.readdir('assets/photos'))assert.deepEqual(await fs.readFile(`assets/photos/${file}`),await fs.readFile(`dist/assets/photos/${file}`),file);
 const html=await fs.readFile('index.html','utf8');
 assert.ok(/<section id="welcome"[^>]*\bhidden\b/.test(html));
 assert.ok(!/<section id="gate"[^>]*\bhidden\b/.test(html));
});
