'use client'
import { STATUS_CONFIG } from '@/lib/constants'
import type { TaskStatus } from '@/lib/types'

interface StatusSelectorProps {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
  disabled?: boolean
}

const STATUSES: TaskStatus[] = ['pending', 'in_progress', 'done', 'needs_review']

export default function StatusSelector({ value, onChange, disabled = false }: StatusSelectorProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}
      role="radiogroup"
      aria-label="Seleccionar estado"
    >
      {STATUSES.map(status => {
        const config = STATUS_CONFIG[status]
        const isSelected = value === status
        return (
          <button
            key={status}
            onClick={() => !disabled && onChange(status)}
            disabled={disabled}
            role="radio"
            aria-checked={isSelected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 14px',
              borderRadius: 10,
              border: `1.5px solid ${isSelected ? config.color : '#2C2C2C'}`,
              background: isSelected ? config.bg : 'transparent',
              color: isSelected ? config.textColor : '#9CA3AF',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: isSelected ? 700 : 400,
              opacity: disabled ? 0.5 : 1,
              minHeight: 48,
            }}
          >
            <span style={{ fontSize: 18 }}>{config.icon}</span>
            <span>{config.label}</span>
            {isSelected && (
              <span
                style={{
                  marginLeft: 'auto',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: config.color,
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
