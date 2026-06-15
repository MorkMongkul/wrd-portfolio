'use client'
import React from 'react'

const SCRIPT_WORDS = [
  'the', 'of', 'and', 'for', 'a', 'with', 'to', 'in', 'on', 'by', 'at', 'from',
  'de', 'et', 'la', 'le', 'les', 'l\'', 'd\'', 'du', 'en', 'dans', 'pour', 'avec'
]

/**
 * Checks if a word should be rendered in script font.
 */
export function isScriptWord(word) {
  if (!word) return false
  const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').toLowerCase()
  return SCRIPT_WORDS.includes(cleanWord)
}

/**
 * Static Luxury Title Component.
 * Styles words with serif or script font inline.
 */
export default function LuxuryTitle({ text, style, className }) {
  if (!text) return null

  const words = text.split(' ')

  return (
    <span className={className} style={{ display: 'inline-block', ...style }}>
      {words.map((word, idx) => {
        const script = isScriptWord(word)
        return (
          <span
            key={idx}
            style={{
              fontFamily: script ? 'var(--font-script)' : 'var(--font-garamond)',
              textTransform: script ? 'capitalize' : 'uppercase',
              fontSize: script ? '1.3em' : '1.0em',
              fontWeight: script ? 400 : 300,
              display: 'inline-block',
              marginRight: '0.28em',
              verticalAlign: script ? 'middle' : 'baseline',
              lineHeight: 1.1,
              letterSpacing: script ? 'normal' : '-.01em',
              fontStyle: 'normal'
            }}
          >
            {word}
          </span>
        )
      })}
    </span>
  )
}

/**
 * GSAP-Ready Splitting Function.
 * Wraps each word in an overflow-hidden container for slide-up animations,
 * while maintaining the correct serif/script typography styles.
 */
export function splitLuxuryTitle(titleText, animationClass = 'title-line-inner') {
  if (!titleText) return null

  const words = titleText.split(' ')

  return words.map((word, index) => {
    const script = isScriptWord(word)

    return (
      <span
        key={index}
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          marginRight: '0.3em',
          lineHeight: script ? '1.0' : '1.15',
          paddingTop: script ? '0.25em' : '0px',
          paddingBottom: script ? '0.1em' : '0.25em',
          marginTop: script ? '-0.25em' : '0px',
          marginBottom: script ? '-0.1em' : '-0.25em'
        }}
      >
        <span
          className={animationClass}
          style={{
            display: 'inline-block',
            transform: 'translateY(110%)',
            willChange: 'transform',
            fontFamily: script ? 'var(--font-script)' : 'var(--font-garamond)',
            textTransform: script ? 'capitalize' : 'uppercase',
            fontSize: script ? '1.35em' : '1.0em',
            fontWeight: script ? 400 : 300,
            lineHeight: script ? 0.9 : 1.1,
            verticalAlign: script ? 'middle' : 'baseline',
            fontStyle: 'normal',
            letterSpacing: script ? 'normal' : '-.01em'
          }}
        >
          {word}
        </span>
      </span>
    )
  })
}
