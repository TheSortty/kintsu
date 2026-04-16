'use client'
import { STATUS_CONFIG } from '@/lib/constants'
import type { TaskStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: TaskStatus
  pulse?: boolean
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, pulse = false, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const isSmall = size === 'sm'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: 20,
        background: config.bg,
        border: `1px solid ${config.color}44`,
        color: config.textColor,
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        position: 'relative',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: isSmall ? 6 : 7,
          height: isSmall ? 6 : 7,
          borderRadius: '50%',
          background: config.color,
          animation:
            pulse && status === 'in_progress' ? 'statusPulse 1.5s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}
      />
      {config.icon} {config.label}
    </span>
  )
}
