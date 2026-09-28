import { ArrowUpRight } from 'lucide-react'
import { Picture } from '@/components/picture'
import { BackLink, BottomNav, Footer, Header } from '@/components/site-chrome'
import { CATEGORIES, INSTAGRAM } from '@/lib/site'
/** Menu index. Pure server component. */
export function MenuPage() {
  return (
    <main className="jackx-page menu-page">
      <Header variant="solid" />

      <section className="menu-intro">
        <BackLink />
        <p className="eyebrow eyebrow--orange">JACKX / menu</p>
        <h1>
          Choose your
          <br />
          <em>favorite.</em>
        </h1>
        <p className="menu-note">Pick a category to explore. Full menu details are coming soon.</p>
      </section>

      <section className="category-grid" aria-label="Menu categories">
        {CATEGORIES.map((category, index) => (
          <a key={category.name} href="#menu-details" className={`category category-${index + 1}`}>
            <Picture name={category.image} className="cover-img" />
            <span className="category-shade" aria-hidden="true" />
            <span className="category-index" aria-hidden="true">
              {`0${index + 1}`}
            </span>
            <span className="category-copy">
              <span className="category-text">
                <span className="category-note">{category.note}</span>
                <span className="category-name">{category.name}</span>
              </span>
              <ArrowUpRight className="category-arrow" size={30} aria-hidden="true" />
            </span>
          </a>
        ))}
      </section>

      <section id="menu-details" className="menu-details" data-reveal>
        <p className="eyebrow eyebrow--orange">Coming to the table</p>
        <h2>
          Full menu details
          <br />
          <em>coming soon.</em>
        </h2>
        <p>We are preparing the complete JACKX menu. Check back soon for every item, description, and price.</p>
        <a className="text-link" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
          Follow for updates <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </section>

      <Footer />
      <BottomNav />
    </main>
  )
}
