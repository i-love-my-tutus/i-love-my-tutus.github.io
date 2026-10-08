import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
await fs.mkdir('assets/photos', { recursive: true })
let message = ''
try { message = await fs.readFile('message.txt', 'utf8') } catch { console.warn('Message absent : état de repli.') }
if (message.includes('\uFFFD')) throw new Error('Encodage UTF-8 invalide')
const messageTurkish = await fs.readFile('message.tr.txt', 'utf8')
if (messageTurkish.includes('\uFFFD')) throw new Error('Encodage UTF-8 turc invalide')
const paragraphCount = text => text.split(/(?:\r?\n){2,}/).filter(p => p.trim()).length
if (message && paragraphCount(message) !== paragraphCount(messageTurkish)) throw new Error('La traduction turque doit conserver le même nombre de paragraphes que le français.')
let positions = {}
try { positions = JSON.parse(await fs.readFile('photo-positions.json','utf8')) } catch {}
const photos = { hers: [], together: [] }
let sharp
try { sharp = (await import('sharp')).default } catch {}
for (const group of Object.keys(photos)) {
 let files = []
 try { files = (await fs.readdir(`images/${group}`)).filter(f => /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(f)).sort() } catch {}
 for (const [index,file] of files.entries()) {
  const id = `${group}-${index+1}`
  const input = path.resolve('images',group,file)
  const variants = []
  let width, height
  if (sharp) {
   for (const size of [480,960,1600]) {
    const dest = `assets/photos/${id}-${size}.webp`
    const info = await sharp(input).rotate().resize({width:size,withoutEnlargement:true}).webp({quality:86}).toFile(dest)
    variants.push({src:dest,width:info.width})
    if (size===1600) { width=info.width; height=info.height }
   }
  } else if (process.platform==='win32') {
   const result = JSON.parse(execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File','scripts/optimize-photo.ps1','-InputPath',input,'-OutputBase',path.resolve('assets/photos',id)],{encoding:'utf8'}).trim())
   width=result.width; height=result.height
   for(const size of [480,960,1600]) variants.push({src:`assets/photos/${id}-${size}.jpg`,width:Math.min(size,width)})
  } else { throw new Error('Installer sharp pour préparer les photos : npm install --no-save sharp.') }
  photos[group].push({id,width,height,src:variants[1].src,srcset:[...new Map(variants.map(v=>[v.width,v])).values()].map(v=>`${v.src} ${v.width}w`).join(', '),position:positions[`${group}/${file}`]||'50% 50%'})
 }
}
let audio=null
for(const dir of ['audio','public/audio','.']) {
 let files=[]; try { files=(await fs.readdir(dir)).filter(f=>/\.(mp3|ogg|m4a|wav)$/i.test(f)).sort() } catch {}
 if(files.length) { await fs.mkdir('assets/audio',{recursive:true}); await fs.copyFile(path.join(dir,files[0]),path.join('assets/audio',files[0])); audio=`assets/audio/${files[0]}`; break }
}
await fs.writeFile('assets/content.js',`window.BIRTHDAY_CONTENT = ${JSON.stringify({message,messages:{fr:message,tr:messageTurkish},photos,audio})};\n`)
console.log(`Préparé localement : ${photos.hers.length} portraits, ${photos.together.length} photos ensemble, audio ${audio?'présent':'absent'}.`)
