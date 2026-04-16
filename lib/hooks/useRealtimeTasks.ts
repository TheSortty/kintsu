'use client'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '../supabase'
import type { TaskProgress, SubtaskProgress } from '../types'

export interface RealtimeEvent {
  type: 'task_progress' | 'subtask_progress' | 'comment'
  member_name: string
  task_id?: string
  subtask_id?: string
  status?: string
  content?: string
}

export function useRealtimeTasks(
  onEvent?: (event: RealtimeEvent) => void
) {
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([])
  const [subtaskProgress, setSubtaskProgress] = useState<SubtaskProgress[]>([])

  const fetchAll = useCallback(async () => {
    const supabase = createSupabaseClient()
    const [{ data: tp }, { data: sp }] = await Promise.all([
      supabase.from('task_progress').select('*'),
      supabase.from('subtask_progress').select('*'),
    ])
    if (tp) setTaskProgress(tp)
    if (sp) setSubtaskProgress(sp)
  }, [])

  useEffect(() => {
    fetchAll()

    const supabase = createSupabaseClient()

    const channel = supabase
      .channel('kintsu-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_progress' },
        (payload) => {
          setTaskProgress(prev => {
            const updated = payload.new as TaskProgress
            const idx = prev.findIndex(
              p => p.task_id === updated.task_id && p.member_name === updated.member_name
            )
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = updated
              return next
            }
            return [...prev, updated]
          })
          onEvent?.({
            type: 'task_progress',
            member_name: (payload.new as TaskProgress).member_name,
            task_id: (payload.new as TaskProgress).task_id,
            status: (payload.new as TaskProgress).status,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtask_progress' },
        (payload) => {
          setSubtaskProgress(prev => {
            const updated = payload.new as SubtaskProgress
            const idx = prev.findIndex(
              p => p.subtask_id === updated.subtask_id && p.member_name === updated.member_name
            )
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = updated
              return next
            }
            return [...prev, updated]
          })
          onEvent?.({
            type: 'subtask_progress',
            member_name: (payload.new as SubtaskProgress).member_name,
            subtask_id: (payload.new as SubtaskProgress).subtask_id,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAll, onEvent])

  return { taskProgress, subtaskProgress, refetch: fetchAll }
}
