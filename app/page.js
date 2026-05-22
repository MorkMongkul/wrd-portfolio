'use client'
import { useState, useEffect, useRef } from 'react'
import { client } from '@/sanity/lib/client'
import { featuredPhotosQuery, allPhotosQuery, allSeriesQuery, galleryHeroQuery, aboutPageQuery, featurePageCoverQuery } from '@/sanity/lib/queries'
import dynamic from 'next/dynamic'
import Nav from './components/Nav'
import Cursor from './components/Cursor'

const FeaturedPage = dynamic(() => import('./components/FeaturedPage'), { ssr: false })
const GalleryPage  = dynamic(() => import('./components/GalleryPage'),  { ssr: false })
const AboutPage    = dynamic(() => import('./components/AboutPage'),    { ssr: false })


export default function Home() {
  const [activePage, setActivePage]   = useState('featured')
  const [switching, setSwitching]     = useState(false)
  const [featuredPhotos, setFeatured] = useState([])
  const [allPhotos, setAllPhotos]     = useState([])
  const [allSeries, setAllSeries]     = useState([])
  const [galleryHeroImage, setGalleryHeroImage] = useState(null)
  const [aboutData, setAboutData] = useState(null)
  const [featureCoverData, setFeatureCoverData] = useState(null)
  const [initialSeriesId, setInitialSeriesId] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [pageEntered, setPageEntered] = useState(false)

  const introTitleRef = useRef(null)
  const introWrapRef = useRef(null)

  // -------------------------------
  // GSAP INTRO ANIMATION (FIXED)
  // -------------------------------
  const showIntro = !introDone || !dataLoaded

  useEffect(() => {
    if (showIntro) return
    const id = requestAnimationFrame(() => setPageEntered(true))
    return () => cancelAnimationFrame(id)
  }, [showIntro])

  useEffect(() => {
    if (!showIntro) return
    let mounted = true

    ;(async () => {
      const { gsap } = await import('gsap')
      if (!mounted) return

      const textEl = introTitleRef.current
      if (!textEl) return

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const len = (typeof textEl.getComputedTextLength === 'function')
        ? Math.ceil(textEl.getComputedTextLength() * 1.15)
        : 3000

      gsap.set(textEl, {
        strokeDasharray: len,
        strokeDashoffset: len,
        fillOpacity: 0
      })

      const tl = gsap.timeline({
        onComplete: () => {
          if (!mounted) return
          const wrapEl = introWrapRef.current
          if (!wrapEl) {
            setIntroDone(true)
            return
          }
          gsap.to(wrapEl, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out',
            onComplete: () => {
              if (mounted) setIntroDone(true)
            }
          })
        }
      })

      // smooth draw
      tl.to(textEl, {
        strokeDashoffset: 0,
        duration: 3.6,
        ease: 'power1.inOut'
      }, 0.1)

      // fill after a short hold
      tl.to(textEl, {
        fillOpacity: 1,
        strokeWidth: 0,
        duration: 0.9,
        ease: 'power2.out'
      }, '+=0.15')

    })()

    return () => { mounted = false }
  }, [showIntro])

  // -------------------------------
  // FETCH DATA
  // -------------------------------
  useEffect(() => {
    let mounted = true

    async function fetchPhotos() {
      const [featured, all, series, settings, about, featureCover] = await Promise.all([
        client.fetch(featuredPhotosQuery),
        client.fetch(allPhotosQuery),
        client.fetch(allSeriesQuery),
        client.fetch(galleryHeroQuery),
        client.fetch(aboutPageQuery),
        client.fetch(featurePageCoverQuery)
      ])

      if (!mounted) return
      setFeatured(featured)
      setAllPhotos(all)
      setAllSeries(series)
      setGalleryHeroImage(settings?.galleryHeroImage || null)
      setAboutData(about || null)
      setFeatureCoverData(featureCover)
      setDataLoaded(true)
    }

    fetchPhotos()

    return () => { mounted = false }
  }, [])

  // -------------------------------
  // NAVIGATION
  // -------------------------------
  function navigate(target) {
    if (target === activePage || switching) return

    setSwitching(true)

    setTimeout(() => {
      setActivePage(target)
      setSwitching(false)
    }, 400)
  }

  // -------------------------------
  // LOADING SCREEN (FIXED SVG)
  // -------------------------------
  if (showIntro) return (
    <div
      ref={introWrapRef}
      style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg
        width="1000"
        height="140"
        viewBox="0 0 1000 140"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '90vw', maxWidth: '1000px', height: 'auto', overflow: 'visible' }}
      >
        <text
          ref={introTitleRef}
          x="500"
          y="95"
          textAnchor="middle"
          fontFamily="'Inter', sans-serif"
          fontSize="72"
          fontWeight="800"
          letterSpacing="8"
          fill="none"
          stroke="var(--text)"
          strokeWidth="1.5"

          // CRITICAL SMOOTHING FIX
          strokeLinecap="round"
          strokeLinejoin="round"
          shapeRendering="geometricPrecision"
        >
          WRD PHOTOGRAPHY
        </text>
      </svg>
    </div>
  )

  // -------------------------------
  // MAIN UI
  // -------------------------------
  return (
    <>
      <Cursor />
      <Nav activePage={activePage} onNavigate={navigate} />

      <div style={{
        opacity: switching ? 0 : (pageEntered ? 1 : 0),
        transform: pageEntered ? 'translateY(0px)' : 'translateY(10px)',
        transition: 'opacity .6s ease, transform .6s ease'
      }}>
        <div
          key={activePage}
          className={pageEntered ? 'page-clip page-clip--in' : 'page-clip'}
        >
          {activePage === 'featured' && (
            <FeaturedPage
              photos={featuredPhotos}
              coverData={featureCoverData}
              onDiscoverSeries={(seriesId) => {
                setInitialSeriesId(seriesId)
                navigate('gallery')
              }}
            />
          )}
          {activePage === 'gallery'  && (
            <GalleryPage
              photos={allPhotos}
              seriesList={allSeries}
              heroImage={galleryHeroImage}
              initialSeriesId={initialSeriesId}
              onClearInitialSeries={() => setInitialSeriesId(null)}
              aboutData={aboutData}
            />
          )}
          {activePage === 'about'    && (
            <AboutPage
              onNavigate={navigate}
              aboutData={aboutData}
            />
          )}
        </div>
      </div>
    </>
  )
}