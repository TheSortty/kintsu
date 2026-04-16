'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useTaskProgress } from '@/lib/hooks/useTaskProgress'
import { MEMBERS, STATUS_CONFIG, getMemberConfig } from '@/lib/constants'
import { timeAgo, getSubtaskProgressPercent } from '@/lib/utils/progress'
import GlobalProgressHeader from '@/components/GlobalProgressHeader'
import StatusBadge from '@/components/StatusBadge'
import StatusSelector from '@/components/StatusSelector'
import SubtaskList from '@/components/SubtaskList'
import CommentFeed from '@/components/CommentFeed'
import ProgressBar from '@/components/ProgressBar'
import MemberAvatar from '@/components/MemberAvatar'
import PetalBurst, { usePetalBurst } from '@/components/PetalBurst'
import type { Task, Subtask, TaskProgress, SubtaskProgress, TaskComment, TaskStatus } from '@/lib/types'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useCurrentUser()
  const { updateTaskStatus, updateSubtaskCompleted, addComment } = useTaskProgress()
  const { petals, burst } = usePetalBurst()

  const [task, setTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([])
  const [subtaskProgress, setSubtaskProgress] = useState<SubtaskProgress[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const myProgress = taskProgress.find(p => p.member_name === user)
  const myStatus: TaskStatus = myProgress?.status ?? 'pending'

  const loadData = useCallback(async () => {
    if (!id) return
    const supabase = createSupabaseClient()
    const [{ data: t }, { data: st }, { data: tp }, { data: sp }, { data: tc }] =
      await Promise.all([
        supabase.from('tasks').select('*').eq('id', id).single(),
        supabase.from('subtasks').select('*').eq('task_id', id).order('order_index'),
        supabase.from('task_progress').select('*').eq('task_id', id),
        supabase.from('subtask_progress').select('*'),
        supabase.from('task_comments').select('*').eq('task_id', id).order('created_at', { ascending: false }),
      ])
    if (t) {
      setTask(t)
    }
    if (st) setSubtasks(st)
    if (tp) {
      setTaskProgress(tp)
      const mine = tp.find((p: TaskProgress) => p.member_name === user)
      if (mine?.notes) setNotes(mine.notes)
    }
    if (sp) setSubtaskProgress(sp)
    if (tc) setComments(tc)
    setLoading(false)
  }, [id, user])

  useEffect(() => { loadData() }, [loadData])

  // Realtime subscription
  useEffect(() => {
    if (!id) return
    const supabase = createSupabaseClient()
    const channel = supabase
      .channel(`task-detail-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_progress', filter: `task_id=eq.${id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtask_progress' }, loadData)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${id}` }, loadData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, loadData])

  const handleSave = async (e: React.MouseEvent) => {
    if (!user || !task) return
    setSaving(true)
    try {
      await updateTaskStatus(task.id, user, myStatus, notes)
      if (myStatus === 'done') {
        burst(e.clientX, e.clientY, 10)
      }
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (status: TaskStatus) => {
    if (!user || !task) return
    setSaving(true)
    try {
      await updateTaskStatus(task.id, user, status, notes)
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    if (!user) return
    await updateSubtaskCompleted(subtaskId, user, completed)
    await loadData()
  }

  const handleComment = async (content: string) => {
    if (!user || !task) return
    await addComment(task.id, user, content)
    await loadData()
  }

  const taskSubtasks = subtasks
  const doneSubs = new Set(
    subtaskProgress.filter(sp => taskSubtasks.some(ts => ts.id === sp.subtask_id) && sp.completed).map(sp => sp.subtask_id)
  ).size
  const subtaskPct = getSubtaskProgressPercent(taskSubtasks.length, doneSubs)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#D4AF37', opacity: 0.6 }}>金継ぎ</span>
      </div>
    )
  }

  if (!task) {
    return (
      <div style={{ padding: 24, color: '#F5F5F5', fontFamily: 'var(--font-body)' }}>
        Tarea no encontrada.{' '}
        <button onClick={() => router.back()} style={{ color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}>
          Volver
        </button>
      </div>
    )
  }

  return (
    <>
      <PetalBurst petals={petals} />
      <GlobalProgressHeader taskProgress={[]} />

      <main
        className="page-enter"
        style={{ padding: '16px', paddingTop: 72, paddingBottom: 88, position: 'relative', zIndex: 1 }}
      >
        {/* Back + header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => router.back()}
            aria-label="Volver"
            style={{
              background: '#111111',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#9CA3AF',
              fontSize: '16px',
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <div>
            {task.pack_number && (
              <span style={{ fontSize: '10px', color: '#D4AF37', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {task.pack_number}
              </span>
            )}
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F5', fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>
              {task.title}
            </h1>
          </div>
        </div>

        {task.description && (
          <p style={{ fontSize: '13px', color: '#C0C0C0', lineHeight: 1.6, marginBottom: 20, fontFamily: 'var(--font-body)', background: '#181818', border: '1px solid #2A2A2A', borderRadius: 10, padding: '12px 14px' }}>
            {task.description}
          </p>
        )}

        {/* Progress */}
        <div style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>PROGRESO GENERAL</span>
            <span style={{ fontSize: '14px', color: '#D4AF37', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{subtaskPct}%</span>
          </div>
          <ProgressBar value={subtaskPct} size="md" />
        </div>

        {/* MY UPDATE (individual & seniors) */}
        {(task.category === 'individual' || task.category === 'seniors') && user && (
          <section style={{ marginBottom: 24 }}>
            <p className="section-title">MI ACTUALIZACIÓN</p>
            <div style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              <StatusSelector
                value={myStatus}
                onChange={handleStatusChange}
                disabled={saving}
              />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="¿Cómo vas? Contale al equipo..."
                rows={3}
                aria-label="Notas personales"
                style={{
                  width: '100%',
                  background: '#111111',
                  border: '1px solid #333',
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: '#EFEFEF',
                  fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  resize: 'vertical',
                  outline: 'none',
                  marginTop: 12,
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#D4AF37')}
                onBlur={e => (e.target.style.borderColor = '#333')}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '13px',
                  borderRadius: 10,
                  background: saving ? '#252525' : '#D4AF37',
                  color: saving ? '#9CA3AF' : '#0A0A0A',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.08em',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  minHeight: 48,
                  transition: 'all 0.2s',
                  boxShadow: saving ? 'none' : '0 4px 16px rgba(212,175,55,0.3)',
                }}
              >
                {saving ? 'Guardando...' : 'GUARDAR'}
              </button>
            </div>
          </section>
        )}

        {/* SUBTASKS */}
        {taskSubtasks.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <p className="section-title">SUBTAREAS ({doneSubs}/{taskSubtasks.length})</p>
            <SubtaskList
              subtasks={taskSubtasks}
              subtaskProgress={subtaskProgress}
              currentUser={user}
              onToggle={handleSubtaskToggle}
              readOnly={!user}
            />
          </section>
        )}

        {/* TEAM STATUS (individual tasks only) — 2-col grid */}
        {task.category === 'individual' && (
          <section style={{ marginBottom: 24 }}>
            <p className="section-title">ESTADO DEL EQUIPO</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {MEMBERS.map(member => {
                const prog = taskProgress.find(p => p.member_name === member.name)
                const status: TaskStatus = prog?.status ?? 'pending'
                const config = getMemberConfig(member.name)
                return (
                  <div
                    key={member.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      background: '#181818',
                      border: `1px solid #2A2A2A`,
                      borderLeft: `3px solid ${config.color}`,
                      borderRadius: 8,
                    }}
                  >
                    <MemberAvatar name={member.name} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#EFEFEF', fontFamily: 'var(--font-body)', display: 'block' }}>
                        {member.name}{member.name === user ? ' 👤' : ''}
                      </span>
                      <StatusBadge status={status} size="sm" pulse={status === 'in_progress'} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* COMMENT FEED */}
        <section>
          <p className="section-title">HISTORIAL</p>
          <div style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <CommentFeed
              comments={comments}
              progress={taskProgress}
              currentUser={user}
              onComment={handleComment}
            />
          </div>
        </section>
      </main>
    </>
  )
}
