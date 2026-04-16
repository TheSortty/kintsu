'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MEMBERS } from '@/lib/constants'
import type { MemberConfig } from '@/lib/types'

export default function WelcomePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [animating, setAnimating] = useState<string | null>(null)

  const handleSelect = async (member: MemberConfig) => {
    if (animating) return
    setAnimating(member.name)
    setSelected(member.name)

    // Save to localStorage
    localStorage.setItem('kintsu_user', member.name)

    // Short delay for animation
    await new Promise(r => setTimeout(r, 600))
    router.replace('/dashboard')
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Logo */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 40,
          animation: 'fadeIn 0.8s ease-out',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            border: '1px solid #EC8FAA',
            padding: '8px 20px',
            borderRadius: 4,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              color: '#D4AF37',
              letterSpacing: '0.1em',
            }}
          >
            金継ぎ
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '36px',
            color: '#F5F5F5',
            letterSpacing: '0.2em',
            marginBottom: 8,
          }}
        >
          KINTSU
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: '#9CA3AF',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          3er Fin de Semana · Graduación
        </p>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            color: '#F5F5F5',
            fontWeight: 300,
          }}
        >
          ¿Quién sos?
        </p>
      </div>

      {/* Member grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          width: '100%',
          maxWidth: 420,
          animation: 'fadeIn 0.6s ease-out 0.2s both',
        }}
      >
        {MEMBERS.map((member, i) => {
          const isSelected = selected === member.name
          const isAnimating = animating === member.name

          return (
            <button
              key={member.name}
              id={`member-${member.name.toLowerCase()}`}
              onClick={() => handleSelect(member)}
              aria-label={`Seleccionar ${member.name}`}
              style={{
                background: isSelected
                  ? `${member.color}20`
                  : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${isSelected ? member.color : '#2C2C2C'}`,
                borderRadius: 14,
                padding: '18px 16px',
                cursor: animating ? 'wait' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.25s',
                animation: isAnimating ? 'scaleBounce 0.5s ease-out' : `fadeIn 0.4s ease-out ${i * 0.06}s both`,
                minHeight: 80,
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isSelected ? `0 0 20px ${member.color}44` : 'none',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  const el = e.currentTarget
                  el.style.borderColor = member.color
                  el.style.background = `${member.color}15`
                  el.style.transform = 'scale(1.04)'
                  el.style.boxShadow = `0 0 12px ${member.color}33`
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  const el = e.currentTarget
                  el.style.borderColor = '#2C2C2C'
                  el.style.background = 'rgba(255,255,255,0.03)'
                  el.style.transform = 'scale(1)'
                  el.style.boxShadow = 'none'
                }
              }}
            >
              {/* Emoji */}
              <span style={{ fontSize: 28, lineHeight: 1 }}>{member.emoji}</span>

              {/* Initial */}
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: member.color,
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1,
                }}
              >
                {member.name.charAt(0)}
              </span>

              {/* Name */}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#F5F5F5',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {member.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Footer quote */}
      <p
        style={{
          marginTop: 40,
          maxWidth: 360,
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '11px',
          color: '#4B4B4B',
          lineHeight: 1.6,
          animation: 'fadeIn 0.6s ease-out 0.5s both',
        }}
      >
        "Somos protagonistas distintos por naturaleza, consecuentes y preparados para
        desafiarnos sin límites transformando al mundo hacia el compromiso de vivir."
      </p>
    </main>
  )
}
