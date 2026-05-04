'use client'
import { useEffect, useRef } from 'react'

export default function Nav({ activePage, onNavigate }) {
  const navRef    = useRef(null)
  const gsapRef   = useRef(null)
  const hiddenRef = useRef(false)

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
        padding: '0 40px', backgroundColor: '#0a0a08',
        borderBottom: '1px solid rgba(200,169,110,0.25)',
        willChange: 'transform',
      }}>
        <button onClick={() => onNavigate('featured')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: '#ffffff', fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '15px', fontWeight: 600, letterSpacing: '2px',
          textTransform: 'uppercase', WebkitFontSmoothing: 'antialiased',
        }}>
          <span style={{ color: '#c8a96e' }}>WRD</span> Photography
        </button>

        <div style={{ display: 'flex', gap: '40px' }}>
          {links.map(link => (
            <button key={link.id} onClick={() => onNavigate(link.id)} style={{
              background: 'none', border: 'none',
              borderBottom: activePage === link.id ? '1px solid #c8a96e' : '1px solid transparent',
              paddingBottom: '4px', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px', fontWeight: activePage === link.id ? 500 : 400,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: activePage === link.id ? '#ffffff' : 'rgba(255,255,255,0.6)',
              WebkitFontSmoothing: 'antialiased', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => {
                if (link.id !== activePage)
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              }}
            >{link.label}</button>
          ))}
        </div>
      </nav>
    </>
  )
}
