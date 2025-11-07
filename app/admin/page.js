'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      router.replace('/admin/dashboard')
    }
  }, [router])

  async function submit(e) {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data.admin))
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Nesprávné přihlašovací údaje')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Chyba při přihlašování')
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1>Přihlášení admin</h1>

        <form onSubmit={submit} className="admin-form">
          <label>Uživatelské jméno</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <label>Heslo</label>
          <div className="admin-input-wrap">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="admin-eye"
              onClick={() => setShow(!show)}
              aria-label="Zobrazit heslo"
            >
              👁
            </button>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setUsername('')
                setPassword('')
                setError('')
              }}
            >
              Zrušit
            </button>

            <button type="submit" className="btn-primary">
              Přihlásit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
