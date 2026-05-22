'use client'
import { useEffect, useState } from 'react'

export default function Nav({ activePage, onNavigate }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const stored = window.localStorage.getItem('wrd-theme')
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    const nextTheme = stored || (prefersLight ? 'light' : 'dark')
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    window.localStorage.setItem('wrd-theme', nextTheme)
  }

  const links = [
    { id: 'featured', label: 'Featured' },
    { id: 'gallery',  label: 'Gallery'  },
    { id: 'about',    label: 'About'    },
  ]

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .nav-wordmark-full  { display: none !important; }
          .nav-wordmark-short { display: inline !important; }
        }
        @media (min-width: 641px) {
          .nav-wordmark-short { display: none; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        height: '64px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', backgroundColor: 'var(--dark)',
        borderBottom: '1px solid var(--border)',
      }}>

        {/* ── Typographic wordmark ── */}
        <button
          onClick={() => onNavigate('featured')}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: 'pointer', flex: 1, textAlign: 'left',
          }}
        >
          <span className="nav-wordmark-full" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem', fontWeight: 500,
            letterSpacing: '0.38em', textTransform: 'uppercase',
            color: 'var(--text)',
          }}>WRD Photography</span>

          <span className="nav-wordmark-short" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem', fontWeight: 500,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--text)',
            display: 'none',
          }}>WRD</span>
        </button>

        {/* ── Links + theme toggle ── */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {links.map(link => (
            <button key={link.id} onClick={() => onNavigate(link.id)} style={{
              background: 'none', border: 'none',
              borderBottom: activePage === link.id ? '1px solid var(--accent)' : '1px solid transparent',
              paddingBottom: '4px', cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px', fontWeight: activePage === link.id ? 500 : 400,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: activePage === link.id ? 'var(--text)' : 'var(--text-muted)',
              WebkitFontSmoothing: 'antialiased', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => {
                if (link.id !== activePage)
                  e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >{link.label}</button>
          ))}

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              border: '1px solid var(--border)', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
                <line x1="4.2" y1="4.2" x2="6.4" y2="6.4" />
                <line x1="17.6" y1="17.6" x2="19.8" y2="19.8" />
                <line x1="4.2" y1="19.8" x2="6.4" y2="17.6" />
                <line x1="17.6" y1="6.4" x2="19.8" y2="4.2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </>
  )
}
