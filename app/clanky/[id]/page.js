'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Layout from '../../../components/Layout'

export default function ArticleDetail() {
  const params = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${params.id}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setArticle(data)
        } else {
          setError('Článek nenalezen')
        }
      } catch (err) {
        console.error('Error loading article:', err)
        setError('Chyba při načítání článku')
      } finally {
        setLoading(false)
      }
    }
    
    loadArticle()
  }, [params.id])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Simple markdown image parser for backward compatibility
  const renderContent = (content) => {
    if (!content) return null
    
    // Split content by image markdown pattern: ![alt](url)
    const parts = content.split(/!\[([^\]]*)\]\(([^)]+)\)/)
    const elements = []
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        // Regular text
        if (parts[i]) {
          elements.push(
            <p key={`text-${i}`} style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
              {parts[i]}
            </p>
          )
        }
      } else if (i % 3 === 1) {
        // Alt text (skip, will be used with url)
        continue
      } else if (i % 3 === 2) {
        // Image URL
        const altText = parts[i - 1]
        const imageUrl = parts[i]
        elements.push(
          <img 
            key={`img-${i}`}
            src={imageUrl} 
            alt={altText || 'Obrázek článku'} 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'block'
            }}
          />
        )
      }
    }
    
    return elements
  }

  if (loading) {
    return (
      <Layout>
        <main className="container">
          <p>Načítám...</p>
        </main>
      </Layout>
    )
  }

  if (error || !article) {
    return (
      <Layout>
        <main className="container">
          <p>{error || 'Článek nenalezen'}</p>
          <Link href="/clanky" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ← Zpět na články
          </Link>
        </main>
      </Layout>
    )
  }

  return (
    <Layout>
      <main className="container">
        <article style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/clanky" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              ← Zpět na články
            </Link>
          </div>
          
          <h1 style={{ marginBottom: '0.5rem' }}>{article.title}</h1>
          <div style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            {formatDate(article.createdAt)}
          </div>

          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              style={{ 
                width: '100%', 
                height: 'auto', 
                borderRadius: '12px',
                marginBottom: '2rem'
              }}
            />
          )}

          <div style={{ fontSize: '1.125rem', lineHeight: '1.7' }}>
            {article.sections && article.sections.length > 0 ? (
              // Render sections
              article.sections.map((section, index) => (
                <div key={section.id} style={{ marginBottom: '2.5rem' }}>
                  <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                    {section.text}
                  </p>
                  {section.images && section.images.length > 0 && (
                    <div style={{ 
                      display: 'grid', 
                      gap: '1rem',
                      marginBottom: '1.5rem',
                      gridTemplateColumns: section.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))'
                    }}>
                      {section.images.map((image, imgIndex) => (
                        <img 
                          key={image.id}
                          src={image.imageUrl} 
                          alt={`Obrázek ${imgIndex + 1} sekce ${index + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: 'auto', 
                            borderRadius: '8px',
                            display: 'block'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Fallback to old content rendering for backward compatibility
              renderContent(article.content)
            )}
          </div>
        </article>
      </main>
    </Layout>
  )
}
