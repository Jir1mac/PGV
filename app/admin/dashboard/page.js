'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
      router.replace('/admin')
    }
  }, [])

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtext">Vítej v administraci.</p>

        <div className="admin-actions" style={{ marginTop: '1.5rem' }}>
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
    </div>
  )
}
