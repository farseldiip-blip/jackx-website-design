/**
 * Single source of truth for brand, navigation, contact details and imagery.
 * Everything the pages render comes from here so copy, links and assets stay in sync.
 */

export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')

/** Prefix a root-relative path with the deployment base path. */
export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}

export const INSTAGRAM = 'https://www.instagram.com/jackxcafe.eg/'
export const INSTAGRAM_HANDLE = '@jackxcafe.eg'
export const DIRECTIONS =
  'https://www.google.com/maps/search/?api=1&query=First+Abu+Dhabi+Bank+Damietta'

export const ADDRESS_LINES = ['Nile Corniche', 'Extension of Al-Sousana Street', 'Next to First Abu Dhabi Bank'] as const

/**
 * The mobile hero showcase.
 *
 * JACKX has no published item names yet — the menu page is still "coming soon" —
 * so `name` is an explicit, obviously-fake placeholder rather than invented
 * product copy. Replace it with the real signature item; nothing else changes.
 */
export const SIGNATURE = {
  label: 'Signature',
  name: 'Item name',
  href: '/menu/',
} as const

/**
 * Responsive image registry.
 *
 * Every entry is cropped server-side to the exact aspect ratio the layout renders at,
 * so images never shift layout and never ship pixels the browser cannot use.
 * `media` variants are only used where art direction genuinely differs (the hero).
 */
export type Crop = {
  /** Media query selecting this crop. Omit for a single, universal crop. */
  media?: string
  /** File stem under /public/images. Defaults to the image name. */
  file?: string
  /** Intrinsic size of the widest generated variant. */
  w: number
  h: number
  /** Generated widths, ascending. */
  widths: number[]
  /** Layout width the browser should assume when choosing a variant. */
  sizes: string
}

export type ImageSpec = {
  alt: string
  crops: Crop[]
}

/**
 * Cropped image specs, keyed by name. Declared as a plain literal first so
 * `keyof` can extract the exact image names, then widened to `ImageSpec` so the
 * optional `media` / `file` keys stay readable downstream.
 */
const IMAGE_SPECS = {
  hero: {
    alt: 'Friends raising two flat whites and a black coffee over the JACKX table',
    crops: [
      {
        media: '(max-width: 700px)',
        file: 'hero-tall',
        w: 960,
        h: 1600,
        widths: [420, 660, 960],
        sizes: '100vw',
      },
      {
        media: '(min-width: 701px)',
        file: 'hero-wide',
        w: 1920,
        h: 1080,
        widths: [800, 1280, 1920],
        sizes: '100vw',
      },
    ],
  },
  story: {
    alt: 'The JACKX room: timber tables, hanging lights and room to gather',
    crops: [{ w: 1200, h: 1500, widths: [400, 800], sizes: '(min-width: 1000px) 30vw, 92vw' }],
  },
  'gallery-1': {
    alt: 'Flat white poured beside rosemary on a marble table',
    crops: [{ w: 1200, h: 1200, widths: [400, 800], sizes: '(min-width: 1000px) 40vw, 55vw' }],
  },
  'gallery-2': {
    alt: 'French toast stacked with blueberries and maple syrup',
    crops: [{ w: 900, h: 1350, widths: [320, 640], sizes: '(min-width: 1000px) 22vw, 38vw' }],
  },
  'gallery-3': {
    alt: 'Cold citrus drink with mint and lime on a dark table',
    crops: [{ w: 1050, h: 1400, widths: [380, 760], sizes: '(min-width: 1000px) 28vw, 100vw' }],
  },
  tease: {
    alt: 'JACKX dessert: ice cream, brownie and salted caramel',
    crops: [{ w: 1500, h: 1000, widths: [800, 1440], sizes: '100vw' }],
  },
  visit: {
    alt: 'The lit CAFE sign at JACKX on the Nile Corniche',
    crops: [{ w: 1200, h: 1000, widths: [400, 800], sizes: '(min-width: 1000px) 30vw, 92vw' }],
  },
  'social-1': {
    alt: 'Guests sharing a plate and coffee in warm afternoon light',
    crops: [{ w: 1000, h: 1000, widths: [380, 760], sizes: '(min-width: 1000px) 31vw, (min-width: 701px) 45vw, 100vw' }],
  },
  'social-2': {
    alt: 'Barista pouring a slow filter coffee by hand',
    crops: [{ w: 1000, h: 1000, widths: [380, 760], sizes: '(min-width: 1000px) 31vw, (min-width: 701px) 45vw, 100vw' }],
  },
  'social-3': {
    alt: 'Fresh herbs being prepared on the JACKX counter',
    crops: [{ w: 1000, h: 1000, widths: [380, 760], sizes: '(min-width: 1000px) 31vw, (min-width: 701px) 45vw, 100vw' }],
  },
  'category-breakfast': {
    alt: 'JACKX breakfast: fried egg and cheese on toast',
    crops: [{ w: 900, h: 1200, widths: [480, 900], sizes: '(min-width: 701px) 32vw, 92vw' }],
  },
  'category-sandwiches': {
    alt: 'JACKX sandwich: toasted cheese on sourdough',
    crops: [{ w: 900, h: 1200, widths: [480, 900], sizes: '(min-width: 701px) 38vw, 92vw' }],
  },
  'category-drinks': {
    alt: 'JACKX drinks: espresso and iced coffee with roasted beans',
    crops: [{ w: 900, h: 1200, widths: [480, 900], sizes: '(min-width: 701px) 32vw, 92vw' }],
  },
  /**
   * The hero showcase renders the drinks photograph at roughly a fifth of the
   * width, so it declares its own `sizes` against the same physical files —
   * without it the browser would pull the 900px crop for a 76px tile.
   */
  signature: {
    alt: 'Espresso and roasted beans on the JACKX table',
    crops: [{ file: 'category-drinks', w: 900, h: 1200, widths: [480, 900], sizes: '20vw' }],
  },
}

export const IMAGES: Record<string, ImageSpec> = IMAGE_SPECS

export type ImageName = keyof typeof IMAGE_SPECS

/** Gallery / social tiles are never the same photograph twice. */
export const GALLERY = [
  { image: 'gallery-1', label: '01', className: 'gallery-wide' },
  { image: 'gallery-2', label: '02', className: 'gallery-tall' },
  { image: 'gallery-3', label: '03', className: 'gallery-square' },
] as const satisfies readonly { image: ImageName; label: string; className: string }[]

export const SOCIAL_TILES = ['social-1', 'social-2', 'social-3'] as const satisfies readonly ImageName[]

export const CATEGORIES = [
  { name: 'Breakfast', note: 'Start your day right', image: 'category-breakfast' },
  { name: 'Sandwiches', note: 'Good things come in bites', image: 'category-sandwiches' },
  { name: 'Drinks', note: 'Pour something good', image: 'category-drinks' },
] as const satisfies readonly { name: string; note: string; image: ImageName }[]
