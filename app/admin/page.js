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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const logged = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    if (logged) {
      router.replace('/admin/dashboard')
    } else {
      setLoading(false)
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

  if (loading) return null

  return (
    <div style={{
      maxWidth: '380px',
      margin: '4rem auto',
      padding: '2rem',
      border: '1px solid var(--border-color)',
      borderRadius: '12px'
    }}>
      <h1>Přihlášení admin</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <label htmlFor="admin-pass">Heslo</label>
        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.3rem' }}>
          <input
            id="admin-pass"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{ flex: 1 }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Zobrazit / skrýt heslo"
          >
            👁
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '.5rem', color: 'red' }}>{error}</div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Přihlásit
        </button>
      </form>
    </div>
  )
}
