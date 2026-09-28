/**
 * Production-export audit harness.
 *
 * Serves the built `out/` directory over HTTP, exactly as GitHub Pages will
 * (including the deployment base path), drives Chrome headless at three
 * viewports across both pages, and reports:
 *
 *   - console / page errors
 *   - failed resource loads
 *   - horizontal overflow
 *   - broken images
 *   - computed styles for the specific regressions under test
 *
 * Metrics are collected in-page and read back out of the DOM, so no devtools
 * protocol client is needed. Collection and screenshots both run against the
 * HTTP server -- never a file:// copy, which would silently bypass the
 * stylesheet and every image.
 */

import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const OUT_DIR = join(process.cwd(), 'out')
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')
const PORT = 4399
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
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

/** Injected only into the HTML served to the metrics pass. */
const COLLECTOR = `
<script>
(function(){
  var errors = [], failed = [];
  window.addEventListener('error', function(e){
    if (e.target && e.target !== window && e.target.src) failed.push({url:e.target.src, kind:e.target.tagName});
    else errors.push(String(e.message || e.error || 'unknown'));
  });
  window.addEventListener('unhandledrejection', function(e){ errors.push('unhandledrejection: '+e.reason); });
  var oe = console.error;
  console.error = function(){ errors.push(Array.prototype.map.call(arguments,String).join(' ')); oe.apply(console, arguments); };

  function done(){
    var doc = document.documentElement;
    var imgs = Array.prototype.slice.call(document.images);
    function disp(sel){ var el=document.querySelector(sel); return el?getComputedStyle(el).display:null; }
    function w(sel){ var el=document.querySelector(sel); return el?Math.round(el.getBoundingClientRect().width):null; }

    var containment = ['.hero','.story-image','.gallery-item','.menu-tease','.visit-image','.social-tile','.category']
      .map(function(sel){
        var cell = document.querySelector(sel);
        if(!cell) return {sel:sel, ok:null};
        var img = cell.querySelector('img');
        if(!img) return {sel:sel, ok:null};
        var c = cell.getBoundingClientRect(), i = img.getBoundingClientRect();
        return { sel:sel, ok:(i.top >= c.top-2 && i.left >= c.left-2 && i.width <= c.width+2),
                 cell:{t:Math.round(c.top),l:Math.round(c.left)}, img:{t:Math.round(i.top),l:Math.round(i.left)} };
      });

    var hero = document.querySelector('.hero img');
    var p = document.createElement('pre');
    p.id = '__metrics';
    p.textContent = JSON.stringify({
      overflowX: doc.scrollWidth - doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      totalImgs: imgs.length,
      brokenImgs: imgs.filter(function(i){return i.complete && i.naturalWidth===0;})
                      .map(function(i){return i.currentSrc||i.src;}),
      errors: errors, failed: failed,
      storyImageWidth: w('.story-image img'),
      storyCopyWidth: w('.story-copy'),
      heroContentWidth: w('.hero-content'),
      menuTeaseContentWidth: w('.menu-tease-content'),
      visitCopyWidth: w('.visit-copy'),
      toggleDisplay: disp('.mobile-toggle'),
      closeIconDisplay: disp('.mobile-toggle .icon-close'),
      openIconDisplay: disp('.mobile-toggle [data-icon="open"]'),
      desktopNavDisplay: disp('.desktop-nav'),
      bottomNavDisplay: disp('.bottom-nav'),
      containment: containment,
      heroImgLoaded: hero ? (hero.complete && hero.naturalWidth>0) : null,
      heroImgSrc: hero ? (hero.currentSrc||hero.src) : null,
      fontFamily: getComputedStyle(document.body).fontFamily,
      jsRan: window.jackx === true
    });
    document.body.appendChild(p);
  }
  if (document.readyState === 'complete') setTimeout(done, 2500);
  else window.addEventListener('load', function(){ setTimeout(done, 2500); });
})();
</script>`

const requestLog = []

/**
 * Resolves a request URL to a file inside out/.
 * Strips the deployment base path, so the harness exercises exactly the URL
 * shape GitHub Pages will serve.
 */
function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0])
  if (BASE_PATH && (p === BASE_PATH || p.startsWith(BASE_PATH + '/'))) p = p.slice(BASE_PATH.length)
  let rel = p.replace(/^\/+/, '')
  if (rel === '' || rel.endsWith('/')) rel += 'index.html'
  return rel
}

const server = createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0]

  // `?__audit=1` requests get the collector injected. Chrome headless cannot
  // set custom headers, so the flag travels in the query string. Note the flag
  // lives on req.url, not on urlPath -- urlPath has already had the query
  // string stripped.
  if (req.url.includes('__audit=1')) {
    const rel = resolveFile(urlPath)
    try {
      const html = (await readFile(join(OUT_DIR, rel), 'utf8')).replace('</body>', COLLECTOR + '</body>')
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' })
      res.end(html)
      return
    } catch {
      res.writeHead(404).end()
      return
    }
  }

  const rel = resolveFile(urlPath)
  const file = join(OUT_DIR, rel)
  try {
    const data = await readFile(file)
    res.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    res.end(data)
    requestLog.push({ url: urlPath, status: 200 })
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
    requestLog.push({ url: urlPath, status: 404 })
  }
})

await new Promise((r) => server.listen(PORT, r))

const ORIGIN = `http://127.0.0.1:${PORT}`
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'menu', path: '/menu/' },
]
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
]

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

const report = []

