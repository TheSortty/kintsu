'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useTaskProgress } from '@/lib/hooks/useTaskProgress'
import { MEMBERS, STATUS_CONFIG, getMemberConfig } from '@/lib/constants'
import GlobalProgressHeader from '@/components/GlobalProgressHeader'
import StatusBadge from '@/components/StatusBadge'
import MemberAvatar from '@/components/MemberAvatar'
import type { Task, TaskProgress, TaskStatus } from '@/lib/types'

const KANBAN_COLUMNS: TaskStatus[] = ['pending', 'in_progress', 'needs_review', 'done']

type Filter = {
  list: 'all' | 'finde' | 'seniors'
  member: 'all' | string
}

export default function ReviewPage() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const { updateTaskStatus } = useTaskProgress()

  const [tasks, setTasks] = useState<Task[]>([])
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([])
  const [filter, setFilter] = useState<Filter>({ list: 'all', member: 'all' })
  const [copying, setCopying] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const supabase = createSupabaseClient()
    const [{ data: t }, { data: tp }] = await Promise.all([
      supabase.from('tasks').select('*').order('priority'),
      supabase.from('task_progress').select('*'),
    ])
    if (t) setTasks(t)
    if (tp) setTaskProgress(tp)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const getEffectiveStatus = (task: Task): TaskStatus => {
    if (filter.member !== 'all') {
      return taskProgress.find(p => p.task_id === task.id && p.member_name === filter.member)?.status ?? 'pending'
    }
    // For group view: dominant status
    const prog = taskProgress.filter(p => p.task_id === task.id)
    if (prog.length === 0) return 'pending'
    if (prog.every(p => p.status === 'done')) return 'done'
    if (prog.some(p => p.status === 'needs_review')) return 'needs_review'
    if (prog.some(p => p.status === 'in_progress')) return 'in_progress'
    return 'pending'
  }

  const handleApprove = async (task: Task) => {
    if (!user) return
    await updateTaskStatus(task.id, user, 'done', '✓ Aprobado')
    loadData()
  }

  const generateWhatsAppSummary = () => {
    const lines = [
      '🎋 *KINTSU TRACKER — Estado del Equipo*',
      `Fecha: ${new Date().toLocaleDateString('es-AR')}`,
      '',
    ]
    const byStatus: Record<TaskStatus, string[]> = {
      done: [],
      in_progress: [],
      needs_review: [],
      pending: [],
    }
    tasks.forEach(task => {
      const status = getEffectiveStatus(task)
      const emoji = STATUS_CONFIG[status].icon
      byStatus[status].push(`${emoji} ${task.pack_number ? task.pack_number + ' — ' : ''}${task.title}`)
    })
    if (byStatus.done.length) { lines.push('✅ *LISTOS:*'); lines.push(...byStatus.done) }
    if (byStatus.in_progress.length) { lines.push(''); lines.push('⚡ *EN PROGRESO:*'); lines.push(...byStatus.in_progress) }
    if (byStatus.needs_review.length) { lines.push(''); lines.push('👁 *NECESITA REVISIÓN:*'); lines.push(...byStatus.needs_review) }
    if (byStatus.pending.length) { lines.push(''); lines.push('⏳ *PENDIENTE:*'); lines.push(...byStatus.pending) }
    return lines.join('\n')
  }

  const handleCopySummary = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(generateWhatsAppSummary())
      setTimeout(() => setCopying(false), 2000)
    } catch {
      setCopying(false)
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter.list !== 'all' && t.list !== filter.list) return false
    return true
  })

  return (
    <>
      <GlobalProgressHeader taskProgress={taskProgress} />
      <main
        className="page-enter bottom-safe"
        style={{ padding: '16px', paddingTop: 72, position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: '10px', color: '#D4AF37', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
              ⬡ Vista coordinador
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', fontFamily: 'var(--font-body)' }}>
              Revisión
            </h1>
          </div>
          <button
            onClick={handleCopySummary}
            style={{
              background: copying ? '#10B981' : '#111111',
              border: `1px solid ${copying ? '#10B981' : '#D4AF37'}`,
              borderRadius: 10,
              padding: '10px 14px',
              cursor: 'pointer',
              color: copying ? '#0A0A0A' : '#D4AF37',
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
              minHeight: 44,
            }}
          >
            {copying ? '✓ Copiado' : '📋 WhatsApp'}
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {/* List filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'finde', 'seniors'] as const).map(list => (
              <button
                key={list}
                onClick={() => setFilter(f => ({ ...f, list }))}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: `1px solid ${filter.list === list ? '#D4AF37' : '#2C2C2C'}`,
                  background: filter.list === list ? 'rgba(212,175,55,0.1)' : 'transparent',
                  color: filter.list === list ? '#D4AF37' : '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  transition: 'all 0.18s',
                  minHeight: 36,
                }}
              >
                {list === 'all' ? 'Todas' : list === 'finde' ? 'Finde' : 'Seniors'}
              </button>
            ))}
          </div>

          {/* Member filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter(f => ({ ...f, member: 'all' }))}
              style={{
                padding: '6px 10px',
                borderRadius: 20,
                border: `1px solid ${filter.member === 'all' ? '#D4AF37' : '#2C2C2C'}`,
                background: filter.member === 'all' ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: filter.member === 'all' ? '#D4AF37' : '#9CA3AF',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                minHeight: 32,
              }}
            >
              Todos
            </button>
            {MEMBERS.map(m => (
              <button
                key={m.name}
                onClick={() => setFilter(f => ({ ...f, member: f.member === m.name ? 'all' : m.name }))}
                style={{
                  padding: '6px 10px',
                  borderRadius: 20,
                  border: `1px solid ${filter.member === m.name ? m.color : '#2C2C2C'}`,
                  background: filter.member === m.name ? `${m.color}15` : 'transparent',
                  color: filter.member === m.name ? m.color : '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  minHeight: 32,
                  transition: 'all 0.18s',
                }}
              >
                {m.emoji} {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban board - horizontal scroll */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 16,
          }}
        >
          {KANBAN_COLUMNS.map(status => {
            const config = STATUS_CONFIG[status]
            const columnTasks = filteredTasks.filter(t => getEffectiveStatus(t) === status)
            return (
              <div key={status} style={{ minWidth: 220 }}>
                {/* Column header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    background: config.bg,
                    border: `1px solid ${config.color}44`,
                    borderRadius: '10px 10px 0 0',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{config.icon}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '12px', color: config.textColor, textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>
                    {config.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: config.color, fontWeight: 700 }}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        background: '#111111',
                        border: '1px solid #1F1F1F',
                        borderRadius: 10,
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onClick={() => router.push(`/task/${task.id}`)}
                      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#D4AF3744')}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#1F1F1F')}
                    >
                      {task.pack_number && (
                        <span style={{ fontSize: '9px', color: '#D4AF37', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 3 }}>
                          {task.pack_number}
                        </span>
                      )}
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.3 }}>
                        {task.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          color: task.category === 'individual' ? '#D4AF37' : task.category === 'seniors' ? '#F9A8C9' : '#9CA3AF',
                          textTransform: 'uppercase',
                        }}>
                          {task.category}
                        </span>
                        {status !== 'done' && (
                          <button
                            onClick={e => { e.stopPropagation(); handleApprove(task) }}
                            style={{
                              fontSize: '10px',
                              background: 'rgba(16,185,129,0.1)',
                              border: '1px solid rgba(16,185,129,0.4)',
                              borderRadius: 6,
                              padding: '3px 8px',
                              color: '#10B981',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-body)',
                              fontWeight: 700,
                              minHeight: 24,
                            }}
                          >
                            APROBAR ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div style={{ padding: '20px 12px', textAlign: 'center', color: '#2C2C2C', fontSize: '12px', fontFamily: 'var(--font-body)', border: '1px dashed #2C2C2C', borderRadius: 10 }}>
                      Nada aquí
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
