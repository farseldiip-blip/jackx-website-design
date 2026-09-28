import type { CSSProperties } from 'react'
import { IMAGES, asset, type ImageName } from '@/lib/site'

type PictureProps = {
  /** Key into the IMAGES registry. */
  name: ImageName
  /** Applied to the <img>; use for positioning inside the layout cell. */
  className?: string
  /** Applied to the <picture> wrapper. */
  pictureClassName?: string
  style?: CSSProperties
  /**
   * Above-the-fold images skip lazy loading and get a high fetch priority.
   * Everything else is lazy by default — the browser never fetches it until needed.
   */
  priority?: boolean
}

/**
 * Renders every crop as AVIF + WebP <source> elements with a width-descriptor
 * srcset, so the browser downloads exactly one file at the smallest size that
 * covers the rendered box and the device pixel ratio.
 *
 * The <img> is absolutely positioned inside a CSS-sized cell, so intrinsic
 * dimensions never shift layout (CLS stays at zero even before the image loads).
 */
export function Picture({ name, className, pictureClassName, style, priority = false }: PictureProps) {
  const spec = IMAGES[name]
  // The fallback <img> mirrors the universal (or last) crop.
  const fallbackIndex = spec.crops.length - 1
  const fallback = spec.crops[fallbackIndex]
  const stem = (i: number) => spec.crops[i].file ?? name
  const fallbackWidth = fallback.widths[fallback.widths.length - 1]

  const srcset = (cropIndex: number, format: 'avif' | 'webp') =>
    spec.crops[cropIndex].widths.map((w) => `${asset(`/images/${stem(cropIndex)}-${w}.${format}`)} ${w}w`).join(', ')

  return (
    <picture className={pictureClassName}>
      {spec.crops.map((crop, i) => (
        <source key={`avif-${i}`} type="image/avif" media={crop.media} srcSet={srcset(i, 'avif')} sizes={crop.sizes} />
      ))}
      {spec.crops.map((crop, i) => (
        <source key={`webp-${i}`} type="image/webp" media={crop.media} srcSet={srcset(i, 'webp')} sizes={crop.sizes} />
      ))}
      <img
        src={asset(`/images/${stem(fallbackIndex)}-${fallbackWidth}.webp`)}
        alt={spec.alt}
        width={fallback.w}
        height={fallback.h}
        className={className}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  )
}

/**
 * Preload hints for the LCP image. Rendered in <head> so the hero starts
 * downloading in parallel with the HTML instead of after it.
 * Must mirror the <picture> media/sizes exactly or the browser fetches twice.
 */
export function PreloadHero() {
  const spec = IMAGES.hero
  return spec.crops.map((crop, i) => {
    const stem = crop.file ?? 'hero'
    const srcset = crop.widths.map((w) => `${asset(`/images/${stem}-${w}.avif`)} ${w}w`).join(', ')
    return (
      <link
        key={crop.media ?? `crop-${i}`}
        rel="preload"
        as="image"
        type="image/avif"
        media={crop.media}
        imageSrcSet={srcset}
        imageSizes={crop.sizes}
        fetchPriority="high"
      />
    )
  })
}