for (const page of PAGES) {
  const url = `${ORIGIN}${BASE_PATH}${page.path}`
  const metricsUrl = url

  for (const vp of VIEWPORTS) {
    // --- metrics pass (collector injected, served over HTTP) ---
    // Chrome cannot set request headers, so the metrics flag rides in the query
    // string and is translated into a header by the server's query check.
    let metrics = null
    const { stdout } = await execFileAsync(CHROME, [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      `--window-size=${vp.width},${vp.height}`,
      '--virtual-time-budget=9000',
      '--dump-dom',
      `${metricsUrl}?__audit=1`,
    ])
    const m = stdout.match(/<pre id="__metrics">([\s\S]*?)<\/pre>/)
    if (m) {
      try {
        metrics = JSON.parse(decode(m[1]))
      } catch (e) {
        metrics = { parseError: String(e), raw: decode(m[1]).slice(0, 400) }
      }
    } else {
      metrics = { parseError: 'no <pre id="__metrics"> in DOM' }
    }

    // --- visual pass (untouched HTML, real assets) ---
    const shot = join(process.cwd(), `audit-${page.name}-${vp.name}.png`)
    await execFileAsync(CHROME, [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      `--window-size=${vp.width},${vp.height}`,
      '--virtual-time-budget=9000',
      `--screenshot=${shot}`,
      url,
    ])

    report.push({ page: page.name, viewport: vp.name, width: vp.width, url, metrics, screenshot: shot })
  }
}

server.close()

await writeFile(join(process.cwd(), 'audit-report.json'), JSON.stringify({ basePath: BASE_PATH, requestLog, report }, null, 2))

/* ------------------------------------------------------------------ verdict */
const failures = []

for (const r of report) {
  const m = r.metrics
  const where = `${r.page}/${r.viewport}`
  if (!m || m.parseError) {
    failures.push(`${where}: metrics not collected (${m?.parseError ?? 'none'})`)
    continue
  }
  if (m.overflowX > 0) failures.push(`${where}: horizontal overflow +${m.overflowX}px`)
  if (m.brokenImgs?.length) failures.push(`${where}: ${m.brokenImgs.length} broken image(s): ${JSON.stringify(m.brokenImgs.slice(0, 3))}`)
  if (m.failed?.length) failures.push(`${where}: failed loads ${JSON.stringify(m.failed.slice(0, 4))}`)
  if (m.errors?.length) failures.push(`${where}: console errors ${JSON.stringify(m.errors.slice(0, 3))}`)
  if (m.heroImgLoaded === false) failures.push(`${where}: hero image failed to load (${m.heroImgSrc})`)
  if (!m.jsRan) failures.push(`${where}: site.js did not run (window.jackx !== true)`)
  if (!/Archivo/i.test(m.fontFamily ?? '')) failures.push(`${where}: Archivo not applied (body font = ${m.fontFamily})`)

  // Regression: the mobile toggle appears at <=880px and nowhere wider.
  // Assert against the real viewport width, not the label: 834px "tablet" is
  // deliberately still a hamburger layout.
  const expectsToggle = r.width <= 880
  if (expectsToggle && m.toggleDisplay === 'none') {
    failures.push(`${where}: mobile toggle hidden at ${r.width}px (display=none)`)
  }
  if (!expectsToggle && m.toggleDisplay !== 'none') {
    failures.push(`${where}: mobile toggle visible at ${r.width}px (display=${m.toggleDisplay})`)
  }
  // Regression: the X icon must be hidden while the menu is closed.
  if (m.closeIconDisplay !== 'none') {
    failures.push(`${where}: close (X) icon visible while menu closed (display=${m.closeIconDisplay})`)
  }
  // Regression: images must stay inside their own cells.
  for (const c of m.containment ?? []) {
    if (c.ok === false) {
      failures.push(`${where}: image escapes cell ${c.sel} cell=${JSON.stringify(c.cell)} img=${JSON.stringify(c.img)}`)
    }
  }
  // Regression: container-type must not collapse these flex/grid children.
  for (const key of ['heroContentWidth', 'menuTeaseContentWidth', 'storyCopyWidth', 'visitCopyWidth']) {
    if (m[key] != null && m[key] < 40) failures.push(`${where}: ${key} collapsed to ${m[key]}px`)
  }
}

const notFound = requestLog.filter((r) => r.status !== 200)
const httpStatus = {}
for (const r of requestLog) httpStatus[r.status] = (httpStatus[r.status] ?? 0) + 1

console.log(`\n=== Static host: ${requestLog.length} asset request(s) ===`)
console.log(httpStatus)
if (notFound.length) {
  console.log('\nNon-200:')
  for (const r of notFound) console.log(`  ${r.status}  ${r.url}`)
}

console.log('\n=== Per-viewport ===')
for (const r of report) {
  const m = r.metrics ?? {}
  console.log(
    `${(r.page + '/' + r.viewport).padEnd(17)} ` +
      `ovf=${m.overflowX} imgs=${m.totalImgs} broken=${m.brokenImgs?.length ?? '?'} ` +
      `err=${m.errors?.length ?? '?'} fail=${m.failed?.length ?? '?'} ` +
      `hero=${m.heroImgLoaded} js=${m.jsRan} toggle=${m.toggleDisplay} X=${m.closeIconDisplay}`,
  )
}

console.log('\n=== Verdict ===')
if (failures.length) {
  for (const f of failures) console.log('  FAIL  ' + f)
  console.log(`\n${failures.length} failure(s).\n`)
  process.exit(1)
}
console.log('  PASS — production export clean at every viewport and page.\n')
