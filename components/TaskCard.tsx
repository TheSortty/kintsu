'use client'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'
import MemberAvatarGroup from './MemberAvatarGroup'
import type { Task, TaskProgress, Subtask, SubtaskProgress } from '@/lib/types'
import { getTaskProgressPercent, getSubtaskProgressPercent } from '@/lib/utils/progress'
import { MEMBERS } from '@/lib/constants'

interface TaskCardProps {
  task: Task
  subtasks?: Subtask[]
  progress?: TaskProgress[]
  subtaskProgress?: SubtaskProgress[]
  currentUser?: string
  compact?: boolean
}

export default function TaskCard({
  task,
  subtasks = [],
  progress = [],
  subtaskProgress = [],
  currentUser,
  compact = false,
}: TaskCardProps) {
  const router = useRouter()

  const myProgress = currentUser
    ? progress.find(p => p.member_name === currentUser)
    : undefined

  const doneNames = progress.filter(p => p.status === 'done').map(p => p.member_name)

  let percent = 0
  if (task.category === 'individual') {
    // For individual tasks: % of 10 members that are done
    percent = getTaskProgressPercent(progress)
  } else {
    // For grupal/seniors: % subtasks completed by anyone
    const mySubDone = subtaskProgress.filter(
      sp => subtasks.some(st => st.id === sp.subtask_id) && sp.completed
    ).length
    // unique subtask_ids completed
    const uniqueDone = new Set(
      subtaskProgress
        .filter(sp => subtasks.some(st => st.id === sp.subtask_id) && sp.completed)
        .map(sp => sp.subtask_id)
    ).size
    percent = getSubtaskProgressPercent(subtasks.length, uniqueDone)
  }

  const myStatus = myProgress?.status ?? 'pending'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/task/${task.id}`)}
      onKeyDown={e => e.key === 'Enter' && router.push(`/task/${task.id}`)}
      style={{
        background: '#111111',
        border: '1px solid #1F1F1F',
        borderRadius: 12,
        padding: compact ? '12px 14px' : '16px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#D4AF3766'
        el.style.boxShadow = '0 4px 20px rgba(212,175,55,0.08)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#1F1F1F'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Gold left accent */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background:
            task.list === 'seniors'
              ? 'linear-gradient(180deg, #F9A8C9, #D4AF37)'
              : 'linear-gradient(180deg, #D4AF37, #C9A84C)',
          borderRadius: '12px 0 0 12px',
        }}
      />

      <div style={{ paddingLeft: 6 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1 }}>
            {task.pack_number && (
              <span
                style={{
                  fontSize: '10px',
                  color: '#D4AF37',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {task.pack_number}
              </span>
            )}
            <h3
              style={{
                margin: 0,
                fontSize: compact ? '13px' : '14px',
                fontWeight: 600,
                color: '#F5F5F5',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.3,
                marginTop: task.pack_number ? 2 : 0,
              }}
            >
              {task.title}
            </h3>
          </div>
          <StatusBadge status={myStatus} size="sm" pulse={myStatus === 'in_progress'} />
        </div>

        {/* Progress */}
        {!compact && (
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={percent} size="sm" />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              {task.category === 'individual' ? (
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
                  {doneNames.length}/{MEMBERS.length} listos
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(percent)}% completado
                </span>
              )}
              {doneNames.length > 0 && <MemberAvatarGroup names={doneNames} max={4} size="sm" />}
            </div>
          </div>
        )}

        {compact && (
          <div style={{ marginTop: 8 }}>
            <ProgressBar value={percent} size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}
