'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MessagesManagement() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'
  
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      router.replace('/admin')
      return
    }
    loadMessages()
  }, [router])

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Opravdu smazat tento vzkaz?')) return

    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setStatusMessage('Vzkaz smazán')
        loadMessages()
        setTimeout(() => setStatusMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error deleting message:', err)
      setStatusMessage('Chyba při mazání')
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-card" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1>Správa vzkazů</h1>
          <Link href="/admin/dashboard" className="btn-ghost">← Zpět</Link>
        </div>

        {statusMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--border)', borderRadius: '6px' }}>
            {statusMessage}
          </div>
        )}

        {loading ? (
          <p>Načítám...</p>
        ) : messages.length === 0 ? (
          <p>Žádné vzkazy</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{ 
                  padding: '1rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{msg.name}</strong>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                      — {new Date(msg.createdAt).toLocaleString('cs-CZ')}
                    </span>
                  </div>
                  <button 
                    className="btn-ghost" 
                    onClick={() => handleDelete(msg.id)}
                    style={{ padding: '0.5rem 1rem', color: 'crimson' }}
                  >
                    Smazat
                  </button>
                </div>
                <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
