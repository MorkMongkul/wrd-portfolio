'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { urlFor } from '@/sanity/lib/image'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function FeaturedPage({ photos }) {
  const containerRef = useRef(null)
  const slidesRef    = useRef([])
  const counterRef   = useRef(null)
  const TOTAL        = photos.length

  // ── Clip-path scroll reveal + text animations ──
  useGSAP(() => {
    if (TOTAL < 2) return

    const slides = slidesRef.current.filter(Boolean)
    if (!slides.length) return

    const scroller = containerRef.current
    const wrapper  = scroller.querySelector('.slides-wrapper')

    // z-index: first slide on top, last on bottom
    gsap.set(slides, { zIndex: (i) => slides.length - i })

    // All slides except the last start fully visible (they clip away to reveal below)
    gsap.set(slides.slice(0, -1), { clipPath: 'inset(0 0 0 0)' })

    // First slide text visible; rest hidden
    slides.forEach((slide, i) => {
      const els = slide.querySelectorAll('.slide-text')
      gsap.set(els, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 30 })
    })

    // Build the master timeline
    const tl = gsap.timeline()

    slides.slice(0, -1).forEach((slide, i) => {
      const nextEls = slides[i + 1].querySelectorAll('.slide-text')

      // Clip current slide away (bottom edge rises to top)
      tl.to(slide, {
        clipPath: 'inset(0 0 100% 0)',
        ease: 'none',
        duration: 1,
      }, i)

      // Reveal next slide's text as current clips away
      tl.to(nextEls, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
      }, i + 0.35)

      // Counter follows along in the timeline
      if (counterRef.current) {
        tl.to(counterRef.current, {
          y: `-${(i + 1) * 1.4}rem`,
          ease: 'none',
          duration: 1,
        }, i)
      }
    })

    // Track active slide for dots
    let activeIdx = 0

    ScrollTrigger.create({
      trigger: wrapper,
      scroller,
      start: 'top top',
      end: `+=${(TOTAL - 1) * 100}%`,
      scrub: true,
      pin: true,
      animation: tl,
      onUpdate: (self) => {
        const idx = Math.round(self.progress * (TOTAL - 1))
        if (idx !== activeIdx && scroller) {
          activeIdx = idx
          // Update dots via DOM (avoids React re-renders on every scroll)
          scroller.querySelectorAll('.dot').forEach((dot, di) => {
            dot.style.background = di === idx ? 'var(--accent-on-image)' : 'var(--muted-on-image)'
            dot.style.transform  = di === idx ? 'scale(1.6)' : 'scale(1)'
          })
        }
      }
    })

    ScrollTrigger.refresh()

  }, { scope: containerRef, dependencies: [photos], revertOnUpdate: true })

  // Keyboard navigation (scrolls the container, driving ScrollTrigger)
  useEffect(() => {
    if (TOTAL < 2) return

    function onKey(e) {
      const el = containerRef.current
      if (!el) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        el.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        el.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [TOTAL])

  if (!photos.length) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '1rem', letterSpacing: '.2em'
    }}>
      NO FEATURED PHOTOS YET — ADD SOME IN SANITY STUDIO
    </div>
  )

  const fmt = n => n < 10 ? `0${n}` : `${n}`

  return (
    <div ref={containerRef} className="page-scroll" style={{ background: 'var(--dark)' }}>
      <div className="slides-wrapper" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {photos.map((photo, idx) => (
          <div
            key={photo._id}
            ref={el => slidesRef.current[idx] = el}
            style={{
              position: 'absolute', inset: 0, overflow: 'hidden'
            }}
          >
            {/* Background image */}
            <div style={{
              position: 'absolute', top: '-10%', left: '-10%',
              width: '120%', height: '120%',
              backgroundImage: `url(${urlFor(photo.image).width(1920).quality(85).url()})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              willChange: 'transform'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,.25) 0%, rgba(0,0,0,.6) 100%)'
              }}/>
            </div>

            {/* Meta top right */}
            <div className="slide-text" style={{
              position: 'absolute', top: '9rem', right: '4rem',
              zIndex: 5, textAlign: 'right'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '.75rem',
                letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent-on-image)',
                marginBottom: '.5rem'
              }}>{photo.location}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '.7rem',
                color: 'var(--text-on-image-muted)', letterSpacing: '.1em'
              }}>{photo.date}</div>
            </div>

            {/* Text bottom left */}
            <div style={{
              position: 'absolute', bottom: '7rem', left: '4rem',
              maxWidth: '70%', zIndex: 5
            }}>
              <div className="slide-text" style={{
                fontFamily: 'var(--font-mono)', fontSize: '.75rem',
                letterSpacing: '.2em', textTransform: 'uppercase',
                color: 'var(--accent-on-image)', marginBottom: '1.2rem'
              }}>
                {fmt(idx + 1)} — {photo.series}
              </div>

              <div style={{ overflow: 'hidden' }}>
                {photo.title.split(' ').slice(0, 3).join(' ') !== photo.title ? (
                  <>
                    <span className="slide-text" style={{
                      display: 'block', fontFamily: 'var(--font-garamond)',
                      fontSize: '6.5rem', lineHeight: '.95',
                      fontStyle: 'italic', letterSpacing: '-.03em',
                      color: 'var(--text-on-image)'
                    }}>
                      {photo.title.split(' ').slice(0, Math.ceil(photo.title.split(' ').length / 2)).join(' ')}
                    </span>
                    <span className="slide-text" style={{
                      display: 'block', fontFamily: 'var(--font-garamond)',
                      fontSize: '6.5rem', lineHeight: '.95',
                      fontStyle: 'italic', letterSpacing: '-.03em',
                      color: 'var(--text-on-image)'
                    }}>
                      {photo.title.split(' ').slice(Math.ceil(photo.title.split(' ').length / 2)).join(' ')}
                    </span>
                  </>
                ) : (
                  <span className="slide-text" style={{
                    display: 'block', fontFamily: 'var(--font-garamond)',
                    fontSize: '6.5rem', lineHeight: '.95',
                    fontStyle: 'italic', letterSpacing: '-.03em',
                    color: 'var(--text-on-image)'
                  }}>
                    {photo.title}
                  </span>
                )}
              </div>

              {photo.writeup && (
                <div className="slide-text" style={{
                  marginTop: '1.8rem', maxWidth: '36rem',
                  fontFamily: 'var(--font-mono)', fontSize: '.8rem',
                  lineHeight: 1.7, color: 'var(--text-on-image-muted)', letterSpacing: '.03em'
                }}>
                  {photo.writeup}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Counter */}
        <div style={{
          position: 'absolute', bottom: '3.5rem', right: '4rem',
          display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 10
        }}>
          <div style={{ height: '1.4rem', overflow: 'hidden',
            fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-on-image)'
          }}>
            <div ref={counterRef}>
              {photos.map((_, i) => (
                <div key={i} style={{ height: '1.4rem', lineHeight: '1.4rem' }}>
                  {fmt(i + 1)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: 30, height: 1, background: 'var(--muted-on-image)' }}/>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--muted-on-image)' }}>
            {fmt(TOTAL)}
          </div>
        </div>

        {/* Dots */}
        <div style={{
          position: 'absolute', left: '50%', bottom: '3.5rem',
          transform: 'translateX(-50%)', zIndex: 10,
          display: 'flex', gap: '.8rem', alignItems: 'center'
        }}>
          {photos.map((_, i) => (
            <div key={i} className="dot" style={{
              width: 4, height: 4, borderRadius: '50%',
              background: i === 0 ? 'var(--accent-on-image)' : 'var(--muted-on-image)',
              transform: i === 0 ? 'scale(1.6)' : 'scale(1)',
              transition: 'background .3s, transform .3s'
            }}/>
          ))}
        </div>

        {/* Hint */}
        {TOTAL >= 2 && (
          <div style={{
            position: 'absolute', bottom: '3.5rem', left: '4rem', zIndex: 10,
            fontFamily: 'var(--font-mono)', fontSize: '.7rem',
            letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-on-image)'
          }}>
            scroll to explore
          </div>
        )}
      </div>
    </div>
  )
}
