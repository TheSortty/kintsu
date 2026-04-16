'use client'
import { useState, useCallback } from 'react'

interface Petal {
  id: number
  x: number
  y: number
  angle: number
}

let petalIdCounter = 0

export function usePetalBurst() {
  const [petals, setPetals] = useState<Petal[]>([])

  const burst = useCallback((x: number, y: number, count = 6) => {
    const newPetals: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: ++petalIdCounter,
      x,
      y,
      angle: (360 / count) * i,
    }))
    setPetals(prev => [...prev, ...newPetals])
    setTimeout(() => {
      const ids = newPetals.map(p => p.id)
      setPetals(prev => prev.filter(p => !ids.includes(p.id)))
    }, 800)
  }, [])

  return { petals, burst }
}

interface PetalBurstProps {
  petals: { id: number; x: number; y: number; angle: number }[]
}

export default function PetalBurst({ petals }: PetalBurstProps) {
  if (petals.length === 0) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
      aria-hidden="true"
    >
      {petals.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: 12,
            height: 12,
            transform: `rotate(${p.angle}deg)`,
            animation: 'petalBurstAnim 0.75s ease-out forwards',
          }}
        >
          <svg viewBox="0 0 12 12" width={12} height={12} xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 0 C5 3 3 4 6 7 C9 4 7 3 6 0Z"
              fill="#F9A8C9"
            />
            <circle cx="6" cy="6" r="1.5" fill="#EC8FAA" />
          </svg>
        </div>
      ))}
    </div>
  )
}
