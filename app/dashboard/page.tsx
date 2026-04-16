'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useRealtimeTasks } from '@/lib/hooks/useRealtimeTasks'
import { useRealtimeToasts } from '@/components/RealtimeToast'
import { MEMBERS, getMemberConfig, STATUS_CONFIG } from '@/lib/constants'
import {
  getGlobalPercent, getMemberPercent, getMemberPendingCount,
  getSubtaskProgressPercent, getSubtaskRemainingCount,
} from '@/lib/utils/progress'
import GlobalProgressHeader from '@/components/GlobalProgressHeader'
import MemberAvatar from '@/components/MemberAvatar'
import ProgressBar from '@/components/ProgressBar'
import StatusBadge from '@/components/StatusBadge'
import RealtimeToast from '@/components/RealtimeToast'
import ActivityFeed from '@/components/ActivityFeed'
import type { Task, Subtask, SubtaskProgress, TaskStatus } from '@/lib/types'

type TabKey = 'board' | 'equipo'

const BOARD_COLUMNS: { key: 'individual' | 'grupal' | 'seniors'; label: string; emoji: string; accent: string }[] = [
  { key: 'individual', label: 'Mis Packs',  emoji: '🎒', accent: '#D4AF37' },
  { key: 'grupal',     label: 'Grupales',   emoji: '🤝', accent: '#F9A8C9' },
  { key: 'seniors',    label: 'Seniors',    emoji: '🎭', accent: '#A855F7' },
]

