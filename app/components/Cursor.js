'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const cursorRef = useRef(null)
  const ringRef  = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const ring   = ringRef.current
    if (!cursor || !ring) return

    const onMove = (e) => {
      gsap.to(cursor, { left: e.clientX, top: e.clientY, duration: .08, overwrite: true })
      gsap.to(ring,   { left: e.clientX, top: e.clientY, duration: .22, overwrite: true })
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <div ref={cursorRef} style={{
        position: 'fixed', width: 12, height: 12,
        background: 'var(--cream)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 9999,
        transform: 'translate(-50%,-50%)',
        mixBlendMode: 'difference'
      }}/>
      <div ref={ringRef} style={{
        position: 'fixed', width: 40, height: 40,
        border: '1px solid rgba(240,235,227,.4)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 9998,
        transform: 'translate(-50%,-50%)',
        transition: 'width .3s, height .3s'
      }}/>
    </>
  )
}
