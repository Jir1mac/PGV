'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'

  useEffect(() => {
    const logged = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    if (!logged) router.replace('/admin')
  }, [])

  return (
    <div style={{
      maxWidth: '680px',
      margin: '4rem auto',
      padding: '1.5rem',
      borderRadius: 'var(--radius)',
      background: 'var(--card-bg)',
      color: 'var(--text)',
      boxShadow: 'var(--shadow)',
      border: '1px solid rgba(0,0,0,0.06)'
    }}>
      <h1 style={{ marginTop: 0, marginBottom: '1rem' }}>Admin Dashboard</h1>

      <p style={{ color: 'var(--muted)' }}>
        Vítej v administraci.
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <button
          className="btn-ghost"
          onClick={() => {
            sessionStorage.removeItem(ADMIN_SESSION_KEY)
            router.push('/')
          }}
        >
          Odhlásit
        </button>
      </div>
    </div>
  )
}
