'use client'
import { useEffect, useRef, useCallback } from 'react'
import { urlFor } from '@/sanity/lib/image'

export default function Lightbox({ photo, photos, onClose, onPrev, onNext }) {
  const overlayRef  = useRef(null)
  const imgWrapRef  = useRef(null)
  const imgRef      = useRef(null)
  const infoRef     = useRef(null)
  const closeRef    = useRef(null)
  const navRef      = useRef(null)
  const gsapRef     = useRef(null)

  // open animation
  useEffect(() => {
    if (!photo) return

    import('gsap').then(({ gsap }) => {
      gsapRef.current = gsap

      const tl = gsap.timeline()

      // overlay fade in
      tl.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: .4, ease: 'power2.out' }
      )
      // image scale up from small
      .fromTo(imgWrapRef.current,
        { scale: .85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: .65, ease: 'power3.out' },
        .1
      )
      // info slide up
      .fromTo(infoRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: .5, ease: 'power3.out' },
        .35
      )
      // close button
      .fromTo(closeRef.current,
        { opacity: 0, rotate: -45 },
        { opacity: 1, rotate: 0, duration: .4, ease: 'power2.out' },
        .3
      )
      // nav arrows
      .fromTo(navRef.current?.querySelectorAll('.lb-nav-btn') || [],
        { opacity: 0, x: 0 },
        { opacity: 1, x: 0, duration: .4, stagger: .1 },
        .4
      )
    })

    // keyboard navigation
    function onKey(e) {
      if (e.key === 'Escape')     handleClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft')  onPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photo])

  // image swap animation when prev/next
  useEffect(() => {
    const gsap = gsapRef.current
    if (!gsap || !imgRef.current || !infoRef.current) return

    gsap.fromTo(imgRef.current,
      { opacity: 0, scale: .96, x: 20 },
      { opacity: 1, scale: 1, x: 0, duration: .5, ease: 'power3.out' }
    )
    gsap.fromTo(infoRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: .4, ease: 'power2.out', delay: .1 }
    )
  }, [photo?._id])

  function handleClose() {
    const gsap = gsapRef.current
    if (!gsap) { onClose(); return }

    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(imgWrapRef.current, {
      scale: .88, opacity: 0, y: 20, duration: .4, ease: 'power2.in'
    })
    .to(overlayRef.current,
      { opacity: 0, duration: .35, ease: 'power2.in' }, .1
    )
  }

  if (!photo) return null

  const currentIndex = photos.findIndex(p => p._id === photo._id)
  const fmt = n => n < 10 ? `0${n}` : `${n}`

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) handleClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* close button */}
      <button
        ref={closeRef}
        onClick={handleClose}
        onMouseEnter={e => {
          gsapRef.current?.to(e.currentTarget, {
            scale: 1.1, rotate: 90, duration: .3, ease: 'power2.out'
          })
        }}
        onMouseLeave={e => {
          gsapRef.current?.to(e.currentTarget, {
            scale: 1, rotate: 0, duration: .3, ease: 'power2.out'
          })
        }}
        style={{
          position: 'fixed', top: '2rem', right: '2rem',
          width: '48px', height: '48px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', fontSize: '20px', zIndex: 100000,
        }}
      >✕</button>

      {/* counter */}
      <div style={{
        position: 'fixed', top: '2.4rem', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Courier New', monospace", fontSize: '12px',
        letterSpacing: '3px', color: 'rgba(255,255,255,0.4)',
        zIndex: 100000,
      }}>
        {fmt(currentIndex + 1)} / {fmt(photos.length)}
      </div>

      {/* main content */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '5rem', maxWidth: '1400px', width: '100%', height: '100%',
      }}>

        {/* image */}
        <div
          ref={imgWrapRef}
          style={{
            flex: '1 1 auto', height: '85vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative',
          }}
        >
          <img
            ref={imgRef}
            src={urlFor(photo.image).width(1600).quality(90).url()}
            alt={photo.title}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain', display: 'block',
              userSelect: 'none',
            }}
          />
        </div>

        {/* info panel */}
        <div
          ref={infoRef}
          style={{
            width: '28rem', flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: '2rem',
          }}
        >
          {/* series */}
          <div style={{
            fontFamily: "'Courier New', monospace", fontSize: '11px',
            letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a96e',
          }}>{photo.series}</div>

          {/* title */}
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(2.5rem,4vw,3.5rem)', fontWeight: 300,
            lineHeight: 1, letterSpacing: '-1px', color: '#ffffff',
          }}>{photo.title}</h2>

          {/* divider */}
          <div style={{
            width: '3rem', height: '1px', background: '#c8a96e'
          }}/>

          {/* writeup */}
          {photo.writeup && (
            <p style={{
              fontFamily: "'Courier New', monospace", fontSize: '13px',
              lineHeight: 1.9, color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.3px',
            }}>{photo.writeup}</p>
          )}

          {/* meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
            {photo.location && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Courier New', monospace", fontSize: '11px',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.3)', minWidth: '6rem'
                }}>Location</span>
                <span style={{
                  fontFamily: "'Courier New', monospace", fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px'
                }}>{photo.location}</span>
              </div>
            )}
            {photo.date && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Courier New', monospace", fontSize: '11px',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.3)', minWidth: '6rem'
                }}>Date</span>
                <span style={{
                  fontFamily: "'Courier New', monospace", fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px'
                }}>{photo.date}</span>
              </div>
            )}
          </div>

          {/* nav arrows */}
          <div ref={navRef} style={{
            display: 'flex', gap: '1rem', marginTop: '1rem'
          }}>
            <button
              className="lb-nav-btn"
              onClick={onPrev}
              onMouseEnter={e => {
                gsapRef.current?.to(e.currentTarget, {
                  x: -4, duration: .2, ease: 'power2.out'
                })
              }}
              onMouseLeave={e => {
                gsapRef.current?.to(e.currentTarget, {
                  x: 0, duration: .2, ease: 'power2.out'
                })
              }}
              style={{
                fontFamily: "'Courier New', monospace", fontSize: '12px',
                letterSpacing: '2px', textTransform: 'uppercase',
                padding: '1rem 2rem', cursor: 'pointer',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                transition: 'border-color .2s, color .2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.color = '#ffffff'
                gsapRef.current?.to(e.currentTarget, { x: -4, duration: .2 })
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                gsapRef.current?.to(e.currentTarget, { x: 0, duration: .2 })
              }}
            >← Prev</button>

            <button
              className="lb-nav-btn"
              onClick={onNext}
              style={{
                fontFamily: "'Courier New', monospace", fontSize: '12px',
                letterSpacing: '2px', textTransform: 'uppercase',
                padding: '1rem 2rem', cursor: 'pointer',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                transition: 'border-color .2s, color .2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.color = '#ffffff'
                gsapRef.current?.to(e.currentTarget, { x: 4, duration: .2 })
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                gsapRef.current?.to(e.currentTarget, { x: 0, duration: .2 })
              }}
            >Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