// ─── TRELLO CARD with summary ────────────────────────────────────
function TrelloCard({
  task, subtasks, subtaskProgress, taskProgress, currentUser, onClick,
}: {
  task: Task
  subtasks: any[]
  subtaskProgress: any[]
  taskProgress: any[]
  currentUser: string | null
  onClick: () => void
}) {
  const myProgress = taskProgress.find((p: any) => p.member_name === currentUser && p.task_id === task.id)
  const myStatus: TaskStatus = myProgress?.status ?? 'pending'

  // My subtask progress (or Team if grupal)
  const isGrupal = task.category === 'grupal'
  const myDone = new Set(
    subtaskProgress
      .filter((sp: any) => {
        if (!subtasks.some((s: any) => s.id === sp.subtask_id) || !sp.completed) return false
        if (isGrupal) return true
        return sp.member_name === currentUser
      })
      .map((sp: any) => sp.subtask_id)
  ).size
  const pct = getSubtaskProgressPercent(subtasks.length, myDone)
  const remaining = subtasks.length - myDone

  let effectiveStatus = myStatus
  if (isGrupal) {
    if (subtasks.length > 0 && remaining === 0) effectiveStatus = 'done'
    else if (myDone > 0) effectiveStatus = 'in_progress'
  }

  const cfg = STATUS_CONFIG[effectiveStatus]

  const pillDanger = myDone < subtasks.length / 2;
  const pillColor = pillDanger ? '#EF4444' : '#D4AF37';
  const pillBg = pillDanger ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.1)';
  const pillBorder = pillDanger ? 'rgba(239,68,68,0.25)' : 'rgba(212,175,55,0.25)';

  // Team completion (all members done)
  const doneMembers = taskProgress.filter((p: any) => p.task_id === task.id && p.status === 'done').length
  const totalMembers = task.category === 'individual' ? MEMBERS.length : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        background: '#1C1C1C',
        border: `1px solid #2A2A2A`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        marginBottom: 8,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 6px 20px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.color}44`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <div style={{ flex: 1 }}>
          {task.pack_number && (
            <span style={{ fontSize: '9px', color: cfg.color, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: 2 }}>
              {task.pack_number}
            </span>
          )}
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#EFEFEF', fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>
            {task.title}
          </p>
        </div>
        {/* Status dot */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 3,
          boxShadow: effectiveStatus === 'in_progress' ? `0 0 8px ${cfg.color}` : 'none',
        }} />
      </div>

      {/* Description excerpt */}
      {task.description && (
        <p style={{
          fontSize: '11px', color: '#7A7A7A', fontFamily: 'var(--font-body)',
          lineHeight: 1.5, overflow: 'hidden',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div>
          <div style={{ height: 3, borderRadius: 3, background: '#2A2A2A', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: pct === 100 ? '#10B981' : `linear-gradient(90deg, ${cfg.color} 0%, #F9A8C9 100%)`,
              borderRadius: 3, transition: 'width 0.5s',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#5A5A5A', fontFamily: 'var(--font-mono)' }}>
              {myDone}/{subtasks.length} ítems
            </span>
            {/* REMAINING badge */}
            {remaining > 0 ? (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: pillColor,
                background: pillBg,
                border: `1px solid ${pillBorder}`,
                borderRadius: 20, padding: '1px 7px',
              }}>
                {remaining} por hacer
              </span>
            ) : (
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: '#10B981', background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '1px 7px',
              }}>
                ✓ Completo
              </span>
            )}
          </div>
          {/* Team completion if individual */}
          {totalMembers !== null && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ flex: 1, height: 2, borderRadius: 2, background: '#222', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.round((doneMembers / totalMembers) * 100)}%`,
                  background: '#10B981', borderRadius: 2, transition: 'width 0.5s',
                }} />
              </div>
              <span style={{ fontSize: '9px', color: '#5A5A5A', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {doneMembers}/{totalMembers} 👥
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<TabKey>('board')
  const [tasks, setTasks] = useState<Task[]>([])
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [subtaskProgress, setSubtaskProgress] = useState<SubtaskProgress[]>([])
  const [dbTaskProgress, setDbTaskProgress] = useState<TaskProgress[]>([])
  const [loading, setLoading] = useState(true)

  const { toasts, addToast, dismiss } = useRealtimeToasts()
  const { taskProgress } = useRealtimeTasks(
    useCallback((event) => {
      if (event.type === 'task_progress' && event.member_name !== user) {
        const task = tasks.find(t => t.id === event.task_id)
        if (task) addToast({ memberName: event.member_name, taskTitle: task.title, status: event.status as any })
      }
    }, [tasks, user, addToast])
  )

  useEffect(() => {
    if (isLoaded && !user) router.replace('/welcome')
  }, [isLoaded, user, router])

  useEffect(() => {
    const stored = localStorage.getItem('kintsu_last_tab')
    if (stored === 'equipo' || stored === 'board') setActiveTab(stored as TabKey)
  }, [])

  useEffect(() => {
    const load = async () => {
      const supabase = createSupabaseClient()
      const [{ data: t }, { data: st }, { data: sp }, { data: tp }] = await Promise.all([
        supabase.from('tasks').select('*').order('priority'),
        supabase.from('subtasks').select('*').order('order_index'),
        supabase.from('subtask_progress').select('*'),
        supabase.from('task_progress').select('*'),
      ])
      if (t) setTasks(t)
      if (st) setSubtasks(st)
      if (sp) setSubtaskProgress(sp)
      if (tp) setDbTaskProgress(tp)
      setLoading(false)
    }
    load()
  }, [])

  const mergedTaskProgress = [...dbTaskProgress]
  for (const p of taskProgress) {
    const idx = mergedTaskProgress.findIndex(x => x.task_id === p.task_id && x.member_name === p.member_name)
    if (idx >= 0) mergedTaskProgress[idx] = p
    else mergedTaskProgress.push(p)
  }

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab)
    localStorage.setItem('kintsu_last_tab', tab)
  }

  if (!isLoaded || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#D4AF37', opacity: 0.6 }}>金継ぎ</span>
      </div>
    )
  }

  // Completud real: cuántas tareas × miembros quedan
  const indSenTasks = tasks.filter(t => t.category === 'individual' || t.category === 'seniors')
  const totalExpected = indSenTasks.length * MEMBERS.length + tasks.filter(t => t.category === 'grupal').length
  const totalDone = mergedTaskProgress.filter(p => {
    const task = tasks.find(t => t.id === p.task_id)
    return task && (task.category === 'individual' || task.category === 'seniors') && p.status === 'done'
  }).length + tasks.filter(t => {
    if (t.category !== 'grupal') return false;
    const subs = subtasks.filter(s => s.task_id === t.id)
    if (subs.length === 0) return mergedTaskProgress.some(p => p.task_id === t.id && p.status === 'done')
    const doneSubs = new Set(subtaskProgress.filter(sp => subs.some(s => s.id === sp.subtask_id) && sp.completed).map(sp => sp.subtask_id)).size
    return doneSubs === subs.length
  }).length
  const totalPending = totalExpected - totalDone

  let globalPct = 0
  if (totalExpected > 0) {
    const rawPct = (totalDone / totalExpected) * 100
    globalPct = rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct)
  }

  return (
    <>
      <GlobalProgressHeader taskProgress={mergedTaskProgress} globalPctFixed={globalPct} />
      <RealtimeToast toasts={toasts} onDismiss={dismiss} />

      <main style={{ paddingTop: 56, minHeight: '100dvh', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* ── Tab bar ── */}
        <div style={{
          display: 'flex', gap: 4, padding: '12px 16px 0',
          borderBottom: '1px solid #222',
          background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(8px)',
          position: 'sticky', top: 56, zIndex: 50,
        }}>
          {([
            { key: 'board', icon: '⬛', label: 'Tablero' },
            { key: 'equipo', icon: '◎', label: 'Equipo' },
          ] as { key: TabKey; icon: string; label: string }[]).map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => switchTab(tab.key)}
              style={{
                padding: '8px 16px 10px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #D4AF37' : '2px solid transparent',
                background: activeTab === tab.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                color: activeTab === tab.key ? '#D4AF37' : '#6B7280',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 6,
                minHeight: 44,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            {totalPending > 0 && (() => {
              const pillDanger = totalDone < (totalExpected / 2);
              const pillColor = pillDanger ? '#EF4444' : '#D4AF37';
              const pillBg = pillDanger ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.1)';
              const pillBorder = pillDanger ? 'rgba(239,68,68,0.25)' : 'rgba(212,175,55,0.25)';
              return (
                <span style={{
                  fontSize: '11px', color: pillColor, fontFamily: 'var(--font-mono)',
                  fontWeight: 700, background: pillBg,
                  padding: '3px 9px', borderRadius: 20, border: `1px solid ${pillBorder}`,
                }}>
                  {totalPending} por hacer
                </span>
              )
            })()}
            <span style={{
              fontSize: '12px', color: globalPct === 100 ? '#10B981' : '#D4AF37',
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              background: globalPct === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(212,175,55,0.1)',
              padding: '4px 10px', borderRadius: 20,
              border: `1px solid ${globalPct === 100 ? 'rgba(16,185,129,0.25)' : 'rgba(212,175,55,0.25)'}`,
            }}>
              {globalPct === 100 ? '✨ ¡100%!' : `✨ ${globalPct}%`}
            </span>
          </div>
        </div>

        {/* ── BOARD TAB ── */}
        {activeTab === 'board' && !loading && (
          <div style={{
            display: 'flex', gap: 12, padding: '16px',
            overflowX: 'auto', flex: 1, alignItems: 'flex-start', paddingBottom: 80,
          }}>
            {BOARD_COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.category === col.key)
              const myDoneTasks = colTasks.filter(t => {
                if (col.key === 'individual' || col.key === 'seniors') {
                  return mergedTaskProgress.some(p => p.task_id === t.id && p.member_name === user && p.status === 'done')
                }
                const subs = subtasks.filter(s => s.task_id === t.id)
                const done = new Set(subtaskProgress.filter(sp => subs.some(s => s.id === sp.subtask_id) && sp.completed).map(sp => sp.subtask_id)).size
                return subs.length > 0 && done === subs.length
              }).length

              // Total subtasks remaining in this column (for current user)
              const colSubsRemaining = colTasks.reduce((acc, task) => {
                const subs = subtasks.filter(s => s.task_id === task.id)
                return acc + getSubtaskRemainingCount(subs, subtaskProgress, user)
              }, 0)

              return (
                <div key={col.key} style={{ minWidth: 300, width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Column header */}
                  <div style={{
                    background: '#181818',
                    border: `1px solid #2A2A2A`,
                    borderTop: `3px solid ${col.accent}`,
                    borderRadius: '10px 10px 0 0',
                    padding: '12px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{col.emoji}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', color: '#F0F0F0' }}>
                        {col.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {colSubsRemaining > 0 && (
                        <span style={{
                          fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: '#EF4444', background: 'rgba(239,68,68,0.1)',
                          padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(239,68,68,0.2)',
                        }}>
                          -{colSubsRemaining}
                        </span>
                      )}
                      <span style={{
                        fontSize: '11px', fontFamily: 'var(--font-mono)', color: col.accent, fontWeight: 700,
                        background: `${col.accent}18`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${col.accent}33`,
                      }}>
                        {myDoneTasks}/{colTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards scroll */}
                  <div style={{
                    background: '#141414', border: '1px solid #2A2A2A', borderTop: 'none',
                    borderRadius: '0 0 10px 10px', padding: '10px 10px 6px',
                    maxHeight: 'calc(100vh - 200px)', overflowY: 'auto',
                  }}>
                    {colTasks.length === 0 && (
                      <div style={{
                        padding: '20px 10px', textAlign: 'center', color: '#3A3A3A',
                        fontSize: '12px', fontFamily: 'var(--font-body)',
                        border: '1px dashed #2A2A2A', borderRadius: 8,
                      }}>Sin tareas aún</div>
                    )}
                    {colTasks.map(task => (
                      <TrelloCard
                        key={task.id}
                        task={task}
                        subtasks={subtasks.filter(s => s.task_id === task.id)}
                        subtaskProgress={subtaskProgress}
                        taskProgress={mergedTaskProgress.filter(p => p.task_id === task.id)}
                        currentUser={user}
                        onClick={() => router.push(`/task/${task.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
            
            {/* Actividad column */}
            <div style={{ minWidth: 280, width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                background: '#181818',
                border: `1px solid #2A2A2A`,
                borderTop: `3px solid #10B981`,
                borderRadius: '10px 10px 0 0',
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', color: '#F0F0F0' }}>
                  Actividad
                </span>
              </div>
              <div style={{
                background: '#141414', border: '1px solid #2A2A2A', borderTop: 'none',
                borderRadius: '0 0 10px 10px', padding: '10px 10px 6px',
                maxHeight: 'calc(100vh - 200px)', overflowY: 'auto',
              }}>
                <ActivityFeed tasks={tasks} />
              </div>
            </div>
          </div>
        )}

        {/* ── EQUIPO TAB ── */}
        {activeTab === 'equipo' && !loading && (
          <div style={{ padding: '16px', paddingBottom: 80, animation: 'fadeIn 0.3s ease-out' }}>
            {/* Global progress */}
            <div style={{
              background: '#181818', border: '1px solid #2A2A2A', borderRadius: 14,
              padding: '18px 20px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6B7280', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                    COMPLETUD KINTSU
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '22px', color: globalPct === 100 ? '#10B981' : '#EFEFEF' }}>
                    {globalPct}% {globalPct === 100 ? '🎉' : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>Faltan</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: totalPending > 0 ? '#EF4444' : '#10B981', fontFamily: 'var(--font-mono)' }}>
                    {totalPending}
                  </p>
                  <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
                    tareas×persona
                  </p>
                </div>
              </div>
              <ProgressBar value={globalPct} size="lg" />
              <p style={{ marginTop: 8, fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
                {totalDone} de {totalExpected} compromisos completados en el equipo
              </p>
            </div>

            {/* Member cards */}
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6B7280', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: 12 }}>
              ESTADO POR PERSONA
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {MEMBERS.map(member => {
                const pct = getMemberPercent(member.name, mergedTaskProgress, tasks)
                const pending = getMemberPendingCount(member.name, mergedTaskProgress, tasks)
                const config = getMemberConfig(member.name)
                const isComplete = pct === 100
                const isBehind = pct < 30 && tasks.length > 0

                return (
                  <button
                    key={member.name}
                    onClick={() => router.push(`/member/${member.name}`)}
                    style={{
                      background: isBehind ? 'rgba(239,68,68,0.05)' : '#181818',
                      border: `1px solid ${isBehind ? 'rgba(239,68,68,0.3)' : isComplete ? 'rgba(16,185,129,0.35)' : '#2A2A2A'}`,
                      borderLeft: `3px solid ${isComplete ? '#10B981' : isBehind ? '#EF4444' : config.color}`,
                      borderRadius: 12,
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.background = '#1E1E1E'
                      el.style.transform = 'translateY(-2px)'
                      el.style.boxShadow = `0 4px 16px rgba(0,0,0,0.4)`
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = isBehind ? 'rgba(239,68,68,0.05)' : '#181818'
                      el.style.transform = 'translateY(0)'
                      el.style.boxShadow = 'none'
                    }}
                  >
                    {/* Alert badge for behind members */}
                    {isBehind && (
                      <span style={{
                        position: 'absolute', top: 10, right: 10,
                        fontSize: '12px', lineHeight: 1,
                      }}>⚠️</span>
                    )}
                    {isComplete && (
                      <span style={{
                        position: 'absolute', top: 10, right: 10,
                        fontSize: '12px', lineHeight: 1,
                      }}>✅</span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MemberAvatar name={member.name} size="md" showEmoji />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', color: '#F0F0F0', marginBottom: 2 }}>
                          {member.name}
                          {member.name === user && <span style={{ fontSize: '10px', color: config.color, marginLeft: 6 }}>(yo)</span>}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                            color: isComplete ? '#10B981' : isBehind ? '#EF4444' : config.color,
                          }}>
                            {pct}%
                          </span>
                          {pending > 0 && (
                            <span style={{
                              fontSize: '10px', fontFamily: 'var(--font-mono)',
                              color: '#EF4444', background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              borderRadius: 20, padding: '1px 7px',
                            }}>
                              {pending} faltan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ProgressBar value={pct} size="sm" />
                  </button>
                )
              })}
            </div>

            {/* Grupales section */}
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6B7280', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: 12, marginTop: 24 }}>
              TAREAS GRUPALES — ESTADO GLOBAL
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.filter(t => t.category === 'grupal').map(task => {
                const subs = subtasks.filter(s => s.task_id === task.id)
                const doneSubs = new Set(subtaskProgress.filter(sp => subs.some(s => s.id === sp.subtask_id) && sp.completed).map(sp => sp.subtask_id)).size
                const remainingSubs = subs.length - doneSubs
                const pct = Math.round(doneSubs / (subs.length || 1) * 100)
                return (
                  <button
                    key={task.id}
                    onClick={() => router.push(`/task/${task.id}`)}
                    style={{
                      background: '#181818',
                      border: `1px solid ${remainingSubs === 0 ? 'rgba(16,185,129,0.3)' : '#2A2A2A'}`,
                      borderLeft: `3px solid ${remainingSubs === 0 ? '#10B981' : '#F9A8C9'}`,
                      borderRadius: 10,
                      padding: '14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', minHeight: 60,
                    }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#1E1E1E'; el.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#181818'; el.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ flex: 1 }}>
                      {task.pack_number && <span style={{ fontSize: '9px', color: '#F9A8C9', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 2 }}>{task.pack_number}</span>}
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#EFEFEF', fontFamily: 'var(--font-body)', marginBottom: 4 }}>{task.title}</p>
                      <div style={{ height: 2, borderRadius: 2, background: '#2A2A2A', width: '100%', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10B981' : '#F9A8C9', borderRadius: 2, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 70 }}>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: remainingSubs === 0 ? '#10B981' : '#D4AF37', fontFamily: 'var(--font-mono)' }}>{pct}%</p>
                      {remainingSubs > 0 ? (
                        <p style={{ fontSize: '10px', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>-{remainingSubs}</p>
                      ) : (
                        <p style={{ fontSize: '10px', color: '#10B981', fontFamily: 'var(--font-mono)' }}>✓ listo</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#D4AF37', opacity: 0.4 }}>金継ぎ</span>
            <p style={{ color: '#6B7280', fontFamily: 'var(--font-body)', fontSize: '13px' }}>Cargando tablero...</p>
          </div>
        )}
      </main>
    </>
  )
}
