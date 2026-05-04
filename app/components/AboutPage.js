'use client'
import { useEffect, useRef } from 'react'
import { urlFor } from '@/sanity/lib/image'

export default function AboutPage({ onNavigate, heroImage, collageImages = [] }) {
  const containerRef  = useRef(null)
  const initedRef     = useRef(false)
  const titleRef      = useRef(null)
  const lineRefs      = useRef([])

  useEffect(() => {
    if (initedRef.current) return
    initedRef.current = true

    async function init() {
      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const scroller = containerRef.current
      if (!scroller) return

      // ── HERO TITLE — line by line reveal ──
      const titleEl = titleRef.current
      if (titleEl) {
        const lines = titleEl.querySelectorAll('.hero-line-inner')
        gsap.set(lines, { y: '110%' })
        gsap.to(lines, {
          y: '0%', duration: 1.4, stagger: .12,
          ease: 'power4.out', delay: .3
        })
      }

      // ── HERO EYEBROW ──
      gsap.from('.hero-eyebrow', {
        opacity: 0, y: 20, duration: .9, ease: 'power3.out', delay: .2
      })

      // ── HERO BIO — word by word ──
      const bioEl = document.querySelector('.hero-bio')
      if (bioEl) {
        const words = bioEl.textContent.split(' ')
        bioEl.innerHTML = words.map(w =>
          `<span style="display:inline-block;margin-right:.28em;opacity:0">${w}</span>`
        ).join('')
        gsap.to(bioEl.querySelectorAll('span'), {
          opacity: 1, y: 0, duration: .5, stagger: .03, ease: 'power2.out',
          scrollTrigger: { trigger: bioEl, scroller, start: 'top 85%' }
        })
      }

      // ── HERO IMAGE PARALLAX ──
      gsap.to('.about-hero-img', {
        yPercent: 20, ease: 'none',
        scrollTrigger: {
          trigger: '.about-hero-section', scroller,
          start: 'top top', end: 'bottom top', scrub: true
        }
      })

      // ── HERO IMAGE REVEAL (clip) ──
      gsap.fromTo('.about-hero-img-wrap', {
        clipPath: 'inset(100% 0% 0% 0%)'
      }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut', delay: .5
      })

      // ── STATS COUNT UP ──
      gsap.utils.toArray('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.target)
        gsap.from({ val: 0 }, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate: function() { el.textContent = Math.round(this.targets()[0].val) },
          scrollTrigger: { trigger: el, scroller, start: 'top 85%' }
        })
      })

      // ── QUOTE — word reveal ──
      const quoteEl = document.querySelector('.philosophy-quote')
      if (quoteEl) {
        gsap.from(quoteEl, {
          opacity: 0, y: 60, duration: 1.3, ease: 'power4.out',
          scrollTrigger: { trigger: '.philosophy-section', scroller, start: 'top 70%' }
        })
      }

      // ── DIVIDER LINE DRAW ──
      gsap.utils.toArray('.divider-line').forEach(el => {
        gsap.from(el, {
          scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, scroller, start: 'top 85%' }
        })
      })

      // ── APPROACH ITEMS — stagger up ──
      gsap.utils.toArray('.approach-item').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, y: 50, duration: 1, ease: 'power3.out', delay: i * .15,
          scrollTrigger: { trigger: '.approach-grid', scroller, start: 'top 75%' }
        })
      })

      // ── APPROACH NUMBERS SCRUB ──
      gsap.utils.toArray('.approach-num').forEach((num, i) => {
        gsap.from(num, {
          x: -30, opacity: 0, duration: .8, ease: 'power3.out', delay: i * .15,
          scrollTrigger: { trigger: '.approach-grid', scroller, start: 'top 75%' }
        })
      })

      // ── PHOTO COLLAGE REVEAL ──
      gsap.utils.toArray('.collage-img').forEach((img, i) => {
        gsap.fromTo(img,
          { opacity: 0, y: 60 + i * 20, scale: .96 },
          {
            opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out',
            delay: i * .18,
            scrollTrigger: { trigger: '.collage-section', scroller, start: 'top 75%' }
          }
        )
      })

      // ── CTA TITLE ──
      const ctaTitle = document.querySelector('.cta-title')
      if (ctaTitle) {
        const words = ctaTitle.textContent.split(' ')
        ctaTitle.innerHTML = words.map(w =>
          `<span style="display:inline-block;overflow:hidden;margin-right:.3em">
            <span class="cta-word" style="display:inline-block;transform:translateY(110%)">${w}</span>
          </span>`
        ).join('')
        gsap.to(ctaTitle.querySelectorAll('.cta-word'), {
          y: '0%', duration: 1.1, stagger: .1, ease: 'power4.out',
          scrollTrigger: { trigger: '.cta-section', scroller, start: 'top 80%' }
        })
      }

      // ── CTA BUTTONS ──
      gsap.from('.cta-btn-wrap', {
        opacity: 0, y: 30, duration: .9, ease: 'power3.out', delay: .4,
        scrollTrigger: { trigger: '.cta-section', scroller, start: 'top 75%' }
      })

      // ── SECTION LABELS SLIDE ──
      gsap.utils.toArray('.section-label-about').forEach(el => {
        gsap.from(el, {
          x: -40, opacity: 0, duration: .9, ease: 'power3.out',
          scrollTrigger: { trigger: el, scroller, start: 'top 88%' }
        })
      })

      ScrollTrigger.refresh()
    }

    init()

    return () => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach(t => t.kill())
      })
    }
  }, [])

  // magnetic button handler
  function onBtnMove(e, el) {
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width  / 2) * .3
    const y = (e.clientY - r.top  - r.height / 2) * .3
    el.style.transform = `translate(${x}px,${y}px)`
  }
  function onBtnLeave(el) {
    el.style.transform = 'translate(0,0)'
    el.style.transition = 'transform .5s cubic-bezier(.25,1,.5,1)'
  }

  const defaultHeroUrl = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85'
  const heroUrl = heroImage
    ? urlFor(heroImage).width(1200).quality(85).url()
    : defaultHeroUrl

  const collageLayout = [
    { h: '60rem' },
    { h: '36rem' },
    { h: '36rem', mt: '8rem' }
  ]
  const collageFallbacks = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=82',
    'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=900&q=82',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=82'
  ]
  const collageList = collageLayout.map((layout, i) => {
    const img = collageImages[i]
    return {
      ...layout,
      url: img ? urlFor(img).width(900).quality(82).url() : collageFallbacks[i]
    }
  })

  return (
    <div ref={containerRef} className="page-scroll" style={{ background: 'var(--dark)' }}>

      {/* ══ HERO ══ */}
      <div className="about-hero-section" style={{
        height: '100vh', display: 'grid',
        gridTemplateColumns: '55% 45%',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* left */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 5rem 7rem 4rem', position: 'relative', zIndex: 2
        }}>
          <div className="hero-eyebrow" style={{
            fontFamily: 'var(--font-mono)', fontSize: '.75rem', letterSpacing: '.35em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '3rem'
          }}>Based in Phnom Penh, Cambodia</div>

          <div ref={titleRef} style={{ marginBottom: '3.5rem' }}>
            {['Street.', 'Light.', 'Story.'].map((line, i) => (
              <div key={i} style={{ overflow: 'hidden', lineHeight: .88 }}>
                <div className="hero-line-inner" style={{
                  fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                  fontSize: 'clamp(5rem,8vw,7rem)', letterSpacing: '-.03em',
                  color: 'var(--cream)', display: 'block'
                }}>{line}</div>
              </div>
            ))}
          </div>

          <p className="hero-bio" style={{
            fontFamily: 'var(--font-mono)', fontSize: '.85rem',
            lineHeight: 1.9, color: 'var(--muted)', maxWidth: '40rem'
          }}>
            WRD Photography is a personal archive of Cambodia — its streets, its people,
            its countryside. Shot with intention, not algorithm. The work lives here because
            Instagram doesn't do the images justice — and this photographer knows it.
          </p>
        </div>

        {/* right — image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to right, var(--dark) 0%, transparent 25%)'
          }}/>
          <div className="about-hero-img-wrap" style={{
            position: 'absolute', inset: 0, overflow: 'hidden'
          }}>
            <div className="about-hero-img" style={{
              position: 'absolute', top: '-15%', left: 0,
              width: '100%', height: '130%',
              background: `url(${heroUrl}) center/cover no-repeat`
            }}/>
          </div>
        </div>
      </div>

      {/* ══ PHILOSOPHY ══ */}
      <div className="philosophy-section" style={{
        padding: '10rem 4rem', display: 'grid',
        gridTemplateColumns: '1fr 2fr', gap: '8rem', alignItems: 'start'
      }}>
        <div>
          <div className="section-label-about" style={{
            fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '.25em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '2rem'
          }}>— Philosophy</div>
          <div className="divider-line" style={{
            width: '4rem', height: 1, background: 'var(--accent)'
          }}/>
        </div>
        <blockquote className="philosophy-quote" style={{
          fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
          fontSize: 'clamp(2.5rem,4vw,3.8rem)', lineHeight: 1.15,
          letterSpacing: '-.02em', color: 'var(--cream)'
        }}>
          "The streets of Phnom Penh give freely to those who slow down.
          Every frame is an act of{' '}
          <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>attention</em>
          {' '}— to light, to a moment, to a face that will never hold still again."
        </blockquote>
      </div>

      {/* ══ PHOTO COLLAGE ══ */}
      <div className="collage-section" style={{
        padding: '0 4rem 10rem',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
        gap: '1.6rem', alignItems: 'start'
      }}>
        {collageList.map((img, i) => (
          <div key={i} className="collage-img" style={{
            overflow: 'hidden', marginTop: img.mt || 0
          }}>
            <img
              src={img.url}
              alt="WRD Photography"
              style={{
                width: '100%', height: img.h, objectFit: 'cover', display: 'block'
              }}
            />
          </div>
        ))}
      </div>

      {/* ══ APPROACH ══ */}
      <div style={{ padding: '8rem 4rem', background: 'var(--mid)' }}>
        <div style={{ marginBottom: '6rem', display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
            fontSize: 'clamp(3rem,5vw,4.5rem)', letterSpacing: '-.02em', whiteSpace: 'nowrap'
          }}>The Approach</h2>
          <div className="divider-line" style={{
            flex: 1, height: 1, background: 'var(--border-strong)'
          }}/>
        </div>

        <div className="approach-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '5rem'
        }}>
          {[
            {
              num: '01',
              title: 'Street & Urban',
              body: 'Phnom Penh is a city in perpetual motion. The work focuses on the unrepeatable moments — light on a tuk-tuk, a vendor\'s silhouette, the geometry of colonial architecture against a monsoon sky.'
            },
            {
              num: '02',
              title: 'Rural Cambodia',
              body: 'Beyond the capital, Cambodia opens into something vast and unhurried. Rice paddies, river villages, highland mist — a country that is easy to miss if you never leave the city.'
            },
            {
              num: '03',
              title: 'Write-ups & Context',
              body: 'Each image carries a note — where, when, what was felt. Photography without context is decoration. The writing here is brief but deliberate, meant to place you inside the frame.'
            }
          ].map((item, i) => (
            <div key={item.num} className="approach-item" style={{ position: 'relative' }}>
              <div className="approach-num" style={{
                fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                fontSize: '6rem', lineHeight: 1, color: 'var(--text-faint)',
                position: 'absolute', top: '-2rem', left: '-1rem',
                letterSpacing: '-.03em', pointerEvents: 'none'
              }}>{item.num}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                color: 'var(--accent)', letterSpacing: '.2em',
                textTransform: 'uppercase', marginBottom: '1.5rem'
              }}>{item.num} —</div>
              <h3 style={{
                fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                fontSize: '2.2rem', marginBottom: '1.5rem', letterSpacing: '-.01em'
              }}>{item.title}</h3>
              <div className="divider-line" style={{
                width: '2.5rem', height: 1, background: 'var(--accent)', marginBottom: '1.5rem'
              }}/>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '.8rem',
                lineHeight: 1.9, color: 'var(--muted)'
              }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CTA ══ */}
      <div className="cta-section" style={{
        padding: '12rem 4rem',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center'
      }}>
        <div className="section-label-about" style={{
          fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '.3em',
          textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '3rem'
        }}>— Get in touch</div>

        <h2 className="cta-title" style={{
          fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
          fontSize: 'clamp(3.5rem,7vw,6rem)', lineHeight: .9,
          letterSpacing: '-.03em', marginBottom: '3rem', color: 'var(--cream)'
        }}>Let's Work Together</h2>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '.85rem', color: 'var(--muted)',
          lineHeight: 1.9, maxWidth: '44rem', marginBottom: '5rem'
        }}>
          Available for editorial commissions, documentary projects, and prints.
          Based in Phnom Penh — traveling throughout Cambodia and Southeast Asia.
        </p>

        <div className="cta-btn-wrap" style={{ display: 'flex', gap: '2rem' }}>
          <a
            href="mailto:hello@wrdphoto.com"
            onMouseMove={e => onBtnMove(e, e.currentTarget)}
            onMouseLeave={e => onBtnLeave(e.currentTarget)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.8rem', letterSpacing: '.2em',
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '1.6rem 3.5rem', background: 'var(--accent)',
              border: '1px solid var(--accent)', color: 'var(--dark)',
              cursor: 'none', display: 'inline-block',
              transition: 'background .3s, color .3s, transform .5s cubic-bezier(.25,1,.5,1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--accent)'
            }}
          >Get in Touch</a>

          <button
            onClick={() => onNavigate('gallery')}
            onMouseMove={e => onBtnMove(e, e.currentTarget)}
            onMouseLeave={e => onBtnLeave(e.currentTarget)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.8rem', letterSpacing: '.2em',
              textTransform: 'uppercase', padding: '1.6rem 3.5rem',
              background: 'transparent', border: '1px solid var(--border-strong)',
              color: 'var(--cream)', cursor: 'none',
              transition: 'border-color .3s, transform .5s cubic-bezier(.25,1,.5,1)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cream)'}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              onBtnLeave(e.currentTarget)
            }}
          >View Gallery</button>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <div style={{
        padding: '2.5rem 4rem', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '1rem',
          letterSpacing: '.2em', color: 'var(--cream)'
        }}>WRD Photography</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)'
        }}>© 2026 — All rights reserved</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Instagram', 'Facebook'].map(s => (
            <a key={s} href="#" style={{
              fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '.15em',
              textTransform: 'uppercase', color: 'var(--muted)',
              textDecoration: 'none', cursor: 'none',
              transition: 'color .25s'
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >{s}</a>
          ))}
        </div>
      </div>

    </div>
  )
}