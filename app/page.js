'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

export default function Home() {
  const [recentGuestbook, setRecentGuestbook] = useState([])

  useEffect(() => {
    // Load recent guestbook entries
    try {
      const raw = localStorage.getItem('pgv-guestbook')
      const entries = JSON.parse(raw || '[]')
      setRecentGuestbook(entries.slice(0, 5))
    } catch (e) {
      console.error('Error loading guestbook', e)
    }
  }, [])

  return (
    <Layout>
      <main>
        <section className="hero hero-paraglide hero-tall" aria-label="Hero">
          <div className="hero-top-overlay" aria-hidden="true"></div>
          <div className="hero-bottom-fade" aria-hidden="true"></div>

          <div className="container hero-inner">
            <div className="hero-content">
              <h1>PGV — Novinky, články a videa</h1>
              <p className="lead">Aktuální zprávy a inspirativní čtení. Prohlédněte si články a videa z pohodlí domova.</p>
              <div className="hero-ctas">
                <Link className="btn btn-primary" href="/clanky">Prozkoumat články</Link>
                <Link className="btn btn-secondary" href="/videa">Nejnovější videa</Link>
              </div>
            </div>
            <div className="hero-card hero-card-empty" aria-hidden="true"></div>
          </div>
        </section>

        <section className="container two-col">
          <div className="main-col">
            <div className="section-head">
              <h2>Poslední články</h2>
              <Link href="/clanky" className="link-more">Všechny články →</Link>
            </div>

            <div className="card-grid" id="articles">
              <article className="card" data-title="Jak funguje PGV" data-tags="novinky">
                <img src="https://images.unsplash.com/photo-1508833625015-6b5097f83b4a?q=80&w=800&auto=format&fit=crop" alt="Ilustrační obrázek" />
                <div className="card-body">
                  <h3 className="card-title"><Link href="#">Jak funguje PGV: průvodce</Link></h3>
                  <p className="card-excerpt">Krátké shrnutí článku — co od něj očekávat, proč je důležitý a co se dozvíte.</p>
                  <div className="card-meta">
                    <span>12. 10. 2025</span>
                    <Link className="read-more" href="#">Číst dál →</Link>
                  </div>
                </div>
              </article>

              <article className="card" data-title="Tipy pro bezpečnost" data-tags="bezpečnost">
                <img src="https://images.unsplash.com/photo-1532614338840-ab30cf10ed2a?q=80&w=800&auto=format&fit=crop" alt="Ilustrační obrázek" />
                <div className="card-body">
                  <h3 className="card-title"><Link href="#">10 tipů pro bezpečnost</Link></h3>
                  <p className="card-excerpt">Praktické rady, jak zlepšit bezpečnost při používání služeb online.</p>
                  <div className="card-meta">
                    <span>01. 09. 2025</span>
                    <Link className="read-more" href="#">Číst dál →</Link>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <aside className="side-col" aria-label="Boční panel">
            <div className="card side-card">
              <h4>Poslední vzkazy</h4>
              <ul className="mini-list" id="recent-guestbook">
                {recentGuestbook.length > 0 ? (
                  recentGuestbook.map((entry, idx) => (
                    <li key={idx}>{entry.name}: {entry.message?.slice(0, 60)}</li>
                  ))
                ) : (
                  <>
                    <li>Jana: Díky za obsah!</li>
                    <li>Petr: Super stránky.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="card side-card">
              <h4>Přispěj i svým článkem</h4>
              <p className="muted">novak@seto.cz</p>
            </div>
          </aside>
        </section>
      </main>
    </Layout>
  )
}
