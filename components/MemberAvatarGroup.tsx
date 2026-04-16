'use client'
import MemberAvatar from './MemberAvatar'
import { getMemberConfig } from '@/lib/constants'

interface MemberAvatarGroupProps {
  names: string[]
  max?: number
  size?: 'sm' | 'md'
}

export default function MemberAvatarGroup({
  names,
  max = 5,
  size = 'sm',
}: MemberAvatarGroupProps) {
  const visible = names.slice(0, max)
  const overflow = names.length - max

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((name, i) => {
        const config = getMemberConfig(name)
        return (
          <div
            key={name}
            style={{
              marginLeft: i === 0 ? 0 : -8,
              zIndex: visible.length - i,
              border: '2px solid #111111',
              borderRadius: '50%',
            }}
          >
            <MemberAvatar name={name} size={size} />
          </div>
        )
      })}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#1F1F1F',
            border: '2px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#D4AF37',
            fontWeight: 700,
            zIndex: 0,
            fontFamily: 'var(--font-mono)',
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
