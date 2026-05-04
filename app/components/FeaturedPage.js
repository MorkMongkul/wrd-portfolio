'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { urlFor } from '@/sanity/lib/image'

export default function FeaturedPage({ photos }) {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy]       = useState(false)
  const slidesRef             = useRef([])
  const imgsRef               = useRef([])
  const counterRef            = useRef(null)
  const TOTAL                 = photos.length

  useEffect(() => {
    if (!photos.length) return
    revealText(0)

    const onWheel = (e) => {
      e.preventDefault()
      if (busy) return
      goTo(e.deltaY > 0 ? 1 : -1)
    }
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goTo(1) }
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); goTo(-1) }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [photos, busy, current])

  function revealText(idx) {
    const slide = slidesRef.current[idx]
    if (!slide) return
    const lines   = slide.querySelectorAll('.text-line')
    const caption = slide.querySelector('.caption')
    const writeup = slide.querySelector('.writeup')
    const meta    = slide.querySelector('.meta')

    gsap.set(lines,   { y: '102%', opacity: 0 })
    gsap.set(caption, { opacity: 0, y: 12 })
    gsap.set(writeup, { opacity: 0, y: 14 })
    gsap.set(meta,    { opacity: 0, x: 20 })

    const tl = gsap.timeline({ delay: .1 })
    tl.to(caption, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' })
      .to(lines,   { y: 0, opacity: 1, duration: 1.1, stagger: .1, ease: 'power3.out' }, .1)
      .to(writeup, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, .5)
      .to(meta,    { opacity: 1, x: 0, duration: .7, ease: 'power3.out' }, .3)
  }

  function goTo(dir) {
    if (busy || !photos.length) return
    setBusy(true)

    const prev = current
    const next = dir === 1
      ? (current < TOTAL - 1 ? current + 1 : 0)
      : (current > 0 ? current - 1 : TOTAL - 1)

    const cSlide = slidesRef.current[prev]
    const nSlide = slidesRef.current[next]
    const cImg   = imgsRef.current[prev]
    const nImg   = imgsRef.current[next]

    const cLines  = cSlide.querySelectorAll('.text-line')
    const cOthers = cSlide.querySelectorAll('.caption, .writeup, .meta')

    gsap.set(nSlide, { visibility: 'visible', y: dir * 100 + '%' })
    gsap.set(nImg,   {
      y: -dir * 35 + '%', scale: 1.4, scaleY: 1.65,
      rotation: -dir * 6,
      transformOrigin: dir === 1 ? '0% 0%' : '100% 100%'
    })

    const tl = gsap.timeline({
      defaults: { duration: 1.5, ease: 'power3.inOut' },
      onComplete: () => {
        gsap.set(cSlide, { visibility: 'hidden' })
        cSlide.classList.remove('active')
        nSlide.classList.add('active')
        setCurrent(next)
        setBusy(false)
      }
    })

    // counter
    if (counterRef.current) {
      gsap.to(counterRef.current, {
        y: `-${next * 1.4}rem`, duration: 1.5, ease: 'power3.inOut'
      })
    }

    tl.to([cLines, cOthers], { opacity: 0, y: '-60%', duration: .65, stagger: .04, ease: 'power2.in' }, 0)
      .to(cSlide, { y: -dir * 100 + '%' }, .2)
      .to(cImg,   { y: dir * 40 + '%', scale: 1.5, scaleY: 1.8, rotation: dir * 8, ease: 'power3.out', transformOrigin: dir === 1 ? '0% 100%' : '100% 0%' }, .2)
      .to(nSlide, { y: '0%' }, .2)
      .to(nImg,   { y: '0%', scale: 1, scaleY: 1, rotation: 0, ease: 'power3.out', duration: 1.4 }, .2)

    setTimeout(() => revealText(next), 900)
  }

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
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {photos.map((photo, idx) => (
        <div
          key={photo._id}
          ref={el => slidesRef.current[idx] = el}
          className={idx === 0 ? 'active' : ''}
          style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
            visibility: idx === 0 ? 'visible' : 'hidden'
          }}
        >
          {/* Background image */}
          <div
            ref={el => imgsRef.current[idx] = el}
            style={{
              position: 'absolute', top: '-10%', left: '-10%',
              width: '120%', height: '120%',
              backgroundImage: `url(${urlFor(photo.image).width(1920).quality(85).url()})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              willChange: 'transform'
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,.25) 0%, rgba(0,0,0,.6) 100%)'
            }}/>
          </div>

          {/* Meta top right */}
          <div className="meta" style={{
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
            <div className="caption" style={{
              fontFamily: 'var(--font-mono)', fontSize: '.75rem',
              letterSpacing: '.2em', textTransform: 'uppercase',
              color: 'var(--accent-on-image)', marginBottom: '1.2rem'
            }}>
              {fmt(idx + 1)} — {photo.series}
            </div>

            <div style={{ overflow: 'hidden' }}>
              {photo.title.split(' ').slice(0, 3).join(' ') !== photo.title ? (
                <>
                  <span className="text-line" style={{
                    display: 'block', fontFamily: 'var(--font-garamond)',
                    fontSize: '6.5rem', lineHeight: '.95',
                    fontStyle: 'italic', letterSpacing: '-.03em',
                    color: 'var(--text-on-image)'
                  }}>
                    {photo.title.split(' ').slice(0, Math.ceil(photo.title.split(' ').length / 2)).join(' ')}
                  </span>
                  <span className="text-line" style={{
                    display: 'block', fontFamily: 'var(--font-garamond)',
                    fontSize: '6.5rem', lineHeight: '.95',
                    fontStyle: 'italic', letterSpacing: '-.03em',
                    color: 'var(--text-on-image)'
                  }}>
                    {photo.title.split(' ').slice(Math.ceil(photo.title.split(' ').length / 2)).join(' ')}
                  </span>
                </>
              ) : (
                <span className="text-line" style={{
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
              <div className="writeup" style={{
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
        position: 'fixed', bottom: '3.5rem', right: '4rem',
        display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 10
      }}>
        <div style={{ height: '1.4rem', overflow: 'hidden',
          fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
          <div ref={counterRef}>
            {photos.map((_, i) => (
              <div key={i} style={{ height: '1.4rem', lineHeight: '1.4rem' }}>
                {fmt(i + 1)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: 30, height: 1, background: 'var(--muted)' }}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--muted-on-image)' }}>
          {fmt(TOTAL)}
        </div>
      </div>

      {/* Dots */}
      <div style={{
        position: 'fixed', left: '50%', bottom: '3.5rem',
        transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', gap: '.8rem', alignItems: 'center'
      }}>
        {photos.map((_, i) => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: '50%',
            background: i === current ? 'var(--accent-on-image)' : 'var(--muted-on-image)',
            transform: i === current ? 'scale(1.6)' : 'scale(1)',
            transition: 'background .3s, transform .3s'
          }}/>
        ))}
      </div>

      {/* Hint */}
      <div style={{
        position: 'fixed', bottom: '3.5rem', left: '4rem', zIndex: 10,
        fontFamily: 'var(--font-mono)', fontSize: '.7rem',
        letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-on-image)'
      }}>
        scroll / click
      </div>
    </div>
  )
}
