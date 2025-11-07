'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ArticlesManagement() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'
  
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      router.replace('/admin')
      return
    }
    loadArticles()
  }, [router])

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/articles')
      if (res.ok) {
        const data = await res.json()
        setArticles(data)
      }
    } catch (err) {
      console.error('Error loading articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const endpoint = editingId ? `/api/articles/${editingId}` : '/api/articles'
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, excerpt, imageUrl })
      })

      if (res.ok) {
        setMessage(editingId ? 'Článek aktualizován' : 'Článek přidán')
        setTitle('')
        setContent('')
        setExcerpt('')
        setImageUrl('')
        setEditingId(null)
        loadArticles()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Chyba')
      }
    } catch (err) {
      console.error('Error saving article:', err)
      setMessage('Chyba při ukládání')
    }
  }

  const handleEdit = (article) => {
    setEditingId(article.id)
    setTitle(article.title)
    setContent(article.content)
    setExcerpt(article.excerpt || '')
    setImageUrl(article.imageUrl || '')
  }

  const handleDelete = async (id) => {
    if (!confirm('Opravdu smazat tento článek?')) return

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage('Článek smazán')
        loadArticles()
      }
    } catch (err) {
      console.error('Error deleting article:', err)
      setMessage('Chyba při mazání')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setExcerpt('')
    setImageUrl('')
    setMessage('')
  }

  return (
    <div className="admin-container">
      <div className="admin-card" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1>Správa článků</h1>
          <Link href="/admin/dashboard" className="btn-ghost">← Zpět</Link>
        </div>

        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '2rem' }}>
          <div className="form-row">
            <label>Název článku</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Obsah článku</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="10"
              required
            />
          </div>

          <div className="form-row">
            <label>Krátký popis (výňatek)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-row">
            <label>URL obrázku</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {message && (
            <div style={{ marginBottom: '1rem', color: message.includes('Chyba') ? 'crimson' : 'green' }}>
              {message}
            </div>
          )}

          <div className="admin-actions">
            {editingId && (
              <button type="button" className="btn-ghost" onClick={handleCancel}>
                Zrušit
              </button>
            )}
            <button type="submit" className="btn-primary">
              {editingId ? 'Aktualizovat' : 'Přidat článek'}
            </button>
          </div>
        </form>

        <h2>Seznam článků</h2>
        {loading ? (
          <p>Načítám...</p>
        ) : articles.length === 0 ? (
          <p>Žádné články</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {articles.map((article) => (
              <div 
                key={article.id} 
                style={{ 
                  padding: '1rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <strong>{article.title}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-ghost" 
                      onClick={() => handleEdit(article)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Upravit
                    </button>
                    <button 
                      className="btn-ghost" 
                      onClick={() => handleDelete(article.id)}
                      style={{ padding: '0.5rem 1rem', color: 'crimson' }}
                    >
                      Smazat
                    </button>
                  </div>
                </div>
                {article.excerpt && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                    {article.excerpt}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
