'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Clanky() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/articles', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setArticles(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error loading articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <Layout>
      <main className="container">
        <div className="section-head">
          <h1>Články</h1>
          <p className="lead">Seznam všech článků</p>
        </div>

        {loading ? (
          <p>Načítám...</p>
        ) : articles.length === 0 ? (
          <p>Žádné články k zobrazení</p>
        ) : (
          <div className="card-grid" id="articles-list">
            {articles.map((article) => (
              <article key={article.id} className="card">
                {article.imageUrl && (
                  <img src={article.imageUrl} alt={article.title} />
                )}
                <div className="card-body">
                  <h3 className="card-title">
                    <Link href="#">{article.title}</Link>
                  </h3>
                  {article.excerpt && (
                    <p className="card-excerpt">{article.excerpt}</p>
                  )}
                  <div className="card-meta">
                    <span>{formatDate(article.createdAt)}</span>
                    <Link className="read-more" href="#">Číst dál →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </Layout>
  )
}
