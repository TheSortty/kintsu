'use client'
import { useState } from 'react'
import MemberAvatar from './MemberAvatar'
import PetalBurst, { usePetalBurst } from './PetalBurst'
import type { Subtask, SubtaskProgress } from '@/lib/types'

interface SubtaskListProps {
  subtasks: Subtask[]
  subtaskProgress: SubtaskProgress[]
  currentUser: string | null
  onToggle?: (subtaskId: string, completed: boolean) => Promise<void>
  readOnly?: boolean
}

export default function SubtaskList({
  subtasks,
  subtaskProgress,
  currentUser,
  onToggle,
  readOnly = false,
}: SubtaskListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { petals, burst } = usePetalBurst()

  const isCompletedByUser = (subtaskId: string) =>
    subtaskProgress.some(
      sp => sp.subtask_id === subtaskId && sp.member_name === currentUser && sp.completed
    )

  const whoCompleted = (subtaskId: string) =>
    subtaskProgress
      .filter(sp => sp.subtask_id === subtaskId && sp.completed)
      .map(sp => sp.member_name)

  const handleToggle = async (subtask: Subtask, e: React.MouseEvent) => {
    if (!onToggle || !currentUser || loading || readOnly) return
    const currentlyDone = isCompletedByUser(subtask.id)
    setLoading(subtask.id)
    try {
      await onToggle(subtask.id, !currentlyDone)
      if (!currentlyDone) {
        burst(e.clientX, e.clientY, 5)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <PetalBurst petals={petals} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {subtasks
          .sort((a, b) => a.order_index - b.order_index)
          .map(subtask => {
            const done = isCompletedByUser(subtask.id)
            const who = whoCompleted(subtask.id)
            const isLoading = loading === subtask.id

            return (
              <div
                key={subtask.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 13px',
                  borderRadius: 8,
                  background: done ? 'rgba(16,185,129,0.08)' : '#1A1A1A',
                  border: `1px solid ${done ? 'rgba(16,185,129,0.25)' : '#2E2E2E'}`,
                  transition: 'all 0.2s',
                  cursor: readOnly ? 'default' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
                onClick={(e) => handleToggle(subtask, e)}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${done ? '#10B981' : '#D4AF37'}`,
                    background: done ? '#10B981' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    fontSize: '12px',
                    color: '#0A0A0A',
                    fontWeight: 700,
                  }}
                  aria-hidden="true"
                >
                  {done ? '✓' : ''}
                </div>

                {/* Title */}
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    color: done ? '#9CA3AF' : '#F5F5F5',
                    fontFamily: 'var(--font-body)',
                    textDecoration: done ? 'line-through' : 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {subtask.title}
                </span>

                {/* Who completed */}
                {who.length > 0 && (
                  <div style={{ display: 'flex', gap: -4, marginLeft: 'auto' }}>
                    {who.slice(0, 3).map(name => (
                      <MemberAvatar key={name} name={name} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </>
  )
}
