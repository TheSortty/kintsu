'use client'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { getMemberConfig, STATUS_CONFIG } from '@/lib/constants'
import { timeAgo } from '@/lib/utils/progress'
import MemberAvatar from './MemberAvatar'
import type { TaskProgress, Task, TaskComment, TaskStatus } from '@/lib/types'

export interface ActivityEvent {
  id: string
  type: 'status_change' | 'comment'
  member_name: string
  task_id: string
  task_title: string
  content?: string
  status?: TaskStatus
  created_at: string
}

interface ActivityFeedProps {
  tasks: Task[]
}

export default function ActivityFeed({ tasks }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecent = useCallback(async () => {
    if (tasks.length === 0) return

    const supabase = createSupabaseClient()
    const [commentsReq, progressReq] = await Promise.all([
      supabase.from('task_comments').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('task_progress').select('*').order('updated_at', { ascending: false }).limit(20)
    ])

    const newEvents: ActivityEvent[] = []

    if (commentsReq.data) {
      commentsReq.data.forEach((c: TaskComment) => {
        const task = tasks.find(t => t.id === c.task_id)
        if (task) {
          newEvents.push({
            id: `cmd-${c.id}`,
            type: 'comment',
            member_name: c.member_name,
            task_id: c.task_id,
            task_title: task.title,
            content: c.content,
            created_at: c.created_at
          })
        }
      })
    }

    if (progressReq.data) {
      progressReq.data.forEach((p: TaskProgress) => {
        const task = tasks.find(t => t.id === p.task_id)
        if (task && p.status !== 'pending') {
          newEvents.push({
            id: `sts-${p.task_id}-${p.member_name}-${p.updated_at}`,
            type: 'status_change',
            member_name: p.member_name,
            task_id: p.task_id,
            task_title: task.title,
            status: p.status,
            content: p.notes,
            created_at: p.updated_at || new Date().toISOString()
          })
        }
      })
    }

    // Sort by descending date
    newEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setEvents(newEvents.slice(0, 30))
    setLoading(false)
  }, [tasks])

  useEffect(() => {
    fetchRecent()

    if (tasks.length === 0) return

    const supabase = createSupabaseClient()
    const channel = supabase
      .channel('kintsu-activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_comments' },
        (payload) => {
          const c = payload.new as TaskComment
          const task = tasks.find(t => t.id === c.task_id)
          if (task) {
            const ev: ActivityEvent = {
              id: `cmd-${c.id}`,
              type: 'comment',
              member_name: c.member_name,
              task_id: c.task_id,
              task_title: task.title,
              content: c.content,
              created_at: c.created_at
            }
            setEvents(prev => [ev, ...prev].slice(0, 30))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'task_progress' },
        (payload) => {
          const p = payload.new as TaskProgress
          const task = tasks.find(t => t.id === p.task_id)
          if (task && p.status !== 'pending') {
            const ev: ActivityEvent = {
              id: `sts-${p.task_id}-${p.member_name}-${p.updated_at || Date.now()}`,
              type: 'status_change',
              member_name: p.member_name,
              task_id: p.task_id,
              task_title: task.title,
              status: p.status,
              content: p.notes,
              created_at: p.updated_at || new Date().toISOString()
            }
            // Avoid duplicate rapid status updates by checking if last event was same status
            setEvents(prev => {
               const latestForSame = prev.find(e => e.type === 'status_change' && e.task_id === p.task_id && e.member_name === p.member_name)
               if (latestForSame && latestForSame.status === p.status) return prev
               return [ev, ...prev].slice(0, 30)
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tasks, fetchRecent])

  if (loading) {
    return <div style={{ color: '#6B7280', fontSize: '12px', padding: '20px' }}>Cargando actividad...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {events.length === 0 && (
        <div style={{ color: '#6B7280', fontSize: '12px', padding: '20px', textAlign: 'center', border: '1px dashed #2A2A2A', borderRadius: 8 }}>
          Sin actividad reciente
        </div>
      )}
      {events.map((ev) => {
        const config = getMemberConfig(ev.member_name)
        return (
          <div
            key={ev.id}
            style={{
              background: '#181818',
              border: `1px solid #2A2A2A`,
              borderRadius: 10,
              padding: '12px',
              display: 'flex',
              gap: 12,
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <MemberAvatar name={ev.member_name} size="sm" />
            <div style={{ flex: 1 }}>
              {ev.type === 'comment' ? (
                <>
                  <p style={{ fontSize: '13px', color: '#EFEFEF', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    {ev.member_name} <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: '12px' }}>comentó en</span>
                  </p>
                  <p style={{ fontSize: '11px', color: '#D4AF37', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
                    {ev.task_title}
                  </p>
                  <div style={{
                    background: '#111111', border: '1px solid #2A2A2A', borderRadius: 6,
                    padding: '8px 10px', fontSize: '12px', color: '#C0C0C0', fontFamily: 'var(--font-body)',
                  }}>
                    {ev.content}
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#EFEFEF', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    {ev.member_name} <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: '12px' }}>marcó como</span>
                    <span style={{
                      color: STATUS_CONFIG[ev.status!]?.color,
                      fontSize: '11px', fontWeight: 700, marginLeft: 4, textTransform: 'uppercase'
                    }}>
                      {STATUS_CONFIG[ev.status!]?.label}
                    </span>
                  </p>
                  <p style={{ fontSize: '12px', color: '#D4AF37', fontFamily: 'var(--font-body)' }}>
                    {ev.task_title}
                  </p>
                  {ev.content && (
                    <div style={{
                      background: '#111111', border: '1px solid #2A2A2A', borderRadius: 6,
                      padding: '8px 10px', fontSize: '12px', color: '#C0C0C0', fontFamily: 'var(--font-body)', marginTop: 4,
                    }}>
                      {ev.content}
                    </div>
                  )}
                </>
              )}
              <span style={{ fontSize: '9px', color: '#6B7280', fontFamily: 'var(--font-mono)', display: 'block', marginTop: 6 }}>
                {timeAgo(ev.created_at)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
