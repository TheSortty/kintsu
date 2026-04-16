'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { getMemberConfig, MEMBER_PHRASES } from '@/lib/constants'
import { getGlobalPercent, getMemberPercent } from '@/lib/utils/progress'
import GlobalProgressHeader from '@/components/GlobalProgressHeader'
import MemberAvatar from '@/components/MemberAvatar'
import ProgressBar from '@/components/ProgressBar'
import StatusBadge from '@/components/StatusBadge'
import type { Task, TaskProgress } from '@/lib/types'

export default function MemberPage() {
  const { name } = useParams<{ name: string }>()
  const router = useRouter()
  const decodedName = decodeURIComponent(name)
  const config = getMemberConfig(decodedName)

  const [tasks, setTasks] = useState<Task[]>([])
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createSupabaseClient()
      const [{ data: t }, { data: tp }, { data: allTp }] = await Promise.all([
        supabase.from('tasks').select('*').order('priority'),
        supabase.from('task_progress').select('*').eq('member_name', decodedName),
        supabase.from('task_progress').select('*'),
      ])
      if (t) setTasks(t)
      if (allTp) setTaskProgress(allTp)
      setLoading(false)
    }
    load()
  }, [decodedName])

  const memberProgress = taskProgress.filter(p => p.member_name === decodedName)
  const pct = getMemberPercent(decodedName, taskProgress, tasks)
  
  let globalPct = getGlobalPercent(taskProgress, tasks)
  if (globalPct === 0 && taskProgress.some(p => p.status === 'done')) globalPct = 1

  const myTasks = tasks.filter(t => t.category === 'individual' || t.category === 'seniors')
  const myTasksCount = myTasks.length
  const doneCount = memberProgress.filter(
    p => myTasks.some(t => t.id === p.task_id) && p.status === 'done'
  ).length

  const getStatusForTask = (taskId: string) =>
    memberProgress.find(p => p.task_id === taskId)?.status ?? 'pending'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#D4AF37', opacity: 0.6 }}>金継ぎ</span>
      </div>
    )
  }

  return (
    <>
      <GlobalProgressHeader taskProgress={taskProgress} tasks={tasks} globalPctFixed={globalPct} />
      <main
        className="page-enter bottom-safe"
        style={{ padding: '16px', paddingTop: 72, position: 'relative', zIndex: 1 }}
      >
        {/* Back */}
        <button
          onClick={() => router.back()}
          aria-label="Volver"
          style={{
            background: '#111111',
            border: '1px solid #2C2C2C',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer',
            color: '#9CA3AF',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Volver
        </button>

        {/* Profile header */}
        <div
          style={{
            background: '#111111',
            border: `1px solid ${config.color}44`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 12,
            boxShadow: `0 0 30px ${config.color}11`,
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          <MemberAvatar name={decodedName} size="xl" showEmoji />
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '28px',
                color: config.color,
                marginBottom: 4,
              }}
            >
              {decodedName}
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                fontSize: '13px',
                color: '#9CA3AF',
                maxWidth: 280,
                lineHeight: 1.5,
              }}
            >
              {MEMBER_PHRASES[decodedName] ?? '"Somos protagonistas distintos por naturaleza."'}
            </p>
          </div>

          {/* Personal progress */}
          <div style={{ width: '100%', maxWidth: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
                PROGRESO PERSONAL
              </span>
              <span style={{ fontSize: '12px', color: config.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {pct}%
              </span>
            </div>
            <ProgressBar value={pct} size="md" />
            <p style={{ marginTop: 6, fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
              {doneCount} de {myTasksCount} tareas completadas
            </p>
          </div>
        </div>

        {/* Tasks breakdown */}
        {['individual', 'grupal', 'seniors'].map(category => {
          const categoryTasks = tasks.filter(t => t.category === category)
          if (categoryTasks.length === 0) return null
          const labels: Record<string, string> = {
            individual: 'TAREAS INDIVIDUALES',
            grupal: 'TAREAS GRUPALES',
            seniors: 'TAREAS SENIORS',
          }
          return (
            <section key={category} style={{ marginBottom: 24 }}>
              <p className="section-title">{labels[category]}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categoryTasks.map(task => {
                  const status = getStatusForTask(task.id)
                  const prog = memberProgress.find(p => p.task_id === task.id)
                  return (
                    <button
                      key={task.id}
                      onClick={() => router.push(`/task/${task.id}`)}
                      style={{
                        background: '#111111',
                        border: '1px solid #1F1F1F',
                        borderRadius: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'left',
                        transition: 'border-color 0.2s',
                        minHeight: 52,
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#D4AF3744')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#1F1F1F')}
                    >
                      <div style={{ flex: 1 }}>
                        {task.pack_number && (
                          <span style={{ fontSize: '9px', color: '#D4AF37', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 2 }}>
                            {task.pack_number}
                          </span>
                        )}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5', fontFamily: 'var(--font-body)' }}>
                          {task.title}
                        </span>
                        {prog?.notes && (
                          <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', display: 'block', marginTop: 2 }}>
                            {prog.notes}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={status} size="sm" pulse={status === 'in_progress'} />
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>
    </>
  )
}
