'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  const ADMIN_SESSION_KEY = 'pgv-admin'

  // ochrana
  useEffect(() => {
    const logged = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    if (!logged) {
      router.replace('/admin')
    }
  }, [router])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Jsi přihlášen jako admin.</p>

      <button
        onClick={() => {
          sessionStorage.removeItem(ADMIN_SESSION_KEY)
          router.push('/')
        }}
        className="btn btn-ghost"
        style={{ marginTop: '1rem' }}
      >
        Odhlásit
      </button>
    </div>
  )
}
