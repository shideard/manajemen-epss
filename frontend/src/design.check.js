// Jalankan: node src/design.check.js
// Menjaga aturan frontend/DESIGN.md: class di src hanya memakai token dari index.css, bukan nilai mentah
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

const src = new URL('./', import.meta.url)
const css = readFileSync(new URL('index.css', src), 'utf8')
const warna = new Set([...css.matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1]))

const LARANGAN = [
  [/\btext-\[\d/, 'ukuran font mentah, pakai text-caption/small/body/lead/h1-h3/display-*'],
  [/\btext-(xs|sm|base|lg|xl|\dxl)\b/, 'ukuran font bawaan Tailwind, pakai token tipografi'],
  [/-\[(#|rgb)/, 'warna mentah, pakai token warna'],
  [/\brounded(-[trblse]{1,2})?-\[/, 'radius mentah, pakai rounded-xs/sm/md/lg/xl/full'],
  [/\bshadow-\[/, 'shadow mentah, pakai shadow-sm/md/lg'],
  [/\bleading-\[/, 'line-height mentah, default sudah 1.2'],
  [/(^|[\s"'`:!])-?(p[xytblr]?|m[xytblr]?|gap(-[xy])?|space-[xy])-\[/, 'spacing mentah, pakai skala spacing (kelipatan 2px)'],
]
const WARNA_CLASS = /(?<![\w-])(?:bg|text|border(?:-[trblxy])?|outline|ring|fill|stroke|from|to|via|accent|decoration|divide)-([a-z]+[0-9]?(?:-\d{2,3})?)(?=[\s"'`/!]|$)/g
const BUKAN_WARNA = /^([trblxyse]|xs|sm|base|lg|\d?xl|left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip|transparent|current|inherit|none|solid|dashed|dotted|double|hidden|collapse|separate|offset|linear|caption|small|body|lead|h[123]|display-[123]|[0-9]+)$/

const files = readdirSync(src, { recursive: true }).filter((f) => /\.jsx?$/.test(f) && !f.endsWith('.check.js'))
assert.ok(files.length > 0)

const salah = []
for (const file of files) {
  readFileSync(new URL(file.replaceAll('\\', '/'), src), 'utf8')
    .split('\n')
    .forEach((baris, i) => {
      const lokasi = `${file}:${i + 1}`
      for (const [pola, pesan] of LARANGAN) if (pola.test(baris)) salah.push(`${lokasi} ${pesan}`)
      for (const [, nama] of baris.matchAll(WARNA_CLASS)) {
        if (!BUKAN_WARNA.test(nama) && !warna.has(nama)) salah.push(`${lokasi} warna "${nama}" tidak ada di token`)
      }
    })
}

assert.deepEqual(salah, [], `\n${salah.join('\n')}`)
console.log(`design.check: OK (${files.length} file)`)
