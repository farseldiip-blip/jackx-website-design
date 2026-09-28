import { ArrowUpRight, ArrowLeft, Camera, Home, MapPin, Menu as MenuIcon, Utensils, X } from 'lucide-react'
import { ADDRESS_LINES, DIRECTIONS, INSTAGRAM, INSTAGRAM_HANDLE, asset } from '@/lib/site'

/**
 * Site chrome — entirely server-rendered.
 *
 * Navigation uses plain anchors rather than the client router: the static export
 * has no RSC payload for the router to fetch, so a router navigation would 404,
 * double-navigate and leave a non-canonical URL. A plain document navigation is
 * faster here, uses the browser's back/forward cache, and keeps the base path
 * under our control via `asset()`.
 *
 * The sticky-header state and the mobile disclosure are driven by the small
 * vanilla script in /site.js, so none of this needs hydration.
 */

type HeaderProps = {
  /** Home renders the header over the hero; the menu page renders it opaque. */
  variant: 'overlay' | 'solid'
}

export function Header({ variant }: HeaderProps) {
  return (
    <>
      {/* Sentinel drives the .is-scrolled header state with zero scroll listeners. */}
      <div className="scroll-sentinel" aria-hidden="true" />
      <header className={`site-header site-header--${variant}`} data-header>
        <a href={asset('/')} className="wordmark" aria-label="JACKX — home">
          JACKX<span aria-hidden="true">چاكس</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary">
          <a href={asset('/#story')}>Story</a>
          <a href={asset('/#experience')}>Experience</a>
          <a href={asset('/#visit')}>Visit</a>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>

        <a href={asset('/menu/')} className="header-cta">
          View menu <ArrowUpRight size={16} aria-hidden="true" />
        </a>

        <button className="mobile-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav">
          <span className="sr-only" data-nav-toggle-label>
            Open menu
          </span>
          <MenuIcon aria-hidden="true" data-icon="open" />
          <X aria-hidden="true" className="icon-close" />
        </button>

        <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile" data-nav>
          <a href={asset('/#story')} data-nav-close>
            Our story
          </a>
          <a href={asset('/#experience')} data-nav-close>
            Experience
          </a>
          <a href={asset('/#visit')} data-nav-close>
            Location
          </a>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" data-nav-close>
            Instagram
          </a>
          <a href={asset('/menu/')} className="mobile-nav-cta" data-nav-close>
            View menu <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </header>
    </>
  )
}

/** Persistent mobile navigation — every primary destination stays one tap away. */
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      <a href={asset('/')} className="bottom-nav-item">
        <Home size={18} strokeWidth={1.8} aria-hidden="true" />
        <span>Home</span>
      </a>
      <a href={asset('/menu/')} className="bottom-nav-item bottom-nav-item--menu">
        <span className="bottom-nav-icon">
          <Utensils size={19} strokeWidth={2} aria-hidden="true" />
        </span>
        <span>Menu</span>
      </a>
      <a href={asset('/#visit')} className="bottom-nav-item">
        <MapPin size={18} strokeWidth={1.8} aria-hidden="true" />
        <span>Visit</span>
      </a>
      <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="bottom-nav-item">
        <Camera size={18} strokeWidth={1.8} aria-hidden="true" />
        <span>Social</span>
      </a>
    </nav>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <p className="footer-logo">
        JACKX<span aria-hidden="true">چاكس</span>
      </p>
      <nav className="footer-links" aria-label="Footer">
        <a href={asset('/menu/')}>Menu</a>
        <a href={asset('/#visit')}>Location</a>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
      </nav>
      <p className="footer-meta">
        <MapPin size={15} aria-hidden="true" /> Damietta, Egypt
        <br />
        <small>
          © {year} JACKX. Flavors evoke memories.
        </small>
      </p>
    </footer>
  )
}

export function BackLink() {
  return (
    <a href={asset('/')} className="back-link">
      <ArrowLeft size={16} aria-hidden="true" /> Back home
    </a>
  )
}

export function DirectionsLink({ className = 'solid-link' }: { className?: string }) {
  return (
    <a className={className} href={DIRECTIONS} target="_blank" rel="noopener noreferrer">
      Get directions <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  )
}

export function InstagramLink() {
  return (
    <a className="text-link" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
      <Camera size={18} aria-hidden="true" /> {INSTAGRAM_HANDLE}
    </a>
  )
}

export { ADDRESS_LINES }
