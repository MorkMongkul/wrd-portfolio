'use client'
import { useEffect, useState } from 'react'

export default function Nav({ activePage, onNavigate }) {
  const [theme, setTheme] = useState('dark')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('wrd-theme')
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    const nextTheme = stored || (prefersLight ? 'light' : 'dark')
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }, [])

  // Body scroll-lock when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    window.localStorage.setItem('wrd-theme', nextTheme)
  }

  function handleNavigate(target) {
    setIsOpen(false)
    onNavigate(target)
  }

  const links = [
    { id: 'featured', label: 'Featured' },
    { id: 'gallery',  label: 'Gallery'  },
    { id: 'about',    label: 'About'    },
  ]

  return (
    <>
      <style>{`
        .nav-container {
          padding: 0 40px !important;
          transition: padding 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        
        /* Hamburger toggler button line animations */
        .hamburger-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: none;
          flex-direction: column;
          gap: 5px;
          z-index: 10000;
          align-items: center;
          justify-content: center;
        }
        .hamburger-line {
          display: block;
          width: 20px;
          height: 1.5px;
          background-color: var(--text);
          transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease;
        }
        .hamburger-btn.is-open .line-top {
          transform: translateY(6.5px) rotate(45deg);
        }
        .hamburger-btn.is-open .line-mid {
          opacity: 0;
        }
        .hamburger-btn.is-open .line-bot {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        /* Fullscreen Overlay Menu styles */
        .nav-overlay-menu {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background-color: var(--overlay);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.4s;
          opacity: 0;
          visibility: hidden;
        }
        .nav-overlay-menu.is-active {
          opacity: 1;
          visibility: visible;
        }
        .nav-overlay-links {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.2rem;
          margin-bottom: 4rem;
        }
        
        /* Mobile Breakpoint (below or equal to 768px) */
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .nav-container {
            padding: 0 20px !important;
          }
          .nav-wordmark-full {
            font-size: 1.15rem !important;
            letter-spacing: 0.22em !important;
          }
        }
        @media (max-width: 480px) {
          .nav-wordmark-full {
            font-size: 1.0rem !important;
            letter-spacing: 0.16em !important;
          }
        }

        /* Large Screen Responsive Scaling */
        @media (min-width: 1440px) {
          .nav-container {
            padding: 0 80px !important;
          }
          .nav-links-desktop {
            gap: 36px !important;
          }
        }
        @media (min-width: 1920px) {
          .nav-container {
            padding: 0 120px !important;
          }
          .nav-links-desktop {
            gap: 44px !important;
          }
          .nav-wordmark-full {
            letter-spacing: 0.4em !important;
          }
        }
      `}</style>

      <nav className="nav-container" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        height: '64px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--dark)',
        borderBottom: '1px solid var(--border)',
      }}>

        {/* ── Typographic wordmark ── */}
        <button
          onClick={() => handleNavigate('featured')}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: 'pointer', flex: 1, textAlign: 'left',
          }}
        >
          <span className="nav-wordmark-full" style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '1.25rem', fontWeight: 300,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'var(--text)',
          }}>WRD Photography</span>
        </button>
 
        {/* ── Desktop Links + theme toggle ── */}
        <div className="nav-links-desktop">
          {links.map(link => (
            <button key={link.id} onClick={() => handleNavigate(link.id)} style={{
              background: 'none', border: 'none',
              borderBottom: activePage === link.id ? '1px solid var(--accent)' : '1px solid transparent',
              paddingBottom: '4px', cursor: 'pointer',
              fontFamily: 'var(--font-garamond)',
              fontSize: '15px', fontWeight: activePage === link.id ? 400 : 300,
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

        {/* ── Mobile Hamburger toggle icon ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`hamburger-btn ${isOpen ? 'is-open' : ''}`}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line line-top" />
          <span className="hamburger-line line-mid" />
          <span className="hamburger-line line-bot" />
        </button>

        {/* ── Mobile Fullscreen Overlay ── */}
        <div className={`nav-overlay-menu ${isOpen ? 'is-active' : ''}`}>
          <div className="nav-overlay-links">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-garamond)',
                  fontSize: '2rem', fontWeight: 300,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: activePage === link.id ? 'var(--text)' : 'var(--text-muted)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => {
                  if (link.id !== activePage)
                    e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
            {/* Theme toggle in mobile overlay menu */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                border: '1px solid var(--border)', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text)'
              }}
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
