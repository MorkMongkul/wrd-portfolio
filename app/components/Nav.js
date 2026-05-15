'use client'
import { useEffect, useRef, useState } from 'react'

export default function Nav({ activePage, onNavigate }) {
  const navRef    = useRef(null)
  const gsapRef   = useRef(null)
  const hiddenRef = useRef(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    import('gsap').then(({ gsap }) => {
      gsapRef.current = gsap

      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: .9, ease: 'power3.out', delay: .5 }
      )

      setTimeout(() => {
        gsap.to(navRef.current, {
          y: -80, opacity: 0, duration: .5, ease: 'power2.in'
        })
        hiddenRef.current = true
      }, 2500)
    })

    function onMouseMove(e) {
      const gsap = gsapRef.current
      if (!gsap || !navRef.current) return

      // don't show nav when lightbox is open
      if (document.querySelector('[data-lightbox]')) return

      if (e.clientY < 80 && hiddenRef.current) {
        gsap.to(navRef.current, {
          y: 0, opacity: 1, duration: .45, ease: 'power3.out'
        })
        hiddenRef.current = false
      }

      if (e.clientY > 120 && !hiddenRef.current) {
        gsap.to(navRef.current, {
          y: -80, opacity: 0, duration: .4, ease: 'power2.in'
        })
        hiddenRef.current = true
      }
    }

    // everything inside useEffect — no window error
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useEffect(() => {
    const gsap = gsapRef.current
    if (!gsap || !navRef.current) return

    gsap.to(navRef.current, {
      y: 0, opacity: 1, duration: .45, ease: 'power3.out'
    })
    hiddenRef.current = false

    const timer = setTimeout(() => {
      gsap.to(navRef.current, {
        y: -80, opacity: 0, duration: .5, ease: 'power2.in'
      })
      hiddenRef.current = true
    }, 2500)

    return () => clearTimeout(timer)
  }, [activePage])

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
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '8px', zIndex: 10000, background: 'transparent',
      }}/>
      <nav ref={navRef} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        height: '64px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', backgroundColor: 'var(--dark)',
        borderBottom: '1px solid var(--border)',
        willChange: 'transform',
      }}>
        <button onClick={() => onNavigate('featured')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'var(--text)', fontFamily: 'var(--font-sans)',
          fontSize: '15px', fontWeight: 600, letterSpacing: '2px',
          textTransform: 'uppercase', WebkitFontSmoothing: 'antialiased',
        }}>
          <span style={{ color: 'var(--accent)' }}>WRD</span> Photography
        </button>

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
