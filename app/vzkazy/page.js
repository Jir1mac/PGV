'use client'

import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'

const GB_KEY = 'pgv-guestbook'
const MAX_ENTRIES = 200
const MAX_NAME_LEN = 80
const MAX_MSG_LEN = 2000
const ADMIN_SESSION_KEY = 'pgv-admin'

export default function Vzkazy() {
  const [entries, setEntries] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadEntries()
    const adminStatus = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    setIsAdmin(adminStatus)
  }, [])

  const loadEntries = () => {
    try {
      const raw = localStorage.getItem(GB_KEY)
      const parsed = JSON.parse(raw || '[]')
      setEntries(Array.isArray(parsed) ? parsed : [])
    } catch (e) {
      console.error('Error loading guestbook', e)
      setEntries([])
    }
  }

  const saveEntries = (newEntries) => {
    try {
      if (!Array.isArray(newEntries)) newEntries = []
      if (newEntries.length > MAX_ENTRIES) newEntries = newEntries.slice(0, MAX_ENTRIES)
      localStorage.setItem(GB_KEY, JSON.stringify(newEntries))
      return true
    } catch (e) {
      console.error('Cannot save guestbook', e)
      return false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const trimmedName = name.trim().slice(0, MAX_NAME_LEN)
    const trimmedMessage = message.trim().slice(0, MAX_MSG_LEN)

    if (!trimmedName || !trimmedMessage) {
      setStatus('Vyplňte jméno i vzkaz.')
      return
    }

    const newEntries = [...entries]
    newEntries.unshift({
      name: trimmedName,
      message: trimmedMessage,
      time: new Date().toISOString()
    })

    if (newEntries.length > MAX_ENTRIES) {
      newEntries.length = MAX_ENTRIES
    }

    const ok = saveEntries(newEntries)
    if (!ok) {
      setStatus('Chyba při ukládání vzkazu')
      return
    }

    setEntries(newEntries)
    setName('')
    setMessage('')
    setStatus('Vzkaz odeslán.')

    setTimeout(() => {
      setStatus('')
    }, 2500)
  }

  const handleDelete = (index) => {
    if (!isAdmin) {
      setStatus('Pro smazání vzkazu se přihlaste jako admin.')
      setTimeout(() => setStatus(''), 3000)
      return
    }

    if (!confirm('Opravdu smazat tento vzkaz?')) return

    const newEntries = [...entries]
    newEntries.splice(index, 1)
    saveEntries(newEntries)
    setEntries(newEntries)
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
          <ul id="guestbook-list" className="guestbook-list">
            {entries.map((entry, index) => {
              const when = entry.time ? new Date(entry.time).toLocaleString() : ''
              return (
                <li key={index}>
                  <strong>{entry.name}</strong> <span className="muted">— {when}</span>
                  <div>{entry.message}</div>
                  {isAdmin && (
                    <button 
                      className="gb-delete"
                      onClick={() => handleDelete(index)}
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
        </section>
      </main>
    </Layout>
  )
}
