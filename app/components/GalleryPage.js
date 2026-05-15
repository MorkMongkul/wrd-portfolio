'use client'
import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { urlFor } from '@/sanity/lib/image'
import Lightbox from './Lightbox'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function GalleryPage({ photos, heroImage }) {
  const containerRef  = useRef(null)
  const heroTitleRef  = useRef(null)
  const heroEyeRef    = useRef(null)
  const trackRef      = useRef(null)
  const gsapCtxRef    = useRef(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [hoveredCard, setHoveredCard]   = useState(null)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [lightboxList, setLightboxList]   = useState([])

  function openLightbox(photo, list) {
    setLightboxList(list)
    setLightboxPhoto(photo)
  }

  function closeLightbox() {
    setLightboxPhoto(null)
    setLightboxList([])
  }

  function lightboxPrev() {
    const idx = lightboxList.findIndex(p => p._id === lightboxPhoto._id)
    const prev = lightboxList[idx > 0 ? idx - 1 : lightboxList.length - 1]
    setLightboxPhoto(prev)
  }

  function lightboxNext() {
    const idx = lightboxList.findIndex(p => p._id === lightboxPhoto._id)
    const next = lightboxList[idx < lightboxList.length - 1 ? idx + 1 : 0]
    setLightboxPhoto(next)
  }

  function lightboxGoTo(photo) {
    setLightboxPhoto(photo)
  }

  const street    = photos.filter(p => p.series === 'street')
  const streetHoriz   = street.slice(0, 6)
  const streetMasonry = street.slice(6)
  const rural     = photos.filter(p => p.series === 'rural')
  const landscape = photos.filter(p => p.series === 'landscape')
  const portraits = photos.filter(p => p.series === 'portraits')
  const all       = photos

  const { context } = useGSAP(() => {
      const scroller = containerRef.current
      if (!scroller) return

      // ── HERO TEXT LINE REVEAL ──
      const heroTitle = heroTitleRef.current
      if (heroTitle) {
        const lines = heroTitle.querySelectorAll('.hero-line-inner')
        gsap.from(lines, {
          y: '110%', duration: 1.4, stagger: .15,
          ease: 'power4.out', delay: .6,
          scrollTrigger: { trigger: '.gallery-hero', scroller, start: 'top 90%' }
        })
      }

      // hero eyebrow fade
      if (heroEyeRef.current) {
        gsap.from(heroEyeRef.current, {
          opacity: 0, y: 20, duration: .8, delay: .4, ease: 'power3.out',
          scrollTrigger: { trigger: '.gallery-hero', scroller, start: 'top 90%' }
        })
      }

      // ── HERO PARALLAX BG ──
      gsap.to('.g-hero-bg', {
        yPercent: 35, ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-hero', scroller,
          start: 'top top', end: 'bottom top', scrub: true
        }
      })

      // ── HERO OVERLAY SCRUB ──
      gsap.to('.g-hero-overlay', {
        opacity: .9, ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-hero', scroller,
          start: 'top top', end: 'bottom top', scrub: true
        }
      })

      // ── SECTION LABEL SLIDE IN ──
      gsap.utils.toArray('.section-label').forEach(el => {
        gsap.from(el, {
          x: -60, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, scroller, start: 'top 85%' }
        })
      })

      // ── HORIZONTAL SCROLL TRACK ──
      const track = trackRef.current
      if (track && streetHoriz.length > 0) {
        const trackWrap = track.parentElement
        const getX = () => -(track.scrollWidth - trackWrap.offsetWidth - 80)

        gsap.to(track, {
          x: getX,
          ease: 'none',
          scrollTrigger: {
            trigger: '#street-horiz',
            scroller,
            start: 'top 8%',
            end: () => '+=' + (track.scrollWidth - trackWrap.offsetWidth + 200),
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        })

        // cards tilt on scroll within horizontal
        gsap.utils.toArray('.horiz-card').forEach((card, i) => {
          gsap.from(card, {
            opacity: 0, y: i % 2 === 0 ? 80 : -80, duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#street-horiz', scroller,
              start: 'top 50%', toggleActions: 'play none none none'
            },
            delay: i * 0.1
          })
        })
      }

      // ── MASONRY STAGGER REVEAL ──
      gsap.utils.toArray('.masonry-item').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, y: 80, scale: .97, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: item, scroller, start: 'top 90%',
            toggleActions: 'play none none none'
          },
          delay: (i % 3) * 0.12
        })
      })

      // ── MASONRY HEADER WORDS ──
      gsap.utils.toArray(scroller.querySelectorAll('.masonry-title-text')).forEach(mHeader => {
        const words = mHeader.querySelectorAll('.word-inner')
        if (!words.length) return
        gsap.from(words, {
          y: '110%', duration: 1.1, stagger: .08, ease: 'power4.out',
          scrollTrigger: { trigger: mHeader, scroller, start: 'top 85%' }
        })
      })

      // ── PORTRAITS — PINNED TEXT + IMAGE SCROLL ──
      if (portraits.length > 0) {
        gsap.from('.portraits-title', {
          opacity: 0, x: -50, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.portraits-section', scroller, start: 'top 75%' }
        })
        gsap.utils.toArray('.portrait-card').forEach((card, i) => {
          gsap.from(card, {
            opacity: 0, y: 60, duration: .9, ease: 'power3.out',
            scrollTrigger: { trigger: card, scroller, start: 'top 88%' },
            delay: i * 0.1
          })
        })
      }

      // ── COUNTER SCRUB ──
      const counter = scroller.querySelector('.photo-counter')
      if (counter) {
        gsap.to(counter, {
          opacity: 0, y: -20, ease: 'none',
          scrollTrigger: {
            trigger: '.gallery-hero', scroller,
            start: 'bottom 80%', end: 'bottom 50%', scrub: true
          }
        })
      }

      ScrollTrigger.refresh()

  }, { scope: containerRef, dependencies: [photos, activeFilter], revertOnUpdate: true })

  // keep ref in sync so click handlers can revert before React unmounts
  gsapCtxRef.current = context

  // ── MAGNETIC FILTER BUTTONS ──
  function handleFilterMouse(e, btn) {
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top  - rect.height / 2
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`
  }
  function handleFilterLeave(e, btn) {
    btn.style.transform = 'translate(0,0)'
    btn.style.transition = 'transform .4s cubic-bezier(.25,1,.5,1)'
  }

  const fmt = n => n < 10 ? `0${n}` : `${n}`

  return (
    <div ref={containerRef} className="page-scroll" style={{ background: 'var(--dark)' }}>

      {/* ══ HERO ══ */}
      <div className="gallery-hero" style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '0 4rem 6rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* bg */}
        <div className="g-hero-bg" style={{
          position: 'absolute', top: '-15%', left: '-5%',
          width: '110%', height: '130%',
          backgroundImage: heroImage
            ? `url(${urlFor(heroImage).width(1800).quality(85).url()})`
            : all[0]
            ? `url(${urlFor(all[0].image).width(1800).quality(85).url()})`
            : 'linear-gradient(135deg, var(--mid), var(--dark))',
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}/>
        {/* overlay */}
        <div className="g-hero-overlay" style={{
          position: 'absolute', inset: 0, opacity: .55,
          background: 'linear-gradient(to top, rgba(0,0,0,.95) 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.2) 100%)'
        }}/>

        {/* photo count */}
        <div className="photo-counter" style={{
          position: 'absolute', top: '9rem', right: '4rem',
          fontFamily: 'var(--font-mono)', fontSize: '.7rem',
          letterSpacing: '.2em', color: 'var(--muted-on-image)', textAlign: 'right'
        }}>
          <div style={{ fontSize: '3rem', color: 'var(--text-on-image)', lineHeight: 1, marginBottom: '.4rem' }}>
            {fmt(all.length)}
          </div>
          photographs
        </div>

        {/* text */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div ref={heroEyeRef} style={{
            fontFamily: 'var(--font-mono)', fontSize: '.75rem', letterSpacing: '.35em',
            textTransform: 'uppercase', color: 'var(--accent-on-image)', marginBottom: '2rem'
          }}>Cambodia — 2023 / 2025</div>

          <h1 ref={heroTitleRef} style={{
            fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
            fontSize: 'clamp(4rem,9vw,8rem)', lineHeight: .88,
            letterSpacing: '-.03em', color: 'var(--text-on-image)'
          }}>
            {['The Full', 'Archive'].map((line, i) => (
              <div key={i} style={{ overflow: 'hidden', display: 'block' }}>
                <div className="hero-line-inner" style={{ display: 'block' }}>{line}</div>
              </div>
            ))}
          </h1>
        </div>

        {/* scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '3rem', left: '50%',
          transform: 'translateX(-50%)', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.8rem'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '.65rem',
            letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted-on-image)'
          }}>scroll to explore</div>
          <div style={{
            width: 1, height: '4rem', background: 'var(--accent)',
            animation: 'scrollPulse 1.8s ease-in-out infinite'
          }}/>
        </div>
      </div>

      {/* ══ FILTER BAR ══ */}
      <div style={{
        padding: '5rem 4rem 3rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '.7rem',
          letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)'
        }}>Filter by series</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { id: 'all',       label: `All (${all.length})` },
            { id: 'street',    label: `Street (${street.length})` },
            { id: 'rural',     label: `Rural (${rural.length})` },
            { id: 'landscape', label: `Landscape (${landscape.length})` },
            { id: 'portraits', label: `Portraits (${portraits.length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                gsapCtxRef.current?.revert()
                setActiveFilter(f.id)
              }}
              onMouseMove={e => handleFilterMouse(e, e.currentTarget)}
              onMouseLeave={e => handleFilterLeave(e, e.currentTarget)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '.75rem',
                letterSpacing: '.15em', textTransform: 'uppercase',
                padding: '.8rem 2rem', cursor: 'none',
                background: activeFilter === f.id ? 'var(--accent)' : 'transparent',
                color: activeFilter === f.id ? 'var(--dark)' : 'var(--muted)',
                border: `1px solid ${activeFilter === f.id ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'background .3s, color .3s, border-color .3s',
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* ══ HORIZONTAL SCROLL — Street (first 6) ══ */}
      {streetHoriz.length > 0 && (activeFilter === 'all' || activeFilter === 'street') && (
        <div id="street-horiz" style={{ padding: '3rem 0 2rem', position: 'relative' }}>
          <div className="section-label" style={{
            padding: '0 4rem', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '2rem'
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '.7rem',
              letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)'
            }}>01 — Street Series / Phnom Penh</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '.65rem',
              color: 'var(--muted)', letterSpacing: '.1em'
            }}>drag to explore →</span>
          </div>

          <div style={{ overflow: 'hidden' }}>
            <div ref={trackRef} style={{
              display: 'flex', gap: '2rem', padding: '0 4rem',
              width: 'max-content', alignItems: 'flex-end'
            }}>
              {streetHoriz.map((photo, i) => (
                <div
                  key={photo._id}
                  className="horiz-card"
                  onClick={() => openLightbox(photo, street)}
                  onMouseEnter={() => setHoveredCard(photo._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: 'relative', overflow: 'hidden', flexShrink: 0,
                    width: i % 3 === 0 ? '42rem' : i % 3 === 1 ? '30rem' : '36rem',
                    height: i % 3 === 0 ? '65vh' : i % 3 === 1 ? '50vh' : '58vh',
                    cursor: 'none'
                  }}
                >
                  <img
                    src={urlFor(photo.image).width(1000).quality(82).url()}
                    alt={photo.title}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transform: hoveredCard === photo._id ? 'scale(1.06)' : 'scale(1)',
                      transition: 'transform .7s cubic-bezier(.25,1,.5,1)'
                    }}
                  />
                  {/* hover overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: hoveredCard === photo._id
                      ? 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 60%, transparent 100%)'
                      : 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)',
                    transition: 'background .5s ease'
                  }}/>
                  {/* card info */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '3rem 2.5rem 2.5rem',
                    transform: hoveredCard === photo._id ? 'translateY(0)' : 'translateY(12px)',
                    opacity: hoveredCard === photo._id ? 1 : .7,
                    transition: 'transform .45s cubic-bezier(.25,1,.5,1), opacity .45s'
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      letterSpacing: '.2em', textTransform: 'uppercase',
                      color: 'var(--accent-on-image)', marginBottom: '.8rem'
                    }}>{photo.location}</div>
                    <div style={{
                      fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                      fontSize: '2.4rem', color: 'var(--text-on-image)', lineHeight: 1,
                      marginBottom: '.8rem'
                    }}>{photo.title}</div>
                    {photo.writeup && hoveredCard === photo._id && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '.72rem',
                        lineHeight: 1.7, color: 'var(--text-on-image-muted)',
                        maxWidth: '32rem',
                        opacity: hoveredCard === photo._id ? 1 : 0,
                        transition: 'opacity .3s .1s'
                      }}>{photo.writeup}</div>
                    )}
                  </div>

                  {/* index number */}
                  <div style={{
                    position: 'absolute', top: '2rem', right: '2rem',
                    fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                    letterSpacing: '.15em', color: 'var(--muted-on-image)'
                  }}>{fmt(i + 1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ MASONRY — Street (remaining) ══ */}
      {streetMasonry.length > 0 && (activeFilter === 'all' || activeFilter === 'street') && (
        <div style={{ padding: '4rem 4rem 8rem' }}>
          <div style={{ columns: 3, columnGap: '1.6rem' }}>
            {streetMasonry.map((photo, i) => (
              <div
                key={photo._id}
                className="masonry-item"
                onClick={() => openLightbox(photo, street)}
                onMouseEnter={() => setHoveredCard(photo._id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  breakInside: 'avoid', marginBottom: '1.6rem',
                  position: 'relative', overflow: 'hidden', cursor: 'none'
                }}
              >
                <img
                  src={urlFor(photo.image).width(800).quality(82).url()}
                  alt={photo.title}
                  style={{
                    width: '100%', display: 'block',
                    transform: hoveredCard === photo._id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform .7s cubic-bezier(.25,1,.5,1)'
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: hoveredCard === photo._id
                    ? 'rgba(0,0,0,.62)'
                    : 'rgba(0,0,0,0)',
                  transition: 'background .4s',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '2rem'
                }}>
                  <div style={{
                    transform: hoveredCard === photo._id ? 'translateY(0)' : 'translateY(16px)',
                    opacity: hoveredCard === photo._id ? 1 : 0,
                    transition: 'transform .35s ease, opacity .35s ease'
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                      fontSize: '1.8rem', color: 'var(--text-on-image)', marginBottom: '.4rem'
                    }}>{photo.title}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent-on-image)'
                    }}>{photo.location}</div>
                    {photo.writeup && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '.72rem',
                        lineHeight: 1.6, color: 'var(--text-on-image-muted)',
                        marginTop: '.8rem'
                      }}>{photo.writeup}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ MASONRY — Rural ══ */}
      {rural.length > 0 && (activeFilter === 'all' || activeFilter === 'rural') && (
        <div style={{ padding: '8rem 4rem' }}>
          {/* header */}
          <div style={{
            marginBottom: '6rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem',
            alignItems: 'end'
          }}>
            <h2 className="masonry-title-text" style={{
              fontFamily: 'var(--font-garamond)', fontSize: 'clamp(3.5rem,6vw,5.5rem)',
              fontStyle: 'italic', lineHeight: .9, letterSpacing: '-.02em'
            }}>
              {'Rural Cambodia'.split(' ').map((word, i) => (
                <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '.25em' }}>
                  <span className="word-inner" style={{ display: 'inline-block' }}>{word}</span>
                </span>
              ))}
            </h2>
            <div>
              <div className="section-label" style={{
                fontFamily: 'var(--font-mono)', fontSize: '.7rem',
                letterSpacing: '.25em', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '1.5rem'
              }}>02 — Countryside Series</div>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '.82rem',
                lineHeight: 1.9, color: 'var(--muted)'
              }}>
                The countryside tells a different story — one of patience, seasonality,
                and a relationship with land that city life has long forgotten.
              </p>
            </div>
          </div>

          {/* masonry */}
          <div style={{ columns: 3, columnGap: '1.6rem' }}>
            {rural.map((photo, i) => (
              <div
                key={photo._id}
                className="masonry-item"
                onClick={() => openLightbox(photo, rural)}
                onMouseEnter={() => setHoveredCard(photo._id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  breakInside: 'avoid', marginBottom: '1.6rem',
                  position: 'relative', overflow: 'hidden', cursor: 'none'
                }}
              >
                <img
                  src={urlFor(photo.image).width(800).quality(82).url()}
                  alt={photo.title}
                  style={{
                    width: '100%', display: 'block',
                    transform: hoveredCard === photo._id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform .7s cubic-bezier(.25,1,.5,1)'
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: hoveredCard === photo._id
                    ? 'rgba(0,0,0,.62)'
                    : 'rgba(0,0,0,0)',
                  transition: 'background .4s',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '2rem'
                }}>
                  <div style={{
                    transform: hoveredCard === photo._id ? 'translateY(0)' : 'translateY(16px)',
                    opacity: hoveredCard === photo._id ? 1 : 0,
                    transition: 'transform .35s ease, opacity .35s ease'
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                      fontSize: '1.8rem', color: 'var(--text-on-image)', marginBottom: '.4rem'
                    }}>{photo.title}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent-on-image)'
                    }}>{photo.location}</div>
                    {photo.writeup && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '.72rem',
                        lineHeight: 1.6, color: 'var(--text-on-image-muted)',
                        marginTop: '.8rem'
                      }}>{photo.writeup}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ══ LANDSCAPE ══ */}
      {landscape.length > 0 && (activeFilter === 'all' || activeFilter === 'landscape') && (
        <div style={{ padding: '8rem 4rem' }}>
          <div style={{
            marginBottom: '6rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem',
            alignItems: 'end'
          }}>
            <h2 className="masonry-title-text" style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(3.5rem,6vw,5.5rem)',
              fontWeight: 300, lineHeight: .9, letterSpacing: '-.02em'
            }}>
              {'Landscape'.split(' ').map((word, i) => (
                <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '.25em' }}>
                  <span className="word-inner" style={{ display: 'inline-block' }}>{word}</span>
                </span>
              ))}
            </h2>
            <div>
              <div className="section-label" style={{
                fontFamily: 'var(--font-mono)', fontSize: '.7rem',
                letterSpacing: '.25em', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '1.5rem'
              }}>03 — Landscape Series</div>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '.82rem',
                lineHeight: 1.9, color: 'var(--muted)'
              }}>
                Cambodia's landscapes stretch far beyond the city —
                from the Mekong's edge to the highland forests of Mondulkiri.
              </p>
            </div>
          </div>

          <div style={{ columns: 2, columnGap: '1.6rem' }}>
            {landscape.map((photo, i) => (
              <div
                key={photo._id}
                className="masonry-item"
                onClick={() => openLightbox(photo, landscape)}
                onMouseEnter={() => setHoveredCard(photo._id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  breakInside: 'avoid', marginBottom: '1.6rem',
                  position: 'relative', overflow: 'hidden', cursor: 'none'
                }}
              >
                <img
                  src={urlFor(photo.image).width(1200).quality(82).url()}
                  alt={photo.title}
                  style={{
                    width: '100%', display: 'block',
                    transform: hoveredCard === photo._id ? 'scale(1.04)' : 'scale(1)',
                    transition: 'transform .7s cubic-bezier(.25,1,.5,1)'
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: hoveredCard === photo._id ? 'rgba(0,0,0,.62)' : 'rgba(0,0,0,0)',
                  transition: 'background .4s',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '2.5rem'
                }}>
                  <div style={{
                    transform: hoveredCard === photo._id ? 'translateY(0)' : 'translateY(16px)',
                    opacity: hoveredCard === photo._id ? 1 : 0,
                    transition: 'transform .35s ease, opacity .35s ease'
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '2rem', fontWeight: 300,
                      color: 'var(--text-on-image)', marginBottom: '.4rem'
                    }}>{photo.title}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent-on-image)'
                    }}>{photo.location}</div>
                    {photo.writeup && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '.72rem',
                        lineHeight: 1.6, color: 'var(--text-on-image-muted)', marginTop: '.8rem'
                      }}>{photo.writeup}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ══ PORTRAITS — Wide cards ══ */}
      {portraits.length > 0 && (activeFilter === 'all' || activeFilter === 'portraits') && (
        <div className="portraits-section" style={{
          padding: '8rem 4rem', background: 'var(--mid)'
        }}>
          <div style={{ marginBottom: '5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h2 className="portraits-title" style={{
              fontFamily: 'var(--font-garamond)', fontSize: 'clamp(3rem,5vw,4.5rem)',
              fontStyle: 'italic', letterSpacing: '-.02em', whiteSpace: 'nowrap'
            }}>People & Portraits</h2>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '.7rem',
              letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)'
            }}>03</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(32rem, 1fr))',
            gap: '1.6rem'
          }}>
            {portraits.map((photo, i) => (
              <div
                key={photo._id}
                className="portrait-card"
                onClick={() => openLightbox(photo, portraits)}
                onMouseEnter={() => setHoveredCard(photo._id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  height: i % 3 === 0 ? '52rem' : '38rem', cursor: 'none'
                }}
              >
                <img
                  src={urlFor(photo.image).width(900).quality(82).url()}
                  alt={photo.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    transform: hoveredCard === photo._id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform .7s cubic-bezier(.25,1,.5,1)'
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,.8) 0%, transparent 60%)',
                  padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                    letterSpacing: '.2em', textTransform: 'uppercase',
                    color: 'var(--accent)', marginBottom: '.6rem'
                  }}>{photo.location}</div>
                  <div style={{
                    fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                    fontSize: '2.2rem', color: 'var(--cream)'
                  }}>{photo.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ FALLBACK — no series assigned ══ */}
      {street.length === 0 && rural.length === 0 && landscape.length === 0 && portraits.length === 0 && (
        <div style={{ padding: '8rem 4rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '.75rem', letterSpacing: '.25em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4rem'
          }}>All Photos — assign series in Sanity Studio to enable sections</div>
          <div style={{ columns: 3, columnGap: '1.6rem' }}>
            {all.map((photo) => (
              <div key={photo._id} className="masonry-item" style={{
                breakInside: 'avoid', marginBottom: '1.6rem',
                position: 'relative', overflow: 'hidden', cursor: 'none'
              }} onClick={() => openLightbox(photo, all)}>
              
                <img
                  src={urlFor(photo.image).width(800).quality(82).url()}
                  alt={photo.title}
                  style={{ width: '100%', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '2rem'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
                    fontSize: '1.6rem', color: 'var(--cream)'
                  }}>{photo.title}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                    letterSpacing: '.15em', textTransform: 'uppercase',
                    color: 'var(--accent)', marginTop: '.4rem'
                  }}>{photo.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ FOOTER ══ */}
      <div style={{
        padding: '2.5rem 4rem', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          letterSpacing: '.15em', color: 'var(--muted)'
        }}>
          {fmt(all.length)} photographs — Cambodia
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          letterSpacing: '.15em', color: 'var(--muted)'
        }}>WRD Photography © 2026</div>
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          51%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
      `}</style>

      {/* LIGHTBOX */}
      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          photos={lightboxList}
          onClose={closeLightbox}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
          onGoTo={lightboxGoTo}
        />
      )}
    </div>
  )
}