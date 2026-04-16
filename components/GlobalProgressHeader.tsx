'use client'
import { useRouter } from 'next/navigation'
import MemberAvatar from './MemberAvatar'
import ProgressBar from './ProgressBar'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { MEMBERS } from '@/lib/constants'
import type { TaskProgress } from '@/lib/types'
import { getGlobalPercent, getMemberTotalPercent } from '@/lib/utils/progress'

interface GlobalProgressHeaderProps {
  taskProgress: TaskProgress[]
  tasks?: Task[]
  activeCount?: number
  globalPctFixed?: number
}

export default function GlobalProgressHeader({
  taskProgress,
  tasks,
  activeCount = 0,
  globalPctFixed,
}: GlobalProgressHeaderProps) {
  const router = useRouter()
  const { user } = useCurrentUser()
  const globalPct = globalPctFixed !== undefined ? globalPctFixed : getGlobalPercent(taskProgress, tasks)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1F1F1F',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => router.push('/dashboard')}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            color: '#D4AF37',
            letterSpacing: '0.05em',
          }}
        >
          金継ぎ
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '16px',
            color: '#F5F5F5',
            letterSpacing: '0.12em',
          }}
        >
          KINTSU
        </span>
      </div>

      {/* Global progress */}
      <div style={{ flex: 1, maxWidth: 200 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
            Kintsu al
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#D4AF37',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            {globalPct}% ✨
          </span>
        </div>
        <ProgressBar value={globalPct} size="sm" />
      </div>

      {/* User avatar + active count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {activeCount > 0 && (
          <span
            style={{
              fontSize: '11px',
              color: '#10B981',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(16,185,129,0.1)',
              padding: '2px 8px',
              borderRadius: 20,
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            {activeCount} activos
          </span>
        )}
        {user && (
          <MemberAvatar
            name={user}
            size="sm"
            onClick={() => router.push(`/member/${user}`)}
          />
        )}
      </div>
    </header>
  )
}
