/**
 * Full-page visual capture, in viewport-sized slices.
 *
 * The hero is sized in viewport units, so simply enlarging the Chrome window to
 * 9000px would stretch the hero to 9000px tall and hide the real layout. The
 * window is therefore kept at a true device size and the page is translated
 * upward one viewport at a time -- which is exactly what a user scrolling would
 * see, and keeps every vh-based rule honest.
 *
 * usage: node scripts/shots.mjs [page-viewport] [sliceCount]
 *   node scripts/shots.mjs home-mobile 6
 */

import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const OUT_DIR = join(process.cwd(), 'out')
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')
const PORT = 4401
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
}

function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0])
  if (BASE_PATH && (p === BASE_PATH || p.startsWith(BASE_PATH + '/'))) p = p.slice(BASE_PATH.length)
  let rel = p.replace(/^\/+/, '')
  if (rel === '' || rel.endsWith('/')) rel += 'index.html'
  return rel
}

/** Translates the document by `offset` px and freezes it there. */
function shifter(offset) {
  return `
  <style id="__shot">
    html { overflow: hidden !important; }
    body { transform: translateY(-${offset}px); }
  </style>`
}

const server = createServer(async (req, res) => {
  const url = req.url
  const file = join(OUT_DIR, resolveFile(url))
  try {
    let data = await readFile(file)
    const m = url.match(/__slice=(\d+)/)
    if (m && file.endsWith('.html')) {
      const shifted = Buffer.from(
        data.toString('utf8').replace('</head>', shifter(+m[1]) + '</head>'),
        'utf8',
      )
      res.writeHead(200, { 'Content-Type': MIME['.html'] })
      res.end(shifted)
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
})

await new Promise((r) => server.listen(PORT, r))

const ORIGIN = `http://127.0.0.1:${PORT}${BASE_PATH}`
const PAGES = { home: `${ORIGIN}/`, menu: `${ORIGIN}/menu/` }
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 },
}

const [which = 'home-mobile', sliceArg = '6'] = process.argv.slice(2)
const [page, vpName] = which.includes('-') ? which.split('-') : ['home', which]
const vp = VIEWPORTS[vpName]
if (!PAGES[page] || !vp) {
  console.error('usage: node scripts/shots.mjs <home|menu>-<desktop|tablet|mobile> [slices]')
  process.exit(1)
}

const slices = Number(sliceArg)
for (let i = 0; i < slices; i++) {
  const offset = i * vp.height
  const out = join(process.cwd(), `shot-${page}-${vpName}-${i}.png`)
  await execFileAsync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--window-size=${vp.width},${vp.height}`,
    '--virtual-time-budget=10000',
    `--screenshot=${out}`,
    `${PAGES[page]}?__slice=${offset}`,
  ])
  console.log(`slice ${i} (y=${offset}) -> shot-${page}-${vpName}-${i}.png`)
}

server.close()
