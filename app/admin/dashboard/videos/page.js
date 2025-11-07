'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VideosManagement() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'
  
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      router.replace('/admin')
      return
    }
    loadVideos()
  }, [router])

  const loadVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
      }
    } catch (err) {
      console.error('Error loading videos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const endpoint = editingId ? `/api/videos/${editingId}` : '/api/videos'
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url })
      })

      if (res.ok) {
        setMessage(editingId ? 'Video aktualizováno' : 'Video přidáno')
        setTitle('')
        setUrl('')
        setEditingId(null)
        loadVideos()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Chyba')
      }
    } catch (err) {
      console.error('Error saving video:', err)
      setMessage('Chyba při ukládání')
    }
  }

  const handleEdit = (video) => {
    setEditingId(video.id)
    setTitle(video.title)
    setUrl(video.url)
  }

  const handleDelete = async (id) => {
    if (!confirm('Opravdu smazat toto video?')) return

    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage('Video smazáno')
        loadVideos()
      }
    } catch (err) {
      console.error('Error deleting video:', err)
      setMessage('Chyba při mazání')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setTitle('')
    setUrl('')
    setMessage('')
  }

  return (
    <div className="admin-container">
      <div className="admin-card" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1>Správa videí</h1>
          <Link href="/admin/dashboard" className="btn-ghost">← Zpět</Link>
        </div>

        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '2rem' }}>
          <div className="form-row">
            <label>Název videa</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>URL videa (YouTube)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
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
              {editingId ? 'Aktualizovat' : 'Přidat video'}
            </button>
          </div>
        </form>

        <h2>Seznam videí</h2>
        {loading ? (
          <p>Načítám...</p>
        ) : videos.length === 0 ? (
          <p>Žádná videa</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {videos.map((video) => (
              <div 
                key={video.id} 
                style={{ 
                  padding: '1rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{video.title}</strong>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    {video.url}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-ghost" 
                    onClick={() => handleEdit(video)}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Upravit
                  </button>
                  <button 
                    className="btn-ghost" 
                    onClick={() => handleDelete(video.id)}
                    style={{ padding: '0.5rem 1rem', color: 'crimson' }}
                  >
                    Smazat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
