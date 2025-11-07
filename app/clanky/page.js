'use client'

import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Clanky() {
  return (
    <Layout>
      <main className="container">
        <div className="section-head">
          <h1>Články</h1>
          <p className="lead">Seznam všech článků — nahraďte reálnými položkami z pgv.cz nebo importem.</p>
        </div>

        <div className="card-grid" id="articles-list">
          <article className="card">
            <img src="https://images.unsplash.com/photo-1508833625015-6b5097f83b4a?q=80&w=800&auto=format&fit=crop" alt="" />
            <div className="card-body">
              <h3 className="card-title"><Link href="#">Nadpis článku A</Link></h3>
              <p className="card-excerpt">Krátký popis článku A...</p>
              <div className="card-meta">
                <span>05. 10. 2025</span>
                <Link className="read-more" href="#">Číst dál →</Link>
              </div>
            </div>
          </article>

          <article className="card">
            <img src="https://images.unsplash.com/photo-1532614338840-ab30cf10ed2a?q=80&w=800&auto=format&fit=crop" alt="" />
            <div className="card-body">
              <h3 className="card-title"><Link href="#">Nadpis článku B</Link></h3>
              <p className="card-excerpt">Krátký popis článku B...</p>
              <div className="card-meta">
                <span>20. 09. 2025</span>
                <Link className="read-more" href="#">Číst dál →</Link>
              </div>
            </div>
          </article>

          <article className="card">
            <img src="https://images.unsplash.com/photo-1508833625015-6b5097f83b4a?q=80&w=800&auto=format&fit=crop" alt="" />
            <div className="card-body">
              <h3 className="card-title"><Link href="#">Nadpis článku C</Link></h3>
              <p className="card-excerpt">Krátký popis článku C...</p>
              <div className="card-meta">
                <span>15. 08. 2025</span>
                <Link className="read-more" href="#">Číst dál →</Link>
              </div>
            </div>
          </article>
        </div>
      </main>
    </Layout>
  )
}
