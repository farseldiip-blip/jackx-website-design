/**
 * Post-build guard for the static export.
 *
 * Runs after `next build` and fails the build (rather than shipping a subtly
 * broken site) when the GitHub Pages output is not actually deployable:
 *
 *  1. Emits `out/.nojekyll`. Without it Jekyll processes the published branch
 *     and silently drops every underscore-prefixed path — which is all of
 *     `/_next/`, so the site would render unstyled and completely inert.
 *  2. Verifies that every `/_next/...` and `/site.js` reference in the emitted
 *     HTML actually exists on disk.
 *  3. Verifies the base path was applied consistently, when one is in use.
 *  4. Verifies no development-only Turbopack/HMR artefacts leaked into output.
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { join, posix } from 'node:path'

const OUT = join(process.cwd(), 'out')
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

const errors = []
const notes = []

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

async function exists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

if (!(await exists(OUT))) {
  console.error('postbuild: out/ not found — did `next build` run?')
  process.exit(1)
}

/* ------------------------------------------------------------ 1. .nojekyll */
await writeFile(join(OUT, '.nojekyll'), '', 'utf8')
notes.push('wrote out/.nojekyll (stops Jekyll stripping /_next/*)')

/* ------------------------------------------------------ 2. required pages */
for (const page of ['index.html', 'menu/index.html', '404.html', 'sitemap.xml', 'robots.txt', 'site.js']) {
  if (!(await exists(join(OUT, page)))) errors.push(`missing required export: ${page}`)
}

/* --------------------------------------- 3. every referenced asset exists */
const htmlFiles = (await walk(OUT)).filter((f) => f.endsWith('.html'))
const referenced = new Set()
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8')
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css|woff2|svg|png|jpg|webp|avif))"/g)) {
    referenced.add(m[1])
  }
}
for (const ref of referenced) {
  if (!ref.startsWith(`${BASE_PATH}/`)) {
    errors.push(`asset reference "${ref}" is missing the base path "${BASE_PATH}"`)
    continue
  }
  // BASE_PATH is a URL prefix, not a directory on disk: /<repo>/_next/x.css
  // is emitted as out/_next/x.css.
  const onDisk = ref.slice(BASE_PATH.length + 1)
  if (!(await exists(join(OUT, onDisk)))) errors.push(`referenced asset not found on disk: ${ref} (out/${onDisk})`)
}
notes.push(`verified ${referenced.size} referenced assets across ${htmlFiles.length} HTML file(s)`)

/* --------------------------------------- 4. no dev/HMR artefacts shipped */
const DEV_PATTERNS = [/0tao_next_dist_/, /next-devtools/, /\/_next\/hmr/, /webpack-hmr/, /hot-update/]
for (const file of await walk(OUT)) {
  if (!/\.(html|js|css|txt|xml)$/.test(file)) continue
  const text = await readFile(file, 'utf8')
  for (const re of DEV_PATTERNS) {
    if (re.test(text)) errors.push(`development artefact "${re}" leaked into ${file.replace(/\\/g, '/')}`)
  }
}

/* ------------------------------------------------- 5. absolute-URL sanity */
if (SITE_URL && !/^https?:\/\//.test(SITE_URL)) {
  errors.push(`NEXT_PUBLIC_SITE_URL is not an absolute URL: "${SITE_URL}"`)
}
if (!SITE_URL) {
  notes.push('NEXT_PUBLIC_SITE_URL unset — canonical/OG/sitemap/robots will use the localhost fallback')
}
for (const f of ['sitemap.xml', 'robots.txt']) {
  const text = await readFile(join(OUT, f), 'utf8')
  if (text.includes('localhost:3000')) {
    errors.push(`${f} contains http://localhost:3000 — set NEXT_PUBLIC_SITE_URL for this build`)
  }
}

/* ------------------------------------------------------------------ report */
console.log('\npostbuild: export verification')
for (const n of notes) console.log(`  ok    ${n}`)
if (errors.length) {
  console.error('')
  for (const e of errors) console.error(`  FAIL  ${e}`)
  console.error(`\npostbuild: ${errors.length} problem(s) found.\n`)
  process.exit(1)
}
console.log(`\npostbuild: clean (base path ${BASE_PATH ? `"${BASE_PATH}"` : 'none (user site)'}).\n`)
