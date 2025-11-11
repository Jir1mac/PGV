'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [showImageUrlInput, setShowImageUrlInput] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState('')
  const contentTextareaRef = useRef(null)

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

  const insertImageAtCursor = () => {
    if (!tempImageUrl.trim()) {
      setMessage('Zadejte URL obrázku')
      return
    }

    const textarea = contentTextareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const imageMarkdown = `\n![Obrázek](${tempImageUrl})\n`
    
    const newContent = content.substring(0, start) + imageMarkdown + content.substring(end)
    setContent(newContent)
    setTempImageUrl('')
    setShowImageUrlInput(false)
    setMessage('Obrázek vložen do textu')
    
    // Focus back on textarea
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + imageMarkdown.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
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
            <div style={{ marginBottom: '0.5rem' }}>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={() => setShowImageUrlInput(!showImageUrlInput)}
                style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem' }}
              >
                📷 Vložit obrázek
              </button>
            </div>
            {showImageUrlInput && (
              <div style={{ 
                marginBottom: '0.75rem', 
                padding: '0.75rem', 
                border: '1px solid var(--border)', 
                borderRadius: '6px',
                backgroundColor: 'var(--card-bg)'
              }}>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  URL obrázku
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={insertImageAtCursor}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Vložit
                  </button>
                  <button 
                    type="button" 
                    className="btn-ghost" 
                    onClick={() => {
                      setShowImageUrlInput(false)
                      setTempImageUrl('')
                    }}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Zrušit
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  Obrázek bude vložen do textu na pozici kurzoru
                </div>
              </div>
            )}
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="15"
              required
              placeholder="Zde pište obsah článku. Pro vložení obrázku použijte tlačítko výše."
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              💡 Tip: Můžete vkládat více obrázků do textu postupně pomocí tlačítka &quot;Vložit obrázek&quot;
            </div>
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
            <label>URL hlavního obrázku (náhled)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              Tento obrázek se zobrazí jako náhled článku na hlavní stránce
            </div>
          </div>

          {message && (
            <div style={{ marginBottom: '1rem', color: message.includes('Chyba') ? 'crimson' : 'green' }}>
              {message}
            </div>
          )}

          <div className="admin-actions">
            {editingId && (
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={handleCancel}
                style={{ 
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem'
                }}
              >
                Zrušit
              </button>
            )}
            <button 
              type="submit" 
              className="btn-primary"
              style={{ 
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {editingId ? '✓ Aktualizovat článek' : '+ Přidat článek'}
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
                  <strong style={{ fontSize: '1.125rem' }}>{article.title}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-ghost" 
                      onClick={() => handleEdit(article)}
                      style={{ 
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      ✏️ Upravit
                    </button>
                    <button 
                      className="btn-ghost" 
                      onClick={() => handleDelete(article.id)}
                      style={{ 
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'crimson',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      🗑️ Smazat
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
