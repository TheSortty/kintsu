'use client'

interface ProgressBarProps {
  value: number // 0-100
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export default function ProgressBar({
  value,
  showLabel = false,
  size = 'md',
  animate = true,
}: ProgressBarProps) {
  const height = size === 'sm' ? 4 : size === 'lg' ? 10 : 6
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 4,
            fontSize: '12px',
            color: '#D4AF37',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
          }}
        >
          {clamped}%
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          borderRadius: height,
          background: '#1F1F1F',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            borderRadius: height,
            background: 'linear-gradient(90deg, #D4AF37 0%, #F9A8C9 100%)',
            transition: animate ? 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            boxShadow: clamped > 0 ? '0 0 8px #D4AF3766' : 'none',
          }}
        />
      </div>
    </div>
  )
}
