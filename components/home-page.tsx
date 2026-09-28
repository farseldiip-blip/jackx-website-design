import { ArrowUpRight } from 'lucide-react'
import { Picture, PreloadHero } from '@/components/picture'
import { BottomNav, DirectionsLink, Footer, Header, InstagramLink } from '@/components/site-chrome'
import { ADDRESS_LINES, GALLERY, INSTAGRAM, INSTAGRAM_HANDLE, SOCIAL_TILES, asset } from '@/lib/site'

/** Home page. Pure server component — every animation is CSS driven. */
export function HomePage() {
  return (
    <main className="jackx-page">
      {/* Hoisted into <head> by React: the hero is the LCP element, so it must
          start downloading before the parser reaches the <picture> markup. */}
      <PreloadHero />
      <Header variant="overlay" />

      <section className="hero" aria-labelledby="hero-title">
        <Picture name="hero" className="cover-img" priority />
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Coffee · Food · Moments</p>
          <h1 id="hero-title">
            Flavors
            <br />
            <em>evoke</em>
            <br />
            memories.
          </h1>
          <div className="hero-bottom">
            <p>
              JACKX — coffee, food
              <br />
              and good moments.
            </p>
            <a href={asset('/menu/')} className="circle-link">
              View
              <br />
              menu <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
        <p className="hero-mark" aria-hidden="true">
          JACKX
          <span>چاكس</span>
        </p>
      </section>

      <section id="story" className="story section-grid" data-reveal>
        <p className="section-index">01 / story</p>
        <div className="story-copy">
          <p className="eyebrow eyebrow--orange">The feeling stays</p>
          <h2>
            Made for the
            <br />
            <span>in-between.</span>
          </h2>
          <p className="body-copy">
            The first sip. The bite you did not plan to share. The table where the afternoon turns into evening. JACKX
            is a coffee shop in Damietta built around the moments that stay with you.
          </p>
          <a href={asset('/menu/')} className="text-link">
            See what&apos;s on <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="story-image">
          <Picture name="story" className="cover-img" />
        </div>
      </section>

      <section id="experience" className="experience" data-reveal>
        <div className="experience-head">
          <div>
            <p className="eyebrow eyebrow--orange">02 / the experience</p>
            <h2>
              Start your day
              <br />
              <span>right.</span>
            </h2>
          </div>
          <p className="body-copy">From the first coffee to the last shared bite, every detail is part of the mood.</p>
        </div>
        <div className="gallery">
          {GALLERY.map((item) => (
            <figure key={item.image} className={`gallery-item ${item.className}`}>
              <Picture name={item.image} className="cover-img" />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="menu-tease" data-reveal>
        <Picture name="tease" className="cover-img" />
        <div className="menu-tease-shade" aria-hidden="true" />
        <div className="menu-tease-content">
          <p className="eyebrow">03 / the menu</p>
          <h2>
            A little
            <br />
            <em>something</em>
            <br />
            for everyone.
          </h2>
          <p>Explore the things we make, pour, and put on the table.</p>
          <a href={asset('/menu/')} className="solid-link">
            Explore the menu <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="visit" className="visit section-grid" data-reveal>
        <div className="visit-image">
          <Picture name="visit" className="cover-img" />
        </div>
        <p className="section-index">04 / find us</p>
        <div className="visit-copy">
          <p className="eyebrow eyebrow--orange">Come through</p>
          <h2>
            See you
            <br />
            <span>by the Nile.</span>
          </h2>
          <address>
            JACKX
            <br />
            Damietta, Nile Corniche
            <br />
            {ADDRESS_LINES.slice(1).map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>
          <DirectionsLink />
        </div>
        <div className="coming-soon">
          <span className="dot" aria-hidden="true" />
          <p className="eyebrow">
            Another JACKX is
            <br />
            coming soon.
          </p>
          <span className="arabic" lang="ar" aria-hidden="true">
            قريبًا
          </span>
        </div>
      </section>

      <section className="social" data-reveal>
        <div className="social-head">
          <div>
            <p className="eyebrow eyebrow--orange">05 / in the wild</p>
            <h2>
              Follow the
              <br />
              <span>feeling.</span>
            </h2>
          </div>
          <InstagramLink />
        </div>
        <div className="social-grid">
          {SOCIAL_TILES.map((tile) => (
            <a
              key={tile}
              className="social-tile"
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow JACKX on Instagram ${INSTAGRAM_HANDLE}`}
            >
              <Picture name={tile} className="cover-img" />
            </a>
          ))}
        </div>
      </section>

      <Footer />
      <BottomNav />
    </main>
  )
}
