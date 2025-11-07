'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()

  const ADMIN_PASSWORD = 'PGVlasta'
  const ADMIN_SESSION_KEY = 'pgv-admin'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const logged = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    if (logged) {
      router.replace('/admin/dashboard')
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Nesprávné heslo.')
    }
  }

  return (
    <div style={{
      maxWidth: '420px',
      margin: '4rem auto',
      padding: '1.5rem',
      background: 'var(--card-bg)',
      color: 'var(--text)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      border: '1px solid rgba(0,0,0,0.06)'
    }}>
      <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>Admin</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="admin-pass">Heslo</label>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem'
          }}>
            <input
              id="admin-pass"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem 0.6rem',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'var(--card-bg)',
                color: 'var(--text)'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="admin-pass-toggle"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '0',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--muted)'
              }}
            >
              👁
            </button>
          </div>

          {error && (
            <div style={{ color: 'crimson', marginTop: '.4rem' }}>{error}</div>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '.5rem',
          marginTop: '1rem'
        }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setPassword('')
              setError('')
            }}
          >
            Zrušit
          </button>

          <button
            type="submit"
            className="btn-primary"
          >
            Přihlásit
          </button>
        </div>
      </form>
    </div>
  )
}
