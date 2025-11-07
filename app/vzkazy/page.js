'use client'

import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'

const MAX_NAME_LEN = 80
const MAX_MSG_LEN = 2000
const ADMIN_SESSION_KEY = 'pgv-admin'

export default function Vzkazy() {
  const [entries, setEntries] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
    const adminData = sessionStorage.getItem(ADMIN_SESSION_KEY)
    setIsAdmin(!!adminData)
  }, [])

  const loadEntries = async () => {
    try {
      const res = await fetch('/api/messages', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setEntries(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error('Error loading messages', e)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const trimmedName = name.trim().slice(0, MAX_NAME_LEN)
    const trimmedMessage = message.trim().slice(0, MAX_MSG_LEN)

    if (!trimmedName || !trimmedMessage) {
      setStatus('Vyplňte jméno i vzkaz.')
      return
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: trimmedName,
          message: trimmedMessage
        })
      })

      if (res.ok) {
        setName('')
        setMessage('')
        setStatus('Vzkaz odeslán.')
        loadEntries()
        
        setTimeout(() => {
          setStatus('')
        }, 2500)
      } else {
        const data = await res.json()
        setStatus(data.error || 'Chyba při ukládání vzkazu')
      }
    } catch (err) {
      console.error('Error submitting message:', err)
      setStatus('Chyba při ukládání vzkazu')
    }
  }

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setStatus('Pro smazání vzkazu se přihlaste jako admin.')
      setTimeout(() => setStatus(''), 3000)
      return
    }

    if (!confirm('Opravdu smazat tento vzkaz?')) return

    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadEntries()
      }
    } catch (err) {
      console.error('Error deleting message:', err)
      setStatus('Chyba při mazání vzkazu')
    }
  }

  return (
    <Layout>
      <main className="container guestbook-page">
        <h1>Vzkazy návštěvníků</h1>
        <p className="lead">Zanechte vzkaz.</p>

        <form id="guestbook-form" className="guestbook-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Jméno</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LEN}
            />
          </div>

          <div className="form-row">
            <label htmlFor="message">Vzkaz</label>
            <textarea 
              id="message" 
              name="message" 
              rows="4" 
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MSG_LEN}
            ></textarea>
          </div>

          <div className="form-row">
            <button type="submit" className="btn btn-primary">Odeslat</button>
          </div>

          {status && (
            <div 
              id="guestbook-status" 
              style={{ 
                marginTop: '0.5rem',
                color: status.includes('Chyba') ? 'crimson' : 'var(--muted)'
              }}
            >
              {status}
            </div>
          )}
        </form>

        <section>
          <h2>Poslední vzkazy</h2>
          {loading ? (
            <p>Načítám...</p>
          ) : (
            <ul id="guestbook-list" className="guestbook-list">
              {entries.map((entry) => {
                const when = entry.createdAt ? new Date(entry.createdAt).toLocaleString('cs-CZ') : ''
                return (
                  <li key={entry.id}>
                    <strong>{entry.name}</strong> <span className="muted">— {when}</span>
                    <div>{entry.message}</div>
                    {isAdmin && (
                      <button 
                        className="gb-delete"
                        onClick={() => handleDelete(entry.id)}
                        aria-label="Smazat vzkaz"
                        style={{
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.45rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,80,80,0.12)',
                          background: 'transparent',
                          color: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        Smazat
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </Layout>
  )
}
