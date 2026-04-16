export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'needs_review'
export type TaskCategory = 'individual' | 'grupal' | 'seniors'
export type TaskList = 'finde' | 'seniors'

export interface Member {
  id: string
  name: string
  color: string
  emoji: string
  created_at: string
}

export interface Task {
  id: string
  pack_number: string | null
  title: string
  description: string | null
  category: TaskCategory
  list: TaskList
  section: string | null
  priority: number
  created_at: string
  subtasks?: Subtask[]
  progress?: TaskProgress[]
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  order_index: number
  subtask_progress?: SubtaskProgress[]
}

export interface TaskProgress {
  id: string
  task_id: string
  member_name: string
  status: TaskStatus
  notes: string | null
  updated_at: string
}

export interface SubtaskProgress {
  id: string
  subtask_id: string
  member_name: string
  completed: boolean
  completed_at: string | null
}

export interface TaskComment {
  id: string
  task_id: string
  member_name: string
  content: string
  created_at: string
}

export interface MemberConfig {
  name: string
  color: string
  emoji: string
}

export interface TaskWithDetails extends Task {
  subtasks: Subtask[]
  progress: TaskProgress[]
  comments?: TaskComment[]
}

export interface MemberProgress {
  member: MemberConfig
  totalTasks: number
  doneTasks: number
  percentage: number
}
