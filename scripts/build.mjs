import fs from 'node:fs/promises'
await import('./prepare-assets.mjs')
await fs.mkdir('dist',{recursive:true})
for(const file of ['index.html','style.css','app.js','i18n.js','favicon.svg','.nojekyll']) await fs.copyFile(file,`dist/${file}`)
await fs.cp('assets','dist/assets',{recursive:true})
console.log('Site statique prêt dans dist/.')
