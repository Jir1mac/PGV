'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [theme, setTheme] = useState('light')

  const ADMIN_PASSWORD = 'PGVlasta'
  const ADMIN_SESSION_KEY = 'pgv-admin'
  const THEME_KEY = 'pgv-theme'

  useEffect(() => {
    // Check admin status
    const adminStatus = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    setIsAdmin(adminStatus)

    // Initialize theme
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      setTheme(initialTheme)
      document.documentElement.setAttribute('data-theme', initialTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
  }

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
      setIsAdmin(true)
      setShowPopover(false)
      setPassword('')
      setError('')
      // Show success message instead of alert
      setError('✓ Přihlášení úspěšné')
      setTimeout(() => setError(''), 2000)
    } else {
      setError('Nesprávné heslo.')
    }
  }

  const navItems = [
    { href: '/', label: 'Domů' },
    { href: '/clanky', label: 'Články' },
    { href: '/videa', label: 'Videa' },
    { href: '/odkazy', label: 'Odkazy' },
    { href: '/vzkazy', label: 'Vzkazy' },
  ]

  return (
    <header className="site-header" role="banner">
      <div className="header-left">
        <Link className="brand" href="/">PGV</Link>
      </div>

      <button 
        className="nav-toggle" 
        aria-expanded="false" 
        aria-controls="main-nav" 
        aria-label="Otevřít navigaci"
      >
        <span className="hamburger" aria-hidden="true"></span>
      </button>

      <nav id="main-nav" className="header-center" role="navigation" aria-label="Hlavní navigace">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-right">
        <button 
          className={`theme-admin-btn ${isAdmin ? 'admin-on' : ''}`}
          type="button"
          aria-label="Přepnout motiv / administrace"
          title="Motiv / Admin"
          onClick={(e) => {
            if (!e.target.closest('.admin-icon')) {
              toggleTheme()
            }
          }}
        >
          <span className="ta-icon" aria-hidden="true">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span 
            className="admin-icon"
            role="button"
            tabIndex="0"
            aria-label="Admin"
            title="Admin"
            onClick={(e) => {
              e.stopPropagation()
              setShowPopover(!showPopover)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        {showPopover && (
          <div className="admin-popover open" role="dialog" aria-modal="false">
            <h3>Přihlášení správce</h3>
            <form onSubmit={handleAdminSubmit}>
              <div className="admin-row">
                <label htmlFor="admin-pass">Heslo</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    id="admin-pass" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Admin heslo"
                  />
                  <button 
                    id="admin-pass-toggle"
                    className="admin-pass-toggle"
                    type="button"
                    aria-pressed={showPassword}
                    title="Zobrazit/skrýt heslo"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {error && <div id="admin-error" className="admin-error" aria-live="polite">{error}</div>}
              </div>
              <div className="admin-actions">
                <button 
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowPopover(false)
                    setPassword('')
                    setError('')
                  }}
                >
                  Zrušit
                </button>
                <button type="submit" className="btn btn-primary">Přihlásit</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
