'use client'
import { useRef, useState, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { urlFor } from '@/sanity/lib/image'
import Lightbox from './Lightbox'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function GalleryPage({ photos, seriesList, heroImage, initialSeriesId, onClearInitialSeries, aboutData }) {
  const socialInstagram = aboutData?.instagramUrl || 'https://instagram.com'
  const socialFacebook  = aboutData?.facebookUrl  || 'https://facebook.com'
  const socialLinkedin  = aboutData?.linkedinUrl  || 'https://linkedin.com'
  const socialTelegram  = aboutData?.telegramUrl  || 'https://t.me'
  const containerRef = useRef(null)
  const coverPanelRef = useRef(null)
  const coverImgRef = useRef(null)
  const coverSeriesIdRef = useRef(null)   // tracks which series is currently shown in the hover panel
  const gridSectionRef = useRef(null)
  const gridTrackRef = useRef(null)
  const gridScrollTriggerRef = useRef(null)
  const editorialTriggersRef = useRef([]) // ScrollTrigger instances from editorial useEffect
  const listAnimatedRef = useRef(false)  // prevents list rows from re-animating on every view-mode toggle

  // Word-by-word reveal — same pattern as AboutPage biography/CTA
  const splitWords = (text) => {
    if (!text) return null
    const words = text.split(' ')
    return words.flatMap((word, idx) => {
      const span = (
        <span key={idx} className="word-span" style={{
          opacity: 0, transform: 'translateY(12px)', willChange: 'transform, opacity'
        }}>
          {word}
        </span>
      )
      return idx < words.length - 1 ? [span, ' '] : [span]
    })
  }

  const handleViewModeChange = (newMode) => {
    // Kill (not revert) the pin trigger so no orphaned spacer is left in the DOM.
    // revertOnUpdate:true on useGSAP handles full GSAP context cleanup on re-run.
    if (gridScrollTriggerRef.current) {
      gridScrollTriggerRef.current.kill()
      gridScrollTriggerRef.current = null
    }
    setViewMode(newMode)
  }


  // Helper to split string into individual words for About Page line-by-line reveal
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

  const [viewMode, setViewMode] = useState('list')
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [renderDetailContent, setRenderDetailContent] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [lightboxList, setLightboxList] = useState([])

  // Lightbox handlers
  function openLightbox(photo, list) { setLightboxList(list); setLightboxPhoto(photo) }
  function closeLightbox() { setLightboxPhoto(null); setLightboxList([]) }
  function lightboxPrev() {
    const idx = lightboxList.findIndex(p => p._id === lightboxPhoto._id)
    setLightboxPhoto(lightboxList[idx > 0 ? idx - 1 : lightboxList.length - 1])
  }
  function lightboxNext() {
    const idx = lightboxList.findIndex(p => p._id === lightboxPhoto._id)
    setLightboxPhoto(lightboxList[idx < lightboxList.length - 1 ? idx + 1 : 0])
  }

  // ── Robust fallback system if no series created in Sanity yet ──
  const seriesToUse = useMemo(() => {
    return seriesList && seriesList.length > 0 ? seriesList : [
      { _id: 'street', title: 'Street Life', location: 'Phnom Penh', year: '2024', camera: 'Fujifilm X-T4', description: 'Street photography exploring the fast-paced, raw, and vibrant daily lives of urban Phnom Penh residents.' },
      { _id: 'rural', title: 'River People', location: 'Kampot', year: '2023', camera: 'Fujifilm X-T4', description: 'A quiet, deep-dive documentary following families who live and work along the Kampot river, tracing their ancient traditions.' },
      { _id: 'landscape', title: 'Temple Hours', location: 'Siem Reap', year: '2025', camera: 'Fujifilm X-T4', description: 'The timeless, spiritual ruins of Angkor, documented during early morning light and quiet, meditative hours.' },
      { _id: 'portraits', title: 'Highland Forest', location: 'Mondulkiri', year: '2024', camera: 'Fujifilm X-T4', description: 'Intimate portraits of indigenous communities and their profound connection to the dense highland forests of Mondulkiri.' },
    ].map((fallback, idx) => {
      const firstPhoto = photos.find(p => p.series === fallback._id || p.seriesId === fallback._id)
      return {
        ...fallback,
        coverImage: firstPhoto ? firstPhoto.image : null,
        order: idx + 1
      }
    })
  }, [seriesList, photos])

  // Handle auto-opening of a series when navigating from Featured page
  useEffect(() => {
    if (initialSeriesId) {
      const found = seriesToUse.find(s => s._id === initialSeriesId)
      if (found) {
        setTimeout(() => {
          setRenderDetailContent(false)
          setSelectedSeries(found)
        }, 0)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
      if (onClearInitialSeries) {
        onClearInitialSeries()
      }
    }
  }, [initialSeriesId, seriesToUse, onClearInitialSeries])

  // Format index helpers
  const fmt = n => n < 10 ? `0${n}` : `${n}`

  // Get active photos for the selected series
  const activePhotos = selectedSeries
    ? (selectedSeries.photos && selectedSeries.photos.length > 0
      ? selectedSeries.photos
      : photos.filter(p => {
        const sid = selectedSeries._id
        if (sid === 'street' || sid === 'rural' || sid === 'landscape' || sid === 'portraits') {
          return p.series === sid || p.seriesId === sid
        }
        return p.seriesId === sid || p.series?._id === sid
      }))
    : []

  // ── Compile editorial blocks ──
  // Consecutive photos marked with 'masonry' layout are grouped into a single block
  const editorialBlocks = []
  let masonryTemp = []

  activePhotos.forEach((photo) => {
    if (photo.layout === 'masonry') {
      masonryTemp.push(photo)
      if (masonryTemp.length === 3) {
        editorialBlocks.push({ type: 'masonry', photos: masonryTemp })
        masonryTemp = []
      }
    } else {
      if (masonryTemp.length > 0) {
        editorialBlocks.push({ type: 'masonry', photos: masonryTemp })
        masonryTemp = []
      }
      editorialBlocks.push({ type: photo.layout || 'left', photo })
    }
  })
  if (masonryTemp.length > 0) {
    editorialBlocks.push({ type: 'masonry', photos: masonryTemp })
  }

  // ── GSAP hover cover photo reveal ──
  function showCover(seriesItem) {
    if (!coverImgRef.current || !coverPanelRef.current) return

    // If already showing this series, just ensure the panel is open — no src swap needed
    if (coverSeriesIdRef.current === seriesItem._id) {
      gsap.killTweensOf(coverPanelRef.current)
      gsap.to(coverPanelRef.current, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power4.out' })
      return
    }

    const imgUrl = seriesItem.coverImage
      ? urlFor(seriesItem.coverImage).width(1200).quality(85).url()
      : (photos.find(p => p.series === seriesItem._id || p.seriesId === seriesItem._id)?.image
        ? urlFor(photos.find(p => p.series === seriesItem._id || p.seriesId === seriesItem._id).image).width(1200).quality(85).url()
        : '')
    if (!imgUrl) return

    coverSeriesIdRef.current = seriesItem._id
    gsap.killTweensOf(coverPanelRef.current)

    // Close panel first → swap src when fully hidden → re-open.
    // This prevents the old image from being visible mid-reveal when switching rows quickly.
    gsap.to(coverPanelRef.current, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.12,
      ease: 'none',
      onComplete: () => {
        if (!coverImgRef.current) return
        coverImgRef.current.src = imgUrl
        gsap.to(coverPanelRef.current, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power4.out' })
      }
    })
  }

  function hideCover() {
    coverSeriesIdRef.current = null
    if (!coverPanelRef.current) return
    gsap.killTweensOf(coverPanelRef.current)
    gsap.to(coverPanelRef.current, { clipPath: 'inset(0 100% 0 0)', duration: 0.4, ease: 'power3.in' })
  }

  function onRowEnter(e, seriesItem) {
    const arrow = e.currentTarget.querySelector('.series-arrow')
    if (arrow) gsap.to(arrow, { x: 10, duration: 0.3, ease: 'power2.out' })
    showCover(seriesItem)
  }

  function onRowLeave(e) {
    const arrow = e.currentTarget.querySelector('.series-arrow')
    if (arrow) gsap.to(arrow, { x: 0, duration: 0.4, ease: 'power2.out' })
    hideCover()
  }

  // Open a series directly with instant view swap + zoom reveal
  function openSeries(series) {
    if (gridScrollTriggerRef.current) {
      gridScrollTriggerRef.current.revert()
      gridScrollTriggerRef.current.kill()
      gridScrollTriggerRef.current = null
    }
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
    setRenderDetailContent(false)
    setSelectedSeries(series)
  }

  // ── GSAP ScrollTrigger transitions ──
  useGSAP((context) => {
    const scroller = containerRef.current
    if (!scroller) return

    let timer

    // Scroll Animations for Series Detail View
    if (selectedSeries) {

      // Detail Hero Cover — CodePen-style sliding reveal
      const coverWrap = scroller.querySelector('.detail-hero-bg-wrap')
      const coverBg = scroller.querySelector('.detail-hero-bg')
      if (coverWrap && coverBg) {
        gsap.set(coverWrap, { autoAlpha: 0 })
        gsap.set(coverBg, { transformOrigin: 'left center' })

        const coverTl = gsap.timeline({
          delay: 0.1,
          onComplete: () => setRenderDetailContent(true)
        })
        coverTl.fromTo(coverWrap,
          { autoAlpha: 0, xPercent: -100 },
          { autoAlpha: 1, xPercent: 0, duration: 1.6, ease: 'power3.out' }
        )
        coverTl.fromTo(coverBg,
          { xPercent: 100, scale: 1.3 },
          { xPercent: 0, scale: 1, duration: 1.6, ease: 'power3.out' },
          '<'
        )
      } else {
        setRenderDetailContent(true)
      }

      // Hero text entrance — always animate fresh on open
      gsap.fromTo('.detail-view-inner-wrap',
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      )

      const detailLines = scroller.querySelectorAll('.detail-hero-content .title-line-inner')
      const detailFadeTexts = scroller.querySelectorAll('.detail-hero-content .fade-text')

      gsap.set(detailLines, { y: '110%' })
      gsap.set(detailFadeTexts, { opacity: 0, y: 20 })

      gsap.to(detailLines, { y: '0%', duration: 1.4, stagger: 0.1, ease: 'power4.out', delay: 0.1 })
      gsap.to(detailFadeTexts, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 })

      // Editorial scroll animations are handled in a dedicated useEffect
      // that runs after renderDetailContent becomes true and React mounts the content

    } else {
      // ── LIST / GRID VIEW ENTRANCE ANIMATIONS ──

      timer = setTimeout(() => {
        context.add(() => {
          // List view rows — only animate on first entry or after returning from a series detail.
          // listAnimatedRef prevents them from re-animating every time you toggle List ↔ Grid.
          if (viewMode === 'list' && !listAnimatedRef.current) {
            listAnimatedRef.current = true
            gsap.utils.toArray('.list-series-row').forEach((row, i) => {
              gsap.fromTo(row,
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 + i * 0.07 }
              )
            })
          }

          // Grid view horizontal scroll trigger
          if (viewMode === 'grid') {
            const track = gridTrackRef.current
            const section = gridSectionRef.current
            if (track && section) {
              const scrollVal = Math.max(0, track.scrollWidth - section.offsetWidth)
              if (scrollVal > 0) {
                const tween = gsap.to(track, {
                  x: -scrollVal,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: section,
                    scroller: scroller,
                    pin: true,
                    pinSpacing: true,
                    start: 'top 64px',
                    end: () => `+=${scrollVal}`,
                    scrub: 1,
                    invalidateOnRefresh: true,
                  }
                })
                gridScrollTriggerRef.current = tween.scrollTrigger
              }
            }

            // Grid view cards — stagger scale+fade reveal
            gsap.utils.toArray('.grid-series-card').forEach((card, i) => {
              gsap.fromTo(card,
                { opacity: 0, y: 50, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out', delay: 0.1 + i * 0.1 }
              )
            })
          }

          ScrollTrigger.refresh()
        })
      }, 100)

      return () => { clearTimeout(timer) }
    }
  }, { scope: containerRef, dependencies: [selectedSeries, viewMode], revertOnUpdate: true })

  // Editorial scroll animations — set up once after React mounts the content
  useEffect(() => {
    if (!renderDetailContent || !selectedSeries) return
    const scroller = containerRef.current
    if (!scroller) return

    // Kill any lingering triggers from a previous series
    editorialTriggersRef.current.forEach(t => t.kill())
    editorialTriggersRef.current = []

    const timer = setTimeout(() => {
      // Word-by-word fade-up for series description and photo writeups
      // Matches the AboutPage biography/CTA animation exactly
      scroller.querySelectorAll('.reveal-text').forEach(el => {
        const spans = el.querySelectorAll('.word-span')
        if (!spans.length) return
        const tw = gsap.to(spans, {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: 'power2.out',
          scrollTrigger: { trigger: el, scroller, start: 'top 85%', toggleActions: 'play none none none' }
        })
        if (tw.scrollTrigger) editorialTriggersRef.current.push(tw.scrollTrigger)
      })

      // Editorial Blocks scroll reveals
      gsap.utils.toArray('.ed-block').forEach((block) => {
        const imageWrap = block.querySelector('.ed-image-wrap')
        const image = imageWrap?.querySelector('img')
        const content = block.querySelector('.ed-content-wrap')

        if (imageWrap && image) {
          gsap.set(imageWrap, { autoAlpha: 1 })
          gsap.set(image, { transformOrigin: 'left center' })

          const tl = gsap.timeline({
            scrollTrigger: { trigger: block, scroller, start: 'top 85%', toggleActions: 'play none none none' }
          })
          tl.fromTo(imageWrap, { xPercent: -100 }, { xPercent: 0, duration: 1.2, ease: 'power2.out' })
          tl.fromTo(image, { xPercent: 100, scale: 1.15 }, { xPercent: 0, scale: 1, duration: 1.2, ease: 'power2.out' }, '<')
          if (tl.scrollTrigger) editorialTriggersRef.current.push(tl.scrollTrigger)
        }

        if (content) {
          const titleLines = content.querySelectorAll('.title-line-inner')
          if (titleLines.length) {
            const tw = gsap.fromTo(titleLines,
              { y: '110%' },
              {
                y: '0%', duration: 1.1, stagger: 0.06, ease: 'power4.out', delay: 0.1,
                scrollTrigger: { trigger: block, scroller, start: 'top 85%', toggleActions: 'play none none none' }
              }
            )
            if (tw.scrollTrigger) editorialTriggersRef.current.push(tw.scrollTrigger)
          }

          const fadeTexts = content.querySelectorAll('.fade-text')
          if (fadeTexts.length) {
            const tw = gsap.fromTo(fadeTexts,
              { opacity: 0, y: 12 },
              {
                opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.1,
                scrollTrigger: { trigger: block, scroller, start: 'top 85%', toggleActions: 'play none none none' }
              }
            )
            if (tw.scrollTrigger) editorialTriggersRef.current.push(tw.scrollTrigger)
          }
        }
      })

      // Masonry Blocks scroll reveals
      gsap.utils.toArray('.masonry-block').forEach((block) => {
        const items = block.querySelectorAll('.masonry-item-inner')
        if (items.length) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: block, scroller, start: 'top 85%', toggleActions: 'play none none none' }
          })
          items.forEach((item, index) => {
            const img = item.querySelector('img')
            if (img) {
              gsap.set(item, { autoAlpha: 1 })
              gsap.set(img, { transformOrigin: 'left center' })
              tl.fromTo(item, { xPercent: -100 }, { xPercent: 0, duration: 1.2, ease: 'power2.out' }, index * 0.12)
              tl.fromTo(img, { xPercent: 100, scale: 1.15 }, { xPercent: 0, scale: 1, duration: 1.2, ease: 'power2.out' }, '<')
            }
          })
          if (tl.scrollTrigger) editorialTriggersRef.current.push(tl.scrollTrigger)
        }
      })

      ScrollTrigger.refresh()
    }, 50)

    return () => {
      clearTimeout(timer)
      editorialTriggersRef.current.forEach(t => t.kill())
      editorialTriggersRef.current = []
    }
  }, [renderDetailContent, selectedSeries])

  // Reset the list-animation flag when opening a series, so the list animates again on return
  useEffect(() => {
    if (selectedSeries) listAnimatedRef.current = false
  }, [selectedSeries])

  // Styling helpers
  const toggleBtnStyle = (active) => ({
    fontFamily: 'var(--font-mono)', fontSize: '.7rem',
    letterSpacing: '.25em', textTransform: 'uppercase',
    padding: '.6rem 1.8rem', cursor: 'none',
    background: active ? 'var(--text)' : 'transparent',
    color: active ? 'var(--dark)' : 'var(--muted)',
    border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
    borderRadius: '100px',
    transition: 'background .3s, color .3s, border-color .3s',
  })

  return (
    <div
      ref={containerRef}
      className="page-scroll"
      style={{ background: 'var(--dark)', minHeight: '100vh', color: 'var(--text)' }}
    >

      {/* ══ LEVEL 1: SERIES EXPLORER ══ */}
      <div style={{ display: !selectedSeries ? 'flex' : 'none', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Spacer to push down past the main site navbar */}
        <div style={{ height: '64px', width: '100%', flexShrink: 0 }} />

        {/* LIST VIEW EXPLORER */}
        <div style={{ display: viewMode === 'list' ? 'block' : 'none' }}>
          {/* Header */}
          <div style={{
            position: 'sticky',
            top: '64px',
            zIndex: 90,
            padding: '1.5rem 4rem',
            background: 'var(--sticky-nav-bg)',
            backdropFilter: 'blur(12px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            borderBottom: '1px solid var(--border)'
          }} className="list-gallery-header">
            <div style={{ display: 'flex', gap: '.4rem' }}>
              <button
                onClick={() => handleViewModeChange('list')}
                style={toggleBtnStyle(viewMode === 'list')}
                onMouseEnter={e => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.borderColor = 'var(--text)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--muted)'
                  }
                }}
              >
                List
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                style={toggleBtnStyle(viewMode === 'grid')}
                onMouseEnter={e => {
                  if (viewMode !== 'grid') {
                    e.currentTarget.style.borderColor = 'var(--text)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  if (viewMode !== 'grid') {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--muted)'
                  }
                }}
              >
                Grid
              </button>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', minHeight: '60vh' }}>
            {/* Left Column: Series Rows */}
            <div style={{ width: '55%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              {seriesToUse.map((series, i) => (
                <div
                  key={series._id}
                  onMouseEnter={e => onRowEnter(e, series)}
                  onMouseLeave={onRowLeave}
                  onClick={() => openSeries(series)}
                  style={{
                    padding: '1.4rem 4rem',
                    borderTop: i === 0 ? '1px solid var(--border)' : undefined,
                    borderBottom: '1px solid var(--border)',
                    cursor: 'none',
                    display: 'grid',
                    gridTemplateColumns: '2.5rem 1fr auto auto',
                    alignItems: 'center', gap: '2rem',
                    transition: 'background .3s'
                  }}
                  className="list-series-row"
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                    letterSpacing: '.25em', color: 'var(--muted)'
                  }}>{fmt(i + 1)}</span>

                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.3rem,2vw,1.9rem)',
                    fontWeight: 800, letterSpacing: '-.02em',
                    color: 'var(--text)'
                  }}>{series.title.toUpperCase()}</span>

                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                    letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)'
                  }}>{series.location}</span>

                  <span className="series-arrow" style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.9rem',
                    color: 'var(--accent)', display: 'inline-block'
                  }}>→</span>
                </div>
              ))}
            </div>

            {/* Right Column: Dynamic Cover Image (GSAP clip reveal) */}
            <div
              ref={coverPanelRef}
              style={{
                position: 'absolute', right: 0, top: 0,
                width: '45%', height: '100%',
                clipPath: 'inset(0 100% 0 0)',
                overflow: 'hidden', pointerEvents: 'none',
                background: 'var(--dark)'
              }}
            >
              <img
                ref={coverImgRef}
                src={undefined}
                alt="Series cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, var(--list-fade-start) 0%, var(--list-fade-end) 35%)'
              }} />
            </div>
          </div>
        </div>

        {/* GRID VIEW EXPLORER */}
        <div style={{ display: viewMode === 'grid' ? 'block' : 'none', width: '100%' }}>
          <div
            ref={gridSectionRef}
            style={{
              position: 'relative',
              width: '100%',
              height: 'calc(100vh - 64px)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center'
            }}
          >
          {/* Header */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 90,
            padding: '1.5rem 4rem',
            background: 'var(--sticky-nav-bg)',
            backdropFilter: 'blur(12px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            borderBottom: '1px solid var(--border)'
          }} className="grid-gallery-header">
            <div style={{ display: 'flex', gap: '.4rem' }}>
              <button
                onClick={() => handleViewModeChange('list')}
                style={toggleBtnStyle(viewMode === 'list')}
                onMouseEnter={e => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.borderColor = 'var(--text)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  if (viewMode !== 'list') {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--muted)'
                  }
                }}
              >
                List
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                style={toggleBtnStyle(viewMode === 'grid')}
                onMouseEnter={e => {
                  if (viewMode !== 'grid') {
                    e.currentTarget.style.borderColor = 'var(--text)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  if (viewMode !== 'grid') {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--muted)'
                  }
                }}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Track */}
          <div
            ref={gridTrackRef}
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              gap: '4rem',
              padding: '6rem 8rem 0 4rem',
              width: 'max-content',
              alignItems: 'center',
              willChange: 'transform'
            }}
          >
            {seriesToUse.map((series, i) => {
              const cover = series.coverImage
                ? urlFor(series.coverImage).width(800).quality(85).url()
                : (photos.find(p => p.series === series._id || p.seriesId === series._id)?.image
                  ? urlFor(photos.find(p => p.series === series._id || p.seriesId === series._id).image).width(800).quality(85).url()
                  : '')

              return (
                <div
                  key={series._id}
                  onClick={() => openSeries(series)}
                  onMouseEnter={() => setHoveredCard(series._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="grid-series-card"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: 'clamp(24rem, 55vh, 32rem)',
                    width: 'clamp(18rem, 25vw, 24rem)',
                    flexShrink: 0,
                    cursor: 'none',
                    borderRadius: '4px',
                    background: 'var(--mid)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {cover && (
                    <img
                      src={cover}
                      alt={series.title}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                        transform: hoveredCard === series._id ? 'scale(1.04)' : 'scale(1)',
                        transition: 'transform .8s cubic-bezier(.25,1,.5,1)'
                      }}
                    />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 60%, transparent 100%)'
                  }} />

                  {/* Index marker top right */}
                  <div style={{
                    position: 'absolute', top: '2rem', right: '2rem',
                    fontFamily: 'var(--font-mono)', fontSize: '.7rem',
                    letterSpacing: '.2em', color: 'var(--accent-on-image)'
                  }}>
                    {fmt(i + 1)}
                  </div>

                  {/* Meta bottom left */}
                  <div style={{
                    position: 'absolute', bottom: 'clamp(1.5rem, 5%, 2.5rem)', left: 'clamp(1.5rem, 5%, 2.5rem)', right: 'clamp(1.5rem, 5%, 2.5rem)'
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      letterSpacing: '.25em', textTransform: 'uppercase',
                      color: 'var(--accent-on-image)', marginBottom: '.6rem'
                    }}>
                      {series.location}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2vw, 1.7rem)',
                      fontWeight: 500, color: 'var(--text-on-image)',
                      lineHeight: 1.1, letterSpacing: '-.01em', marginBottom: '.4rem'
                    }}>
                      {series.title.toUpperCase()}
                    </h3>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      color: 'var(--text-on-image-muted)', letterSpacing: '.1em'
                    }}>
                      {series.year} — Explore Series →
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

        {/* Explorer Footer */}
        <div style={{
          padding: '2.5rem 4rem', marginTop: 'auto', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1.5rem'
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.15em', color: 'var(--muted)' }}>
            {fmt(seriesToUse.length)} SERIES AVAILABLE
          </span>

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

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.15em', color: 'var(--muted)' }}>
            WRD Photography © 2026
          </span>
        </div>

      </div>

      {/* ══ LEVEL 2: EDITORIAL SERIES DETAIL VIEW ══ */}
      <div className="detail-view-inner-wrap" style={{ display: selectedSeries ? 'flex' : 'none', flexDirection: 'column' }}>

        {/* Detail View Minimal Nav */}
        <div style={{
          position: 'sticky', top: '64px', zIndex: 100,
          padding: '1.5rem 4rem', background: 'var(--sticky-nav-bg)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button
            onClick={() => {
              setSelectedSeries(null)
              setRenderDetailContent(false)
              if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'instant' })
            }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.7rem',
              letterSpacing: '.25em', textTransform: 'uppercase',
              background: 'none', border: 'none', color: 'var(--accent)',
              cursor: 'none', display: 'flex', alignItems: 'center', gap: '.6rem'
            }}
          >
            ← Back to All Series
          </button>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '.7rem',
            letterSpacing: '.2em', color: 'var(--muted)', textTransform: 'uppercase'
          }}>
            Active: {selectedSeries?.title}
          </div>
        </div>

        {/* Full bleed Series Hero */}
        <div className="detail-hero-section" style={{
          height: '75vh', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 4rem 6rem', background: 'var(--dark)'
        }}>
          {/* Cover image wrap for CodePen style sliding reveal */}
          <div className="detail-hero-bg-wrap" style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
            opacity: 0, background: 'var(--dark)'
          }}>
            <div className="detail-hero-bg" style={{
              position: 'absolute', top: '-10%', left: 0,
              width: '100%', height: '120%',
              backgroundImage: selectedSeries?.coverImage
                ? `url(${urlFor(selectedSeries.coverImage).width(1440).quality(80).url()})`
                : (activePhotos[0]
                  ? `url(${urlFor(activePhotos[0].image).width(1440).quality(80).url()})`
                  : 'none'),
              backgroundSize: 'cover', backgroundPosition: 'center',
              willChange: 'transform'
            }} />
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,8,.95) 0%, rgba(10,10,8,.4) 50%, rgba(10,10,8,.1) 100%)',
            zIndex: 1
          }} />

          {/* Typography Title Overlay */}
          <div className="detail-hero-content" style={{ position: 'relative', zIndex: 2 }}>
            <div className="fade-text" style={{
              fontFamily: 'var(--font-mono)', fontSize: '.75rem', letterSpacing: '.35em',
              textTransform: 'uppercase', color: 'var(--accent-on-image)', marginBottom: '1.2rem'
            }}>
              Series Portfolio / {selectedSeries?.location}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: '1.05',
              letterSpacing: '-.02em', color: 'var(--text-on-image)',
              textTransform: 'uppercase'
            }}>
              {splitTitle(selectedSeries?.title)}
            </h1>
          </div>
        </div>

        {renderDetailContent && (
          <div style={{ display: 'contents' }}>
            {/* Split row description & Metadata panel */}
            <div style={{
              padding: '6rem 4rem', display: 'flex', flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '4rem',
              borderBottom: '1px solid var(--border)'
            }}>
          {/* Description */}
          <div className="detail-description-panel" style={{ flex: '1 1 36rem', maxWidth: '45rem' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '.7rem',
              letterSpacing: '.25em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '1.5rem'
            }}>
            </div>
            <p className="reveal-text" style={{
              fontFamily: 'var(--font-sans)', fontSize: '1.2rem',
              lineHeight: 1.8, color: 'var(--text)', fontWeight: 300
            }}>
              {splitWords(selectedSeries?.description || 'This collection presents a focused narrative exploration, drawing details together to build an immersive sequence of visual documents.')}
            </p>
          </div>

          {/* Meta Table */}
          <div style={{ flex: '1 1 20rem', maxWidth: '28rem' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '.7rem',
              letterSpacing: '.25em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '1.5rem'
            }}>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Location', value: selectedSeries?.location },
                { label: 'Year', value: selectedSeries?.year },
                { label: 'Photographs', value: activePhotos.length },
                { label: 'Camera', value: selectedSeries?.camera || 'Fujifilm X-System' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '1.2rem 0',
                    borderBottom: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)', fontSize: '.8rem'
                  }}
                >
                  <span style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{item.label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EDITORIAL PHOTOS GRID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem', padding: '8rem 4rem' }}>
          {editorialBlocks.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '6rem 0', fontFamily: 'var(--font-mono)',
              color: 'var(--muted)', letterSpacing: '.2em', fontSize: '.85rem'
            }}>
              NO PHOTOS UPLOADED FOR THIS SERIES YET
            </div>
          ) : (
            editorialBlocks.map((block, idx) => {

              // MASONRY GROUP
              if (block.type === 'masonry') {
                const rangeStart = idx * 2 + 1
                const rangeEnd = rangeStart + block.photos.length - 1

                return (
                  <div
                    key={`masonry-${idx}`}
                    className="masonry-block"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '1.5rem',
                      width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '5rem'
                    }}
                  >
                    <div style={{
                      display: 'flex', gap: '1.6rem', flexWrap: 'wrap', width: '100%'
                    }}>
                      {block.photos.map((photo, pIdx) => (
                        <div
                          key={photo._key || photo._id || pIdx}
                          className="masonry-item-inner"
                          onClick={() => openLightbox(photo, activePhotos)}
                          style={{
                            flex: '1 1 20rem', position: 'relative', overflow: 'hidden',
                            height: '35rem', cursor: 'none', background: 'var(--dark)',
                            borderRadius: '2px', visibility: 'hidden'
                          }}
                        >
                          <img
                            src={urlFor(photo.image).width(900).quality(85).url()}
                            alt={photo.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          />
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 60%)',
                            padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                          }}>
                            <h4 style={{
                              fontFamily: 'var(--font-sans)', fontSize: '1.6rem',
                              color: 'var(--text-on-image)', fontWeight: 300, lineHeight: 1.2
                            }}>
                              {photo.title}
                            </h4>
                            {photo.location && (
                              <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                                letterSpacing: '.15em', textTransform: 'uppercase',
                                color: 'var(--accent-on-image)', marginTop: '.4rem'
                              }}>
                                {photo.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '.7rem',
                      letterSpacing: '.2em', color: 'var(--muted)', marginTop: '1rem',
                      textTransform: 'uppercase'
                    }}>
                      PHOTOS {fmt(rangeStart)} — {fmt(rangeEnd)} / SERIES CHRONOLOGY
                    </div>
                  </div>
                )
              }

              // FULL BLEED CENTER PHOTO
              if (block.type === 'full') {
                const { photo } = block
                const photoUrl = urlFor(photo.image).width(1600).quality(85).url()

                return (
                  <div
                    key={photo._key || photo._id || idx}
                    className="ed-block"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      width: '100%', gap: '2.5rem', borderBottom: '1px solid var(--border)',
                      paddingBottom: '6rem'
                    }}
                  >
                    {/* Large Center Image */}
                    <div
                      className="ed-image-wrap"
                      onClick={() => openLightbox(photo, activePhotos)}
                      style={{
                        width: '100%', height: '65vh',
                        position: 'relative', overflow: 'hidden', cursor: 'none',
                        background: 'var(--dark)', borderRadius: '2px', visibility: 'hidden'
                      }}
                    >
                      <img
                        src={photoUrl}
                        alt={photo.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute', top: '2rem', right: '2rem',
                        fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                        letterSpacing: '.15em', color: 'var(--muted-on-image)'
                      }}>
                        {fmt(idx + 1)}
                      </div>
                    </div>

                    {/* Captions / Text below the centered image */}
                    <div
                      className="ed-content-wrap"
                      style={{
                        width: '100%', maxWidth: '45rem', textAlign: 'center',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem'
                      }}
                    >
                      <div className="fade-text" style={{
                        fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                        letterSpacing: '.25em', textTransform: 'uppercase',
                        color: 'var(--accent)', marginBottom: '0.8rem'
                      }}>
                        {photo.location} — {photo.date || selectedSeries?.year}
                      </div>

                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 500, fontStyle: 'italic', letterSpacing: '-.02em',
                        lineHeight: 1.2, color: 'var(--text)', marginBottom: '1.2rem'
                      }}>
                        {splitTitle(photo.title)}
                      </h3>

                      {photo.writeup && (
                        <p className="reveal-text" style={{
                          fontFamily: 'var(--font-mono)', fontSize: '1.2rem',
                          lineHeight: 1.8, color: 'var(--text)', letterSpacing: '.02em',
                          maxWidth: '38rem'
                        }}>
                          {splitWords(photo.writeup)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              }

              // EDITORIAL LEFT OR RIGHT
              const isLeft = block.type === 'left'
              const { photo } = block
              const photoUrl = urlFor(photo.image).width(1200).quality(85).url()

              return (
                <div
                  key={photo._key || photo._id || idx}
                  className="ed-block"
                  style={{
                    display: 'flex', flexWrap: 'wrap',
                    flexDirection: isLeft ? 'row' : 'row-reverse',
                    alignItems: 'center', justifyContent: 'space-between',
                    gap: '4rem', width: '100%', minHeight: '35rem'
                  }}
                >

                  {/* Image Side */}
                  <div
                    className="ed-image-wrap"
                    onClick={() => openLightbox(photo, activePhotos)}
                    style={{
                      flex: '1 1 30rem', position: 'relative', overflow: 'hidden',
                      height: '42rem', cursor: 'none', background: 'var(--dark)',
                      borderRadius: '2px', visibility: 'hidden'
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={photo.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute', top: '2rem', right: '2rem',
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      letterSpacing: '.15em', color: 'var(--muted-on-image)'
                    }}>
                      {fmt(idx + 1)}
                    </div>
                  </div>

                  {/* Content Side */}
                  <div
                    className="ed-content-wrap"
                    style={{
                      flex: '1 1 24rem', maxWidth: '34rem',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center'
                    }}
                  >
                    <div className="fade-text" style={{
                      fontFamily: 'var(--font-mono)', fontSize: '.65rem',
                      letterSpacing: '.25em', textTransform: 'uppercase',
                      color: 'var(--accent)', marginBottom: '1.2rem'
                    }}>
                      {photo.location} — {photo.date || selectedSeries?.year}
                    </div>

                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                      fontWeight: 500, fontStyle: 'italic', letterSpacing: '-.02em',
                      lineHeight: 1.1, color: 'var(--text)', marginBottom: '1.6rem'
                    }}>
                      {splitTitle(photo.title)}
                    </h3>

                    {photo.writeup && (
                      <p className="reveal-text" style={{
                        fontFamily: 'var(--font-mono)', fontSize: '1.2rem',
                        lineHeight: 1.8, color: 'var(--text)', letterSpacing: '.02em'
                      }}>
                        {splitWords(photo.writeup)}
                      </p>
                    )}
                  </div>

                </div>
              )
            })
          )}
        </div>

        {/* Series detail Footer */}
        <div style={{
          padding: '2.5rem 4rem', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1.5rem'
        }}>
          <button
            onClick={() => {
              setSelectedSeries(null)
              setRenderDetailContent(false)
              if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'instant' })
            }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '.7rem',
              letterSpacing: '.25em', textTransform: 'uppercase',
              background: 'none', border: 'none', color: 'var(--accent)', cursor: 'none'
            }}
          >
            ↑ Back to Top / Series Archive
          </button>

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

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.15em', color: 'var(--muted)' }}>
            WRD Photography © 2026
          </span>
        </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX INTEGRATION */}
      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          photos={lightboxList}
          onClose={closeLightbox}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
        />
      )}
    </div>
  )
}
