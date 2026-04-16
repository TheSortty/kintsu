'use client'
import { useCallback } from 'react'
import { createSupabaseClient } from '../supabase'
import type { TaskStatus } from '../types'

export function useTaskProgress() {
  const updateTaskStatus = useCallback(
    async (taskId: string, memberName: string, status: TaskStatus, notes?: string) => {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('task_progress')
        .upsert(
          {
            task_id: taskId,
            member_name: memberName,
            status,
            notes: notes ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'task_id,member_name' }
        )
      if (error) throw error
    },
    []
  )

  const updateSubtaskCompleted = useCallback(
    async (subtaskId: string, memberName: string, completed: boolean) => {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('subtask_progress')
        .upsert(
          {
            subtask_id: subtaskId,
            member_name: memberName,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          { onConflict: 'subtask_id,member_name' }
        )
      if (error) throw error
    },
    []
  )

  const addComment = useCallback(
    async (taskId: string, memberName: string, content: string) => {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from('task_comments').insert({
        task_id: taskId,
        member_name: memberName,
        content,
      })
      if (error) throw error
    },
    []
  )

  return { updateTaskStatus, updateSubtaskCompleted, addComment }
}
