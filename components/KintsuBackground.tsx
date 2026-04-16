'use client'
import { useEffect, useRef } from 'react'

// SVG sakura petal path
const SAKURA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#F9A8C9">
  <path d="M16 2 C14 6 10 8 16 14 C22 8 18 6 16 2Z" opacity="0.9"/>
  <path d="M2 16 C6 14 8 10 14 16 C8 22 6 18 2 16Z" opacity="0.9"/>
  <path d="M30 16 C26 18 24 22 18 16 C24 10 26 14 30 16Z" opacity="0.9"/>
  <path d="M16 30 C18 26 22 24 16 18 C10 24 14 26 16 30Z" opacity="0.9"/>
  <path d="M6 6 C8 10 12 10 14 14 C10 12 6 12 6 6Z" opacity="0.8"/>
  <circle cx="16" cy="16" r="3" fill="#EC8FAA" opacity="0.7"/>
</svg>
`

const SAKURA_DATA_URL = `data:image/svg+xml;base64,${typeof Buffer !== 'undefined' ? Buffer.from(SAKURA_SVG).toString('base64') : ''}`

const CRACKS = [
  // Each path: M startX,startY curves diagonally across screen
  "M -50,120 C 80,80 180,200 280,140 S 450,60 600,180 S 750,280 900,200 S 1050,100 1200,160",
  "M 300,-30 C 320,100 200,200 240,320 S 300,480 200,580 S 100,700 160,800",
  "M -20,400 C 120,360 220,440 320,400 S 500,320 650,400 S 800,480 950,420 S 1100,340 1250,400",
  "M 700,-20 C 680,120 760,220 700,340 S 620,480 680,580 S 740,700 680,820",
]

interface KintsuBackgroundProps {
  intensity?: 'light' | 'normal'
}

export default function KintsuBackground({ intensity = 'normal' }: KintsuBackgroundProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    pathRefs.current.forEach((path, i) => {
      if (!path) return
      const length = path.getTotalLength()
      path.style.strokeDasharray = `${length}`
      path.style.strokeDashoffset = `${length}`
      path.style.animation = `drawCrack ${3.5 + i * 0.5}s ease-in-out ${i * 0.4}s forwards`
    })
  }, [])

  const sakuras = [
    { left: '8%',  delay: '0s',   duration: '18s', size: 24, rotate: 15 },
    { left: '22%', delay: '4s',   duration: '22s', size: 20, rotate: -20 },
    { left: '55%', delay: '2s',   duration: '16s', size: 28, rotate: 30 },
    { left: '75%', delay: '7s',   duration: '20s', size: 18, rotate: -10 },
    { left: '90%', delay: '12s',  duration: '19s', size: 22, rotate: 25 },
  ]

  return (
    <div
      className="kintsu-bg-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Grietas doradas */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {CRACKS.map((d, i) => (
          <path
            key={i}
            ref={el => { pathRefs.current[i] = el }}
            d={d}
            stroke="#D4AF37"
            strokeWidth={intensity === 'light' ? 1 : 1.2}
            fill="none"
            opacity={intensity === 'light' ? 0.2 : 0.3}
            filter="url(#glow)"
          />
        ))}
      </svg>

      {/* Flores sakura flotantes */}
      {sakuras.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.left,
            top: '-40px',
            width: s.size,
            height: s.size,
            opacity: 0,
            animation: `sakuraFall ${s.duration} linear ${s.delay} infinite`,
            transform: `rotate(${s.rotate}deg)`,
          }}
        >
          <svg
            viewBox="0 0 32 32"
            width={s.size}
            height={s.size}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 2 C14 6 10 8 16 14 C22 8 18 6 16 2Z" fill="#F9A8C9" opacity="0.9"/>
            <path d="M2 16 C6 14 8 10 14 16 C8 22 6 18 2 16Z" fill="#F9A8C9" opacity="0.9"/>
            <path d="M30 16 C26 18 24 22 18 16 C24 10 26 14 30 16Z" fill="#F9A8C9" opacity="0.9"/>
            <path d="M16 30 C18 26 22 24 16 18 C10 24 14 26 16 30Z" fill="#F9A8C9" opacity="0.9"/>
            <path d="M6 6 C8 10 12 10 14 14 C10 12 6 12 6 6Z" fill="#F9A8C9" opacity="0.8"/>
            <circle cx="16" cy="16" r="3" fill="#EC8FAA" opacity="0.7"/>
          </svg>
        </div>
      ))}
    </div>
  )
}
