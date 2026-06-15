'use client'
import React, { useRef, useState, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { urlFor } from '@/sanity/lib/image'
import Lightbox from './Lightbox'
import LuxuryTitle, { splitLuxuryTitle } from './LuxuryTitle'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function GalleryPage({ seriesList, initialSeriesId, onClearInitialSeries, aboutData }) {
  const socialInstagram = aboutData?.instagramUrl || 'https://instagram.com'
  const socialFacebook  = aboutData?.facebookUrl  || 'https://facebook.com'
  const socialLinkedin  = aboutData?.linkedinUrl  || 'https://linkedin.com'
  const socialTelegram  = aboutData?.telegramUrl  || 'https://t.me'
  const containerRef = useRef(null)
  const editorialTriggersRef = useRef([]) // ScrollTrigger instances from editorial useEffect

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

  // Helper to split string into individual words for About Page line-by-line reveal
  const splitTitle = (titleText) => splitLuxuryTitle(titleText, 'title-line-inner')

  const [selectedSeries, setSelectedSeries] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [visibleCollectionsCount, setVisibleCollectionsCount] = useState(3)
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
    ].map((fallback, idx) => ({ ...fallback, coverImage: null, order: idx + 1 }))
  }, [seriesList])

  const groupedCollections = useMemo(() => {
    const groups = {}
    const standalone = []

    seriesToUse.forEach((s) => {
      if (s.collection && s.collection._id) {
        const cId = s.collection._id
        if (!groups[cId]) {
          groups[cId] = {
            collection: s.collection,
            series: []
          }
        }
        groups[cId].series.push(s)
      } else {
        standalone.push(s)
      }
    })

    // Sort series inside each collection by order/title
    Object.values(groups).forEach(g => {
      g.series.sort((a, b) => (a.order || 10) - (b.order || 10))
    })

    // Sort collections by their own order
    const sortedGroups = Object.values(groups).sort((a, b) => (a.collection.order || 10) - (b.collection.order || 10))

    return {
      groups: sortedGroups,
      standalone
    }
  }, [seriesToUse])

  const allDirectoryItems = useMemo(() => {
    const items = [...groupedCollections.groups]
    if (groupedCollections.standalone.length > 0) {
      items.push({
        isStandalone: true,
        collection: {
          _id: 'standalone',
          title: 'Standalone Projects',
          description: 'Independent captures and archives.'
        },
        series: groupedCollections.standalone
      })
    }
    return items
  }, [groupedCollections])

  // Handle auto-opening of a series or auto-focusing of a collection when navigating from Featured page
  useEffect(() => {
    if (initialSeriesId) {
      const found = seriesToUse.find(s => s._id === initialSeriesId)
      if (found) {
        setTimeout(() => {
          setRenderDetailContent(false)
          setSelectedSeries(found)
          // Set parent collection active as well
          const foundGroup = groupedCollections.groups.find(g => g.series.some(s => s._id === found._id))
          if (foundGroup) {
            setSelectedCollection(foundGroup)
          } else if (groupedCollections.standalone.some(s => s._id === found._id)) {
            setSelectedCollection({
              collection: { _id: 'standalone', title: 'Standalone Projects', description: 'Independent captures and archives.' },
              series: groupedCollections.standalone
            })
          }
        }, 0)
        window.scrollTo({ top: 0, behavior: 'instant' })
      } else {
        // Find collection and open it
        const groupFound = groupedCollections.groups.find(g => g.collection._id === initialSeriesId)
        if (groupFound) {
          setSelectedCollection(groupFound)
        } else if (initialSeriesId === 'standalone') {
          setSelectedCollection({
            collection: { _id: 'standalone', title: 'Standalone Projects', description: 'Independent captures and archives.' },
            series: groupedCollections.standalone
          })
        }
        setTimeout(() => {
          const scroller = containerRef.current
          if (scroller) {
            scroller.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 100)
      }
      if (onClearInitialSeries) {
        onClearInitialSeries()
      }
    }
  }, [initialSeriesId, seriesToUse, onClearInitialSeries, groupedCollections])

  // Format index helpers
  const fmt = n => n < 10 ? `0${n}` : `${n}`

  const getBentoClass = (index) => {
    const pattern = index % 5
    if (pattern === 0 || pattern === 4) {
      return 'bento-card-wide'
    } else if (pattern === 1) {
      return 'bento-card-tall'
    } else {
      return 'bento-card-square'
    }
  }

  // Get active photos for the selected series
  const activePhotos = selectedSeries
    ? (selectedSeries.photos || [])
    : []

  // ── Compile editorial blocks ──
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

  // Open a series directly with instant view swap + zoom reveal
  function openSeries(series) {
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

    } else {
      // ── GALLERY ENTRANCE & FILTERING ANIMATIONS ──
      timer = setTimeout(() => {
        context.add(() => {
          // If no collection selected, animate directory cards
          if (!selectedCollection) {
            const dirCards = gsap.utils.toArray('.collection-directory-card')
            if (dirCards.length) {
              gsap.fromTo(dirCards,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: 'auto' }
              )
            }
          } else {
            // Animate collection typographic index items
            const rows = gsap.utils.toArray('.index-row-anim')
            if (rows.length) {
              gsap.fromTo(rows,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04, overwrite: 'auto' }
              )
            }
            const introElems = scroller.querySelectorAll('.collection-intro-anim')
            if (introElems.length) {
              gsap.fromTo(introElems,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, overwrite: 'auto' }
              )
            }
          }

          ScrollTrigger.refresh()
        })
      }, 100)

      return () => { clearTimeout(timer) }
    }
  }, { scope: containerRef, dependencies: [selectedSeries, selectedCollection, visibleCollectionsCount], revertOnUpdate: true })

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

  return (
    <div
      ref={containerRef}
      className="page-scroll"
      style={{ background: 'var(--dark)', minHeight: '100vh', color: 'var(--text)' }}
    >
      <style>{`
        /* Option A: Collections Directory styles */
        .collections-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3.5rem;
          width: 100%;
        }
        @media (max-width: 1024px) {
          .collections-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem;
          }
        }
        @media (max-width: 640px) {
          .collections-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .collection-card {
          cursor: none;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          text-decoration: none;
          color: inherit;
        }
        .collection-card-img-wrap {
          aspect-ratio: 3/2;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid var(--border);
          position: relative;
          background: var(--mid);
        }
        .collection-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .collection-card:hover .collection-card-img {
          transform: scale(1.04);
        }

        /* Option C: Typographic Index styles */
        .index-table {
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-top: 2.5rem;
        }
        .index-row {
          display: grid;
          grid-template-columns: 60px 140px 1fr 200px 160px 40px;
          align-items: center;
          padding: 1.5rem 0;
          border-bottom: 1px solid var(--border);
          cursor: none;
          background: transparent;
          border-top: none;
          border-left: none;
          border-right: none;
          text-align: left;
          width: 100%;
          transition: background-color 0.3s, padding-left 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .index-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
          padding-left: 1rem;
        }
        .index-row-arrow {
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .index-row:hover .index-row-arrow {
          transform: translateX(6px);
        }
        .index-row-img-wrap {
          width: 110px;
          aspect-ratio: 3/2;
          overflow: hidden;
          border-radius: 2px;
          border: 1px solid var(--border);
          background: var(--mid);
        }
        .index-row-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mobile-only-meta {
          display: none !important;
        }

        @media (max-width: 1024px) {
          .index-row {
            grid-template-columns: 50px 110px 1fr 180px 40px;
            padding: 1.2rem 0;
          }
          .index-row-img-wrap {
            width: 90px;
          }
          .index-row-camera {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .index-row {
            grid-template-columns: 90px 1fr 30px;
            padding: 1rem 0;
            gap: 1rem;
          }
          .index-row-img-wrap {
            width: 80px;
          }
          .index-row-number,
          .index-row-location,
          .index-row-camera,
          .index-row-desktop-title {
            display: none !important;
          }
          .mobile-only-meta {
            display: block !important;
          }
        }

        /* Floating cursor follow thumbnail */
        .floating-thumbnail {
          display: block;
        }
        @media (max-width: 768px) {
          .floating-thumbnail {
            display: none !important;
          }
        }

        /* Bento grid styles (used in editorial and fallback templates) */
        .bento-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          grid-auto-rows: 24rem !important;
          grid-auto-flow: dense !important;
          gap: 2rem !important;
          width: 100% !important;
        }
        .bento-card-wide {
          grid-column: span 2 !important;
          grid-row: span 1 !important;
        }
        .bento-card-tall {
          grid-column: span 1 !important;
          grid-row: span 2 !important;
          height: 100% !important;
        }
        .bento-card-square {
          grid-column: span 1 !important;
          grid-row: span 1 !important;
        }
        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            grid-auto-rows: 20rem !important;
            gap: 1.5rem !important;
          }
          .bento-card-wide {
            grid-column: span 2 !important;
            grid-row: span 1 !important;
          }
          .bento-card-tall {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
        @media (max-width: 640px) {
          .bento-grid {
            grid-template-columns: 1fr !important;
            grid-auto-rows: 20rem !important;
            gap: 1.2rem !important;
          }
          .bento-card-wide {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
          .bento-card-tall {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>

      {/* ══ LEVEL 1: SERIES EXPLORER ══ */}
      <div style={{ display: !selectedSeries ? 'flex' : 'none', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Spacer to push down past the main site navbar */}
        <div style={{ height: '64px', width: '100%', flexShrink: 0 }} />

        {/* Option A: Collections Landing Directory (when no collection is selected) */}
        {!selectedCollection ? (
          <div style={{ padding: '6rem 4rem 4rem 4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            {/* Page Header */}
            <div style={{ marginBottom: '5rem', width: '100%', textAlign: 'center' }}>
              <h1 className="collection-intro-anim" style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
                fontWeight: 300,
                lineHeight: 1.15,
                color: 'var(--cream)',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                <LuxuryTitle text="Collections" />
              </h1>
              <p className="collection-intro-anim" style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.85rem, 1.4vw, 0.95rem)',
                color: 'var(--text-muted)',
                margin: '0 auto',
                maxWidth: '36rem',
                letterSpacing: '0.02em'
              }}>
                A curated directory of exceptional fine-art photography series.
              </p>
            </div>

            {/* Collections Grid */}
            <div className="collections-grid">
              {allDirectoryItems.slice(0, visibleCollectionsCount).map((item) => {
                const isStandalone = item.isStandalone
                const collectionCover = item.collection.coverImage
                  ? urlFor(item.collection.coverImage).width(800).quality(85).url()
                  : (item.series[0]?.coverImage
                      ? urlFor(item.series[0].coverImage).width(800).quality(85).url()
                      : '')

                return (
                  <button
                    key={item.collection._id}
                    onClick={() => {
                      if (isStandalone) {
                        setSelectedCollection({
                          collection: {
                            _id: 'standalone',
                            title: 'Standalone Projects',
                            description: 'Independent documentary captures and regional archives representing distinct visual essays.'
                          },
                          series: item.series
                        })
                      } else {
                        setSelectedCollection(item)
                      }
                    }}
                    className="collection-card collection-directory-card"
                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                  >
                    <div className="collection-card-img-wrap">
                      {collectionCover ? (
                        <img
                          src={collectionCover}
                          alt={item.collection.title}
                          className="collection-card-img"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                          No Cover Image
                        </div>
                      )}
                      {/* Series count badge */}
                      <div style={{
                        position: 'absolute', top: '1.2rem', right: '1.2rem',
                        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
                        color: 'var(--dark)', background: 'var(--cream)', padding: '4px 10px',
                        borderRadius: '20px', letterSpacing: '0.05em'
                      }}>
                        {item.series.length} {item.series.length === 1 ? 'Series' : 'Series'}
                      </div>
                    </div>

                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-garamond)', fontSize: 'clamp(1.4rem, 2vw, 1.8rem)',
                        fontWeight: 300, color: 'var(--cream)', lineHeight: 1.25,
                        textTransform: 'uppercase', margin: '0 0 0.5rem 0'
                      }}>
                        <LuxuryTitle text={item.collection.title} />
                      </h3>
                      {item.collection.description && (
                        <p style={{
                          fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
                          color: 'var(--text-muted)', margin: 0,
                          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.collection.description}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Load More Button */}
            {allDirectoryItems.length > visibleCollectionsCount && (
              <button
                onClick={() => setVisibleCollectionsCount(prev => prev + 3)}
                className="load-more-btn"
              >
                <span>Load More</span>
                <span className="arrow">→</span>
              </button>
            )}

          </div>
        ) : (
          /* Option C: Collection Typographic Index (when a collection is selected) */
          <div
            style={{ padding: '6rem 4rem 6rem 4rem', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}
          >
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedCollection(null)
                setVisibleCollectionsCount(3)
              }}
              className="collection-intro-anim"
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: 'var(--font-garamond)', fontSize: '1rem', fontWeight: 300,
                color: 'var(--accent)', cursor: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '3.5rem', alignSelf: 'flex-start'
              }}
            >
              <span>←</span> <span>Back to Collections</span>
            </button>

            {/* Collection Title & Intro */}
            <div style={{ marginBottom: '4.5rem', maxWidth: 'none' }}>
              <span className="collection-intro-anim" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '.3em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.8rem'
              }}>{selectedCollection.collection._id === 'standalone' ? 'ARCHIVES /' : 'COLLECTION /'}</span>
              
              <h2 className="collection-intro-anim" style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 300,
                lineHeight: 1.15,
                color: 'var(--cream)',
                marginBottom: '1.2rem',
                textTransform: 'uppercase'
              }}>
                <LuxuryTitle text={selectedCollection.collection.title} />
              </h2>
            </div>

            {/* Typographic Index List */}
            <div className="index-table">
              {selectedCollection.series.map((series, idx) => {
                const cover = series.coverImage
                  ? urlFor(series.coverImage).width(300).quality(80).url()
                  : ''
                return (
                  <button
                    key={series._id}
                    onClick={() => openSeries(series)}
                    className="index-row index-row-anim"
                  >
                    {/* Number */}
                    <span className="index-row-number" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {fmt(idx + 1)}
                    </span>
                    
                    {/* Inline Thumbnail */}
                    <div className="index-row-img-wrap">
                      {cover ? (
                        <img src={cover} alt="" className="index-row-img" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--border)' }} />
                      )}
                    </div>

                    {/* Desktop Title */}
                    <span className="index-row-desktop-title" style={{
                      fontFamily: 'var(--font-garamond)', fontSize: 'clamp(1.4rem, 2.5vw, 2.0rem)',
                      fontWeight: 300, color: 'var(--cream)', textTransform: 'uppercase',
                      letterSpacing: '0.01em'
                    }}>
                      <LuxuryTitle text={series.title} />
                    </span>

                    {/* Mobile stacked title/meta */}
                    <div className="mobile-only-meta" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{
                        fontFamily: 'var(--font-garamond)', fontSize: '1.25rem', fontWeight: 300,
                        color: 'var(--cream)', textTransform: 'uppercase', lineHeight: 1.2
                      }}>
                        <LuxuryTitle text={series.title} />
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)'
                      }}>
                        {series.location} {series.year ? `| ${series.year}` : ''}
                      </span>
                    </div>

                    {/* Location */}
                    <span className="index-row-location" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {series.location || '—'}
                    </span>

                    {/* Camera / Year */}
                    <span className="index-row-camera" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {series.cameraSelect === 'other' ? series.cameraCustom : (series.cameraSelect || series.camera || '—')} {series.year ? `(${series.year})` : ''}
                    </span>

                    {/* Arrow */}
                    <span className="index-row-arrow" style={{ fontSize: '1.5rem', color: 'var(--accent)', justifySelf: 'end' }}>
                      →
                    </span>
                  </button>
                )
              })}
            </div>

          </div>
        )}

        {/* Explorer Footer */}
        <div style={{
          padding: '2.5rem 4rem', marginTop: 'auto', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1.5rem'
        }}>
          <span style={{ fontFamily: 'var(--font-garamond)', fontSize: '13px', fontWeight: 300, letterSpacing: '.15em', color: 'var(--muted)' }}>
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

          <span style={{ fontFamily: 'var(--font-garamond)', fontSize: '13px', fontWeight: 300, letterSpacing: '.15em', color: 'var(--muted)' }}>
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
              fontFamily: 'var(--font-garamond)', fontWeight: 300,
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
                              color: 'var(--text-on-image)', lineHeight: 1.2,
                              fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)'
                            }}>
                              <LuxuryTitle text={photo.title} />
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
              fontFamily: 'var(--font-garamond)', fontSize: '.85rem', fontWeight: 300,
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

          <span style={{ fontFamily: 'var(--font-garamond)', fontSize: '13px', fontWeight: 300, letterSpacing: '.15em', color: 'var(--muted)' }}>
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
