'use client'

import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'

export default function Videa() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const res = await fetch('/videos.json', { cache: 'no-store' })
      if (!res.ok) throw new Error('videos.json nenalezen (HTTP ' + res.status + ')')
      const data = await res.json()
      const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : [])
      setVideos(items)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Chyba při načítání')
      setLoading(false)
    }
  }

  const getYouTubeId = (url) => {
    if (!url) return null
    let m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/))([0-9A-Za-z_-]{11})/)
    if (m && m[1]) return m[1]
    m = url.match(/[?&]v=([0-9A-Za-z_-]{11})/)
    return m ? m[1] : null
  }

  const createVideoCard = (item, index) => {
    const title = item.title || 'YouTube video'
    const id = getYouTubeId(item.url || item.src || '')
    
    return (
      <div key={index} className="video-card">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        ) : item.embed ? (
          <div dangerouslySetInnerHTML={{ __html: item.embed }} />
        ) : (
          <div style={{ padding: '36% 0', background: '#111' }}></div>
        )}
        <div className="video-title">{title}</div>
      </div>
    )
  }

  return (
    <Layout>
      <main className="container">
        <h1>Videa</h1>
        <p className="lead">Zde vložte embed kódy z YouTube nebo Vimeo.</p>

        <div id="video-grid" className="video-grid" aria-live="polite" aria-busy={loading}>
          {loading && <div className="video-card">Načítám…</div>}
          {error && <div className="video-card" style={{ color: '#f66' }}>Chyba při načítání: {error}</div>}
          {!loading && !error && videos.length === 0 && <div className="video-card">Žádná videa</div>}
          {!loading && !error && videos.map((video, index) => createVideoCard(video, index))}
        </div>
      </main>
    </Layout>
  )
}
