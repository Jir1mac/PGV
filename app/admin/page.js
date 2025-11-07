'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'
  const ADMIN_PASSWORD = 'PGVlasta'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
      router.replace('/admin/dashboard')
    }
  }, [])

  function submit(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Nesprávné heslo.')
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1>Přihlášení admin</h1>

        <form onSubmit={submit} className="admin-form">
          <label>Heslo</label>

          <div className="admin-input-wrap">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
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
