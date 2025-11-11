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
  const [excerpt, setExcerpt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sections, setSections] = useState([{ text: '', images: [] }])
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [uploadingSection, setUploadingSection] = useState(null)
  const [uploadingPreview, setUploadingPreview] = useState(false)

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
        body: JSON.stringify({ 
          title, 
          content: '', // Keep for backward compatibility
          excerpt, 
          imageUrl,
          sections: sections.filter(s => s.text.trim())
        })
      })

      if (res.ok) {
        setMessage(editingId ? 'Článek aktualizován' : 'Článek přidán')
        setTitle('')
        setExcerpt('')
        setImageUrl('')
        setSections([{ text: '', images: [] }])
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
    setExcerpt(article.excerpt || '')
    setImageUrl(article.imageUrl || '')
    
    if (article.sections && article.sections.length > 0) {
      setSections(article.sections.map(section => ({
        text: section.text,
        images: section.images || []
      })))
    } else {
      setSections([{ text: article.content || '', images: [] }])
    }
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
    setExcerpt('')
    setImageUrl('')
    setSections([{ text: '', images: [] }])
    setMessage('')
  }

  const addSection = () => {
    setSections([...sections, { text: '', images: [] }])
  }

  const removeSection = (index) => {
    if (sections.length === 1) {
      setMessage('Článek musí mít alespoň jednu sekci')
      return
    }
    const newSections = sections.filter((_, i) => i !== index)
    setSections(newSections)
  }

  const updateSectionText = (index, text) => {
    const newSections = [...sections]
    newSections[index].text = text
    setSections(newSections)
  }

  const handleImageUpload = async (sectionIndex, e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingSection(sectionIndex)
    setMessage('Nahrávám obrázky...')

    try {
      const uploadedImages = []
      
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (res.ok) {
          const data = await res.json()
          uploadedImages.push({ imageUrl: data.imageUrl })
        } else {
          const error = await res.json()
          setMessage(error.error || 'Chyba při nahrávání')
          setUploadingSection(null)
          return
        }
      }

      const newSections = [...sections]
      newSections[sectionIndex].images = [
        ...newSections[sectionIndex].images,
        ...uploadedImages
      ]
      setSections(newSections)
      setMessage(`${uploadedImages.length} obrázek(ů) nahráno`)
    } catch (err) {
      console.error('Error uploading images:', err)
      setMessage('Chyba při nahrávání obrázků')
    } finally {
      setUploadingSection(null)
    }
  }

  const removeImage = (sectionIndex, imageIndex) => {
    const newSections = [...sections]
    newSections[sectionIndex].images = newSections[sectionIndex].images.filter(
      (_, i) => i !== imageIndex
    )
    setSections(newSections)
  }

  const handlePreviewImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPreview(true)
    setMessage('Nahrávám náhledový obrázek...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (res.ok) {
        const data = await res.json()
        setImageUrl(data.imageUrl)
        setMessage('Náhledový obrázek nahrán')
      } else {
        const error = await res.json()
        setMessage(error.error || 'Chyba při nahrávání náhledového obrázku')
      }
    } catch (err) {
      console.error('Error uploading preview image:', err)
      setMessage('Chyba při nahrávání náhledového obrázku')
    } finally {
      setUploadingPreview(false)
    }
  }

  // Validate URL to prevent XSS
  const isValidImageUrl = (url) => {
    if (!url) return false
    try {
      const urlObj = new URL(url, window.location.origin)
      // Only allow http, https, and relative URLs
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || url.startsWith('/')
    } catch {
      // If URL parsing fails, check if it's a relative path
      return url.startsWith('/')
    }
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
            <label>Krátký popis (výňatek)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-row">
            <label>Náhledový obrázek (zobrazuje se na hlavní stránce)</label>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handlePreviewImageUpload}
                disabled={uploadingPreview}
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                Nahrajte obrázek z počítače (max 5MB, formáty: JPG, PNG, GIF, WEBP)
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              nebo zadejte URL:
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              disabled={uploadingPreview}
            />
            {imageUrl && isValidImageUrl(imageUrl) && (
              <div style={{ marginTop: '0.75rem' }}>
                <img 
                  src={imageUrl} 
                  alt="Náhled" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                Sekce článku
              </label>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={addSection}
                style={{ padding: '0.5rem 1rem' }}
              >
                + Přidat sekci
              </button>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              Každá sekce může obsahovat text a více obrázků. Můžete přidávat neomezeně sekcí.
            </div>
          </div>

          {sections.map((section, index) => (
            <div 
              key={index}
              style={{ 
                padding: '1.5rem', 
                border: '2px solid var(--border)', 
                borderRadius: '8px',
                marginBottom: '1.5rem',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong>Sekce {index + 1}</strong>
                {sections.length > 1 && (
                  <button 
                    type="button" 
                    className="btn-ghost" 
                    onClick={() => removeSection(index)}
                    style={{ 
                      padding: '0.5rem 1rem',
                      color: 'crimson',
                      fontSize: '0.875rem'
                    }}
                  >
                    🗑️ Odebrat sekci
                  </button>
                )}
              </div>

              <div className="form-row">
                <label>Text sekce</label>
                <textarea
                  value={section.text}
                  onChange={(e) => updateSectionText(index, e.target.value)}
                  rows="8"
                  placeholder="Napište text této sekce..."
                  required
                />
              </div>

              <div className="form-row">
                <label>Obrázky sekce</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={(e) => handleImageUpload(index, e)}
                  disabled={uploadingSection === index}
                  style={{ marginBottom: '1rem' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  Můžete vybrat více obrázků najednou. Maximum 5MB na obrázek. Povolené formáty: JPG, PNG, GIF, WEBP
                </div>

                {section.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {section.images.map((image, imgIndex) => (
                      <div 
                        key={imgIndex}
                        style={{ 
                          position: 'relative',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          overflow: 'hidden'
                        }}
                      >
                        <img 
                          src={image.imageUrl} 
                          alt={`Obrázek ${imgIndex + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '150px', 
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, imgIndex)}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'rgba(220, 38, 38, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

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
                {article.sections && article.sections.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                    {article.sections.length} sekce
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
