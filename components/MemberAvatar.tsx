'use client'
import { getMemberConfig } from '@/lib/constants'

interface MemberAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  showEmoji?: boolean
  onClick?: () => void
  className?: string
}

const SIZE_MAP = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 80,
}

const FONT_MAP = {
  sm: '11px',
  md: '15px',
  lg: '20px',
  xl: '28px',
}

export default function MemberAvatar({
  name,
  size = 'md',
  showName = false,
  showEmoji = false,
  onClick,
  className = '',
}: MemberAvatarProps) {
  const config = getMemberConfig(name)
  const px = SIZE_MAP[size]
  const fontSize = FONT_MAP[size]
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={name}
    >
      <div
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          background: `${config.color}22`,
          border: `2px solid ${config.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: fontSize,
          fontWeight: 700,
          color: config.color,
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
          transition: 'transform 0.2s, box-shadow 0.2s',
          fontFamily: 'var(--font-body)',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseEnter={e => {
          if (onClick) {
            ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.08)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 12px ${config.color}66`
          }
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {showEmoji ? config.emoji : initial}
      </div>
      {showName && (
        <span
          style={{
            fontSize: '11px',
            color: '#9CA3AF',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
      )}
    </div>
  )
}
