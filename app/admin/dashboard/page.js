'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const ADMIN_SESSION_KEY = 'pgv-admin'
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    const adminData = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (!adminData) {
      router.replace('/admin')
    } else {
      try {
        setAdmin(JSON.parse(adminData))
      } catch {
        router.replace('/admin')
      }
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    router.push('/')
  }

  if (!admin) {
    return null
  }

  return (
    <div className="admin-container">
      <div className="admin-card" style={{ maxWidth: '800px' }}>
        <h1>Admin Dashboard</h1>
        <p className="admin-subtext">Vítej, {admin.username}!</p>

        <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
          <Link 
            href="/admin/dashboard/videos" 
            className="btn-primary"
            style={{ textAlign: 'center', display: 'block', padding: '1rem' }}
          >
            Správa videí
          </Link>
          
          <Link 
            href="/admin/dashboard/articles" 
            className="btn-primary"
            style={{ textAlign: 'center', display: 'block', padding: '1rem' }}
          >
            Správa článků
          </Link>
          
          <Link 
            href="/admin/dashboard/messages" 
            className="btn-primary"
            style={{ textAlign: 'center', display: 'block', padding: '1rem' }}
          >
            Správa vzkazů
          </Link>
        </div>

        <div className="admin-actions" style={{ marginTop: '2rem' }}>
          <button className="btn-ghost" onClick={handleLogout}>
            Odhlásit
          </button>
        </div>
      </div>
    </div>
  )
}
