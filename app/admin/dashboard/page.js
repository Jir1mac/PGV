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
    <div className="admin-container" style={{ maxWidth: '900px' }}>
      <div className="admin-card" style={{ maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Admin Dashboard</h1>
          <p className="admin-subtext">Vítej, {admin.username}! 👋</p>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem' 
        }}>
          <Link 
            href="/admin/dashboard/videos" 
            className="admin-dashboard-card"
          >
            <div className="admin-dashboard-icon">🎥</div>
            <h3>Správa videí</h3>
            <p>Spravujte video obsah</p>
          </Link>
          
          <Link 
            href="/admin/dashboard/articles" 
            className="admin-dashboard-card"
          >
            <div className="admin-dashboard-icon">📝</div>
            <h3>Správa článků</h3>
            <p>Vytvářejte a upravujte články</p>
          </Link>
          
          <Link 
            href="/admin/dashboard/messages" 
            className="admin-dashboard-card"
          >
            <div className="admin-dashboard-icon">💬</div>
            <h3>Správa vzkazů</h3>
            <p>Prohlížejte zprávy návštěvníků</p>
          </Link>
        </div>

        <div className="admin-actions" style={{ marginTop: '3rem', justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={handleLogout}>
            Odhlásit se
          </button>
        </div>
      </div>
    </div>
  )
}
