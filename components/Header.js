'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const [isAdmin, setIsAdmin] = useState(false)
  const [theme, setTheme] = useState('light')
  const [isNavOpen, setIsNavOpen] = useState(false)

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
      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      setTheme(initialTheme)
      document.documentElement.setAttribute('data-theme', initialTheme)
    }
  }, [])

  useEffect(() => {
    // Toggle nav-open class on body element
    if (isNavOpen) {
      document.body.classList.add('nav-open')
    } else {
      document.body.classList.remove('nav-open')
    }

    // Clean up on unmount
    return () => {
      document.body.classList.remove('nav-open')
    }
  }, [isNavOpen])

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
  }

  const navItems = [
    { href: '/', label: 'Domů' },
    { href: '/clanky', label: 'Články' },
    { href: '/videa', label: 'Videa' },
    { href: '/odkazy', label: 'Odkazy' },
    { href: '/vzkazy', label: 'Vzkazy' },
  ]

  const handleNavClick = () => {
    // Close mobile menu when a nav link is clicked
    setIsNavOpen(false)
  }

  return (
    <header className="site-header" role="banner">
      <div className="header-left">
        <Link className="brand" href="/">PGV</Link>
      </div>

      <button 
        className="nav-toggle" 
        aria-expanded={isNavOpen} 
        aria-controls="main-nav" 
        aria-label={isNavOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
        onClick={toggleNav}
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
                onClick={handleNavClick}
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

          {/* ADMIN ICON */}
          <span 
            className="admin-icon"
            role="button"
            tabIndex="0"
            aria-label="Admin"
            title="Admin"
            onClick={(e) => {
              e.stopPropagation()
              router.push('/admin')
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>

        </button>
      </div>
    </header>
  )
}
