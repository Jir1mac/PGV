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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      router.replace('/admin/dashboard')
    }
  }, [router])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
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
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Chyba při přihlašování')
      setLoading(false)
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <div className="admin-icon-wrap">
            <span className="admin-shield-icon">🔒</span>
          </div>
          <h1>Administrátorské přihlášení</h1>
          <p className="admin-subtitle">Zadejte své přihlašovací údaje</p>
        </div>

        <form onSubmit={submit} className="admin-form">
          <div className="form-group">
            <label htmlFor="username">Uživatelské jméno</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Zadejte uživatelské jméno"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Heslo</label>
            <div className="admin-input-wrap">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Zadejte heslo"
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="admin-eye"
                onClick={() => setShow(!show)}
                aria-label="Zobrazit heslo"
                tabIndex="-1"
              >
                {show ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="admin-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setUsername('')
                setPassword('')
                setError('')
              }}
              disabled={loading}
            >
              Zrušit
            </button>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Přihlašování...' : 'Přihlásit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
