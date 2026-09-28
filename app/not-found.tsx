import { ArrowLeft } from 'lucide-react'
import { BottomNav, Footer, Header } from '@/components/site-chrome'
import { asset } from '@/lib/site'

/**
 * Served by GitHub Pages as 404.html for any unknown path.
 * Keeps visitors inside the site instead of a raw server error page.
 */
export default function NotFound() {
  return (
    <main className="jackx-page menu-page not-found">
      <Header variant="solid" />
      <section className="menu-intro">
        <a href={asset('/')} className="back-link">
          <ArrowLeft size={16} aria-hidden="true" /> Back home
        </a>
        <p className="eyebrow eyebrow--orange">404 / not on the menu</p>
        <h1>
          This table
          <br />
          <em>is empty.</em>
        </h1>
        <p className="menu-note">
          That page isn&apos;t here. The coffee, however, is exactly where you left it.
        </p>
      </section>
      <Footer />
      <BottomNav />
    </main>
  )
}
