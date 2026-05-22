'use client'
import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { urlFor } from '@/sanity/lib/image'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function FeaturedPage({ coverData, onDiscoverSeries }) {
  const containerRef = useRef(null)
  const slidesRef    = useRef([])
  const counterRef   = useRef(null)

  // Helper to split a string into individual word blocks for the line-by-line reveal effect
  const splitTitle = (titleText) => {
    if (!titleText) return null
    return titleText.split(' ').map((word, index) => (
      <span key={index} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.3em', lineHeight: '1.15' }}>
        <span className="title-line-inner" style={{ display: 'inline-block', transform: 'translateY(110%)', willChange: 'transform' }}>
          {word}
        </span>
      </span>
    ))
  }

  // ── Construct slides list: Hero Cover + featured Series, or fallback to legacy photos ──
  const slides = useMemo(() => {
    const list = []
    if (coverData && coverData.heroImage) {
      // Slide 0: Hero Cover Page
      list.push({
        _id: 'hero-cover',
        isHero: true,
        image: coverData.heroImage,
        title: coverData.headingTitle || 'Featured Work',
        subtitle: coverData.subHeading || ''
      })

      // Slides 1..N: Selected featured Series
      if (coverData.featuredSeries && coverData.featuredSeries.length > 0) {
        coverData.featuredSeries.forEach((series, sIdx) => {
          if (series) {
            list.push({
              _id: series._id || `series-${sIdx}`,
              isHero: false,
              isLegacy: false,
              image: series.coverImage,
              title: series.title || 'Untitled Series',
              location: series.location || '',
              year: series.year || '',
              seriesId: series._id
            })
          }
        })
      }
    }
    return list
  }, [coverData])

  const TOTAL = slides.length

  // ── Premium Transitions & Scroll animations ──
  useGSAP(() => {
    if (TOTAL < 2) return

    const slidesElements = slidesRef.current.filter(Boolean)
    if (!slidesElements.length) return

    const scroller = containerRef.current
    const wrapper  = scroller.querySelector('.slides-wrapper')

    // Stack slides via z-index
    gsap.set(slidesElements, { zIndex: (i) => slidesElements.length - i })

    // All slides except last start visible (clip reveals the slide beneath)
    gsap.set(slidesElements.slice(0, -1), { clipPath: 'inset(0 0 0 0)' })

    // Pre-set hidden states for all slides
    slidesElements.forEach((slideEl, i) => {
      const titleLines = slideEl.querySelectorAll('.title-line-inner')
      const fadeTexts = slideEl.querySelectorAll('.fade-text')
      
      gsap.set(titleLines, { y: '110%' })
      gsap.set(fadeTexts, { opacity: 0, y: 20, filter: 'blur(8px)' })
    })

    // Entrance animation for Slide 0 on initial page load (About Page style line reveal)
    const slide0 = slidesElements[0]
    if (slide0) {
      const titleLines0 = slide0.querySelectorAll('.title-line-inner')
      const fade0 = slide0.querySelectorAll('.fade-text')
      
      gsap.to(titleLines0, {
        y: '0%',
        duration: 1.4,
        stagger: 0.1,
        ease: 'power4.out',
        delay: 0.3
      })
      
      gsap.to(fade0, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power3.out',
        delay: 0.8
      })
    }

    // Build scroll timeline
    const tl = gsap.timeline()

    slidesElements.slice(0, -1).forEach((slideEl, i) => {
      const nextSlide = slidesElements[i + 1]
      const nextLines = nextSlide.querySelectorAll('.title-line-inner')
      const nextFadeTexts = nextSlide.querySelectorAll('.fade-text')

      // Clip current slide away
      tl.to(slideEl, {
        clipPath: 'inset(0 0 100% 0)',
        ease: 'none',
        duration: 1,
      }, i)

      // Majestic slide title lines slide-up reveal
      if (nextLines.length) {
        tl.to(nextLines, {
          y: '0%',
          duration: 1.2,
          stagger: 0.08,
          ease: 'power4.out',
        }, i + 0.35)
      }

      // Camera lens focus + fade for sub-headings, labels, and buttons
      if (nextFadeTexts.length) {
        tl.to(nextFadeTexts, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.06,
          ease: 'power3.out',
        }, i + 0.5)
      }

      // Counter animation
      if (counterRef.current) {
        tl.to(counterRef.current, {
          y: `-${(i + 1) * 1.4}rem`,
          ease: 'none',
          duration: 1,
        }, i)
      }
    })

    // Dot indicators matching scroll progress
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
          scroller.querySelectorAll('.dot').forEach((dot, di) => {
            dot.style.background = di === idx ? 'var(--accent-on-image)' : 'var(--muted-on-image)'
            dot.style.transform  = di === idx ? 'scale(1.6)' : 'scale(1)'
          })
        }
      }
    })

    ScrollTrigger.refresh()

  }, { scope: containerRef, dependencies: [slides], revertOnUpdate: true })

  // Keyboard navigation
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

  if (!slides.length) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '1rem', letterSpacing: '.2em'
    }}>
      NO FEATURED CONTENT YET — CONFIGURE IN SANITY STUDIO
    </div>
  )

  const fmt = n => n < 10 ? `0${n}` : `${n}`

  return (
    <div ref={containerRef} className="page-scroll" style={{ background: 'var(--dark)' }}>
      <div className="slides-wrapper" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {slides.map((slide, idx) => (
          <div
            key={slide._id}
            ref={el => slidesRef.current[idx] = el}
            style={{
              position: 'absolute', inset: 0, overflow: 'hidden'
            }}
          >
            {/* Background image */}
            {slide.image && (
              <div style={{
                position: 'absolute', top: '-10%', left: '-10%',
                width: '120%', height: '120%',
                backgroundImage: `url(${urlFor(slide.image).width(1920).quality(85).url()})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                willChange: 'transform'
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.65) 100%)'
                }}/>
              </div>
            )}

            {/* ── HERO SLIDE LAYOUT ── */}
            {slide.isHero && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2rem', textAlign: 'center', zIndex: 5
              }}>
                <h1 className="hero-title" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.5rem, 6.5vw, 4.8rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-.02em',
                  color: 'var(--text-on-image)',
                  maxWidth: '55rem',
                  textTransform: 'uppercase',
                  marginBottom: '1.2rem'
                }}>
                  {splitTitle(slide.title)}
                </h1>
                {slide.subtitle && (
                  <p className="fade-text" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: 'var(--text-on-image-muted)',
                    maxWidth: '38rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    {slide.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* ── FEATURED SERIES SLIDE LAYOUT ── */}
            {!slide.isHero && !slide.isLegacy && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2rem', textAlign: 'center', zIndex: 5
              }}>
                <h2 className="series-title" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.2rem, 5.5vw, 4.0rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-.02em',
                  color: 'var(--text-on-image)',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  display: 'block'
                }}>
                  {splitTitle(slide.title)}
                </h2>

                <div className="fade-text" style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--text-on-image-muted)',
                  marginBottom: '2rem'
                }}>
                  {slide.location}{slide.year ? ` — ${slide.year}` : ''}
                </div>

                {/* Discover More button */}
                <div className="fade-text">
                  <button
                    onClick={() => onDiscoverSeries && onDiscoverSeries(slide.seriesId)}
                    className="discover-btn"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--text-on-image)',
                      color: 'var(--text-on-image)',
                      padding: '0.8rem 2.2rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: '0px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.8rem'
                    }}
                  >
                    <span>DISCOVER MORE</span>
                    <span className="arrow" style={{ transition: 'transform 0.3s' }}>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── LEGACY SLIDE LAYOUT (FALLBACK) ── */}
            {slide.isLegacy && (
              <>
                {/* Meta top right */}
                <div className="fade-text" style={{
                  position: 'absolute', top: '9rem', right: '4rem',
                  zIndex: 5, textAlign: 'right'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.75rem',
                    letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent-on-image)',
                    marginBottom: '.5rem'
                  }}>{slide.location}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.7rem',
                    color: 'var(--text-on-image-muted)', letterSpacing: '.1em'
                  }}>{slide.year}</div>
                </div>

                {/* Content bottom left */}
                <div style={{
                  position: 'absolute', bottom: '7rem', left: '4rem',
                  maxWidth: '70%', zIndex: 5
                }}>
                  <div className="fade-text" style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.75rem',
                    letterSpacing: '.2em', textTransform: 'uppercase',
                    color: 'var(--accent-on-image)', marginBottom: '1.2rem'
                  }}>
                    {fmt(idx + 1)} — {slide.series}
                  </div>

                  <div style={{ overflow: 'hidden' }}>
                    <h2 className="legacy-title" style={{
                      display: 'block', fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)', lineHeight: '1.05',
                      fontWeight: 800, letterSpacing: '-.02em',
                      color: 'var(--text-on-image)'
                    }}>
                      {splitTitle(slide.title)}
                    </h2>
                  </div>

                  {slide.writeup && (
                    <div className="fade-text" style={{
                      marginTop: '1.8rem', maxWidth: '36rem',
                      fontFamily: 'var(--font-mono)', fontSize: '.8rem',
                      lineHeight: 1.7, color: 'var(--text-on-image-muted)', letterSpacing: '.03em'
                    }}>
                      {slide.writeup}
                    </div>
                  )}
                </div>
              </>
            )}
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
              {slides.map((_, i) => (
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
          {slides.map((_, i) => (
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
