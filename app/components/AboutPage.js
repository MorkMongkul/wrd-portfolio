'use client'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { urlFor } from '@/sanity/lib/image'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function AboutPage({ onNavigate, aboutData }) {
  const containerRef = useRef(null)
  const titleRef = useRef(null)

  const {
    heroImage,
    heading,
    bio,
    ctaTitle,
    ctaDescription,
    email,
    phone,
    instagramUrl,
    facebookUrl,
    linkedinUrl,
    telegramUrl
  } = aboutData || {}

  const headingLines = (heading && heading.length > 0)
    ? heading
    : ['Street.', 'Light.', 'Story.']

  const bioText = bio || "WRD Photography is a personal archive of Cambodia — its streets, its people, its countryside. Shot with intention, not algorithm. The work lives here because Instagram doesn't do the images justice — and this photographer knows it."

  const ctaTitleText = ctaTitle || "Let's Work Together"

  const ctaDescriptionText = ctaDescription || "Available for editorial commissions, documentary projects, and prints. Based in Phnom Penh — traveling throughout Cambodia and Southeast Asia."

  const emailVal = email || "hello@wrdphoto.com"
  const phoneVal = phone || "+855 (0) 12 345 678"

  const socialInstagram = instagramUrl || "https://instagram.com"
  const socialFacebook = facebookUrl || "https://facebook.com"
  const socialLinkedin = linkedinUrl || "https://linkedin.com"
  const socialTelegram = telegramUrl || "https://t.me"

  // Helper to split text into word spans for reveal animations
  const splitWords = (text) => {
    if (!text) return null
    return text.split(' ').map((word, idx) => (
      <span
        key={idx}
        className="word-span"
        style={{
          display: 'inline-block',
          marginRight: '0.28em',
          opacity: 0,
          transform: 'translateY(12px)',
          willChange: 'transform, opacity'
        }}
      >
        {word}
      </span>
    ))
  }

  // Helper to split title into words nested in hidden containers for slide-up reveal
  const splitTitle = (titleText) => {
    if (!titleText) return null
    return titleText.split(' ').map((word, index) => (
      <span key={index} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.3em', lineHeight: '1.15', paddingBottom: '0.25em', marginBottom: '-0.25em' }}>
        <span className="cta-word" style={{ display: 'inline-block', transform: 'translateY(110%)', willChange: 'transform' }}>
          {word}
        </span>
      </span>
    ))
  }

  useGSAP(() => {
    const scroller = containerRef.current
    if (!scroller) return

    // ── HERO TITLE — line by line reveal ──
    const titleEl = titleRef.current
    if (titleEl) {
      const lines = titleEl.querySelectorAll('.hero-line-inner')
      gsap.to(lines, {
        y: '0%', duration: 1.4, stagger: .12,
        ease: 'power4.out', delay: .3
      })
    }

    // ── HERO BIO — word by word ──
    const heroBioSpans = scroller.querySelectorAll('.hero-bio .word-span')
    if (heroBioSpans.length > 0) {
      gsap.to(heroBioSpans, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.02,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.hero-bio',
          scroller,
          start: 'top 85%'
        }
      })
    }

    // ── HERO IMAGE PARALLAX ──
    gsap.to('.about-hero-img', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-hero-section',
        scroller,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    })

    // ── HERO IMAGE REVEAL (clip) ──
    gsap.fromTo('.about-hero-img-wrap', {
      clipPath: 'inset(100% 0% 0% 0%)'
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.4,
      ease: 'power4.inOut',
      delay: 0.5
    })

    // ── CTA TIMELINE ──
    const ctaTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.cta-section',
        scroller,
        start: 'top 80%'
      }
    })

    // CTA Title slide up
    const ctaWords = scroller.querySelectorAll('.cta-title .cta-word')
    if (ctaWords.length > 0) {
      ctaTl.to(ctaWords, {
        y: '0%',
        duration: 1.1,
        stagger: 0.08,
        ease: 'power4.out'
      }, 0)
    }

    // CTA Bio / Description (word-by-word reveal)
    const ctaBioSpans = scroller.querySelectorAll('.cta-bio .word-span')
    if (ctaBioSpans.length > 0) {
      ctaTl.to(ctaBioSpans, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.015,
        ease: 'power2.out'
      }, 0.2)
    }

    // CTA Column Headers (Contact, Social Link)
    const ctaHeaders = scroller.querySelectorAll('.cta-col-header')
    if (ctaHeaders.length > 0) {
      ctaTl.to(ctaHeaders, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      }, 0.4)
    }

    // CTA Items (Email, Phone, individual Social icons)
    const ctaItems = scroller.querySelectorAll('.cta-item')
    if (ctaItems.length > 0) {
      ctaTl.to(ctaItems, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out'
      }, 0.5)
    }

    ScrollTrigger.refresh()
  }, { scope: containerRef })

  const defaultHeroUrl = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85'
  const heroUrl = heroImage
    ? urlFor(heroImage).width(1200).quality(85).url()
    : defaultHeroUrl

  return (
    <div ref={containerRef} className="page-scroll" style={{ background: 'var(--dark)' }}>

      {/* ══ HERO ══ */}
      <div className="about-hero-section" style={{
        height: '100vh', display: 'grid',
        gridTemplateColumns: '48% 52%',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* left */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '4rem 3rem 0 4rem', position: 'relative', zIndex: 2
        }}>
          <div ref={titleRef} style={{ marginBottom: '3.5rem' }}>
            {headingLines.map((line, i) => (
              <div key={i} style={{
                overflow: 'hidden',
                lineHeight: 1.15,
                fontSize: 'clamp(2.8rem, 4.5vw, 4.2rem)',
                paddingBottom: '0.25em',
                marginBottom: '-0.25em'
              }}>
                <div className="hero-line-inner" style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(2.8rem, 4.5vw, 4.2rem)', letterSpacing: '-.02em',
                  color: 'var(--cream)', display: 'block',
                  transform: 'translateY(110%)', willChange: 'transform'
                }}>{line}</div>
              </div>
            ))}
          </div>

          <p className="hero-bio" style={{
            fontFamily: 'var(--font-mono)', fontSize: '1.2rem',
            lineHeight: 1.8, color: 'var(--text)', maxWidth: '40rem'
          }}>
            {splitWords(bioText)}
          </p>
        </div>

        {/* right — image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="about-hero-img-wrap" style={{
            position: 'absolute', inset: 0, overflow: 'hidden'
          }}>
            <div className="about-hero-img" style={{
              position: 'absolute', top: '-10%', left: 0,
              width: '100%', height: '110%',
              background: `url(${heroUrl}) center bottom/cover no-repeat`
            }}/>
          </div>
          {/* Left fade and blur to blend the vertical edge into the text column */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: -2,
            width: '80px',
            height: '100%',
            zIndex: 10,
            background: 'linear-gradient(to right, var(--dark) 15%, var(--dark-transparent) 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
            pointerEvents: 'none'
          }}/>
        </div>
      </div>


      {/* ══ CTA ══ */}
      <div className="cta-section" style={{
        padding: '12rem 4rem',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center'
      }}>
        <h2 className="cta-title" style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(2.8rem, 4.5vw, 4.2rem)', lineHeight: 1.15,
          letterSpacing: '-.02em', marginBottom: '3rem', color: 'var(--cream)'
        }}>
          {splitTitle(ctaTitleText)}
        </h2>

        <p className="cta-bio" style={{
          fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text)',
          lineHeight: 1.8, maxWidth: '44rem', marginBottom: '3rem'
        }}>
          {splitWords(ctaDescriptionText)}
        </p>

        <div className="cta-contact-wrapper" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '44rem',
          width: '100%'
        }}>
          {/* Contact Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
            <div
              className="cta-col-header"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '.75rem',
                letterSpacing: '.25em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '.8rem',
                fontWeight: 500,
                opacity: 0,
                transform: 'translateY(20px)',
                filter: 'blur(4px)',
                willChange: 'transform, opacity, filter',
                width: '100%',
                maxWidth: '220px',
                textAlign: 'center'
              }}
            >
              Contact
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              <div
                className="cta-item"
                style={{
                  opacity: 0,
                  transform: 'translateY(25px)',
                  filter: 'blur(6px)',
                  willChange: 'transform, opacity, filter',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.25rem' }}>Email</div>
                <a
                  href={`mailto:${emailVal}`}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.2rem',
                    color: 'var(--cream)',
                    textDecoration: 'none',
                    transition: 'color .3s',
                    cursor: 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--cream)'}
                >{emailVal}</a>
              </div>
              <div
                className="cta-item"
                style={{
                  opacity: 0,
                  transform: 'translateY(25px)',
                  filter: 'blur(6px)',
                  willChange: 'transform, opacity, filter',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.25rem' }}>Phone</div>
                <a
                  href={`tel:${phoneVal.trim()}`}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.2rem',
                    color: 'var(--cream)',
                    textDecoration: 'none',
                    transition: 'color .3s',
                    cursor: 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--cream)'}
                >{phoneVal}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <div style={{
        padding: '2.5rem 4rem', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1.5rem'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '1rem',
          letterSpacing: '.2em', color: 'var(--cream)'
        }}>WRD Photography</div>

        {/* Centered Social links */}
        <div style={{
          display: 'flex',
          gap: '1.8rem',
          alignItems: 'center'
        }}>
          {[
            {
              name: 'Instagram',
              url: socialInstagram,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              )
            },
            {
              name: 'Facebook',
              url: socialFacebook,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              )
            },
            {
              name: 'LinkedIn',
              url: socialLinkedin,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              )
            },
            {
              name: 'Telegram',
              url: socialTelegram,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              )
            }
          ].map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              style={{
                color: 'var(--cream)',
                transition: 'color .3s, transform .3s cubic-bezier(.25,1,.5,1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--cream)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {s.icon}
            </a>
          ))}
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)'
        }}>© 2026 — All rights reserved</div>
      </div>

    </div>
  )
}