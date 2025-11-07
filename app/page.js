'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

export default function Home() {
  const [recentGuestbook, setRecentGuestbook] = useState([])
  const [articles, setArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(true)

  useEffect(() => {
    // Load recent guestbook entries
    try {
      const raw = localStorage.getItem('pgv-guestbook')
      const entries = JSON.parse(raw || '[]')
      setRecentGuestbook(entries.slice(0, 5))
    } catch (e) {
      console.error('Error loading guestbook', e)
    }

    // Load articles from API
    const loadArticles = async () => {
      try {
        const res = await fetch('/api/articles')
        if (res.ok) {
          const data = await res.json()
          setArticles(data.slice(0, 6)) // Get latest 6 articles
        }
      } catch (err) {
        console.error('Error loading articles:', err)
      } finally {
        setLoadingArticles(false)
      }
    }
    loadArticles()
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
              {loadingArticles ? (
                <p>Načítám články...</p>
              ) : articles.length === 0 ? (
                <p>Zatím žádné články.</p>
              ) : (
                articles.map((article) => (
                  <article key={article.id} className="card">
                    {article.imageUrl && (
                      <img src={article.imageUrl} alt={article.title} />
                    )}
                    <div className="card-body">
                      <h3 className="card-title">
                        <Link href={`/clanky#${article.id}`}>{article.title}</Link>
                      </h3>
                      <p className="card-excerpt">
                        {article.excerpt || article.content.slice(0, 120) + '...'}
                      </p>
                      <div className="card-meta">
                        <span>{new Date(article.createdAt).toLocaleDateString('cs-CZ')}</span>
                        <Link className="read-more" href={`/clanky#${article.id}`}>Číst dál →</Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
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
