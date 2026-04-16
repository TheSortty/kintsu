import type { TaskProgress, Task, Subtask, SubtaskProgress } from '../types'

export const MEMBER_COUNT = 10

/**
 * % de completud GLOBAL = todos los miembros completaron todas sus tareas.
 * - Individual/Seniors: cada miembro × cada tarea → expected = 10 × N
 * - Grupal: compartidas, solo cuenta subtask_progress (handled separately)
 */
export function getGlobalPercent(
  allProgress: TaskProgress[],
  tasks: Task[] = [],
  memberCount = MEMBER_COUNT
): number {
  if (!tasks.length) {
    // Fallback: solo usa taskProgress existentes
    if (!allProgress.length) return 0
    const done = allProgress.filter(p => p.status === 'done').length
    return Math.round((done / allProgress.length) * 100)
  }

  const individualTasks = tasks.filter(t => t.category === 'individual')
  const seniorTasks     = tasks.filter(t => t.category === 'seniors')
  const grupalTasks     = tasks.filter(t => t.category === 'grupal')

  // Expected = members × (individual + seniors) + grupal (1 each)
  const expectedIndSen = (individualTasks.length + seniorTasks.length) * memberCount
  const expectedGrupal = grupalTasks.length
  const totalExpected  = expectedIndSen + expectedGrupal

  if (totalExpected === 0) return 0

  // Done individual/seniors: task_progress with status=done
  const doneIndSen = allProgress.filter(p => {
    const task = tasks.find(t => t.id === p.task_id)
    return task && (task.category === 'individual' || task.category === 'seniors') && p.status === 'done'
  }).length

  // Done grupal: task where all task_progress records are done (OR at least one done — use "at least 1")
  const doneGrupal = grupalTasks.filter(t => {
    const progs = allProgress.filter(p => p.task_id === t.id)
    return progs.length > 0 && progs.some(p => p.status === 'done')
  }).length

  return Math.round(((doneIndSen + doneGrupal) / totalExpected) * 100)
}

/**
 * % de un miembro individual.
 * Denominador = total de tareas individual + seniors (su responsabilidad directa).
 * Grupal no cuenta (es compartida, no 1-persona).
 */
export function getMemberPercent(
  memberName: string,
  allProgress: TaskProgress[],
  tasks: Task[] = []
): number {
  if (!tasks.length) {
    // Fallback
    const mp = allProgress.filter(p => p.member_name === memberName)
    if (!mp.length) return 0
    const done = mp.filter(p => p.status === 'done').length
    return Math.round((done / mp.length) * 100)
  }

  const myTasks = tasks.filter(t => t.category === 'individual' || t.category === 'seniors')
  if (!myTasks.length) return 0

  const done = allProgress.filter(
    p => p.member_name === memberName && myTasks.some(t => t.id === p.task_id) && p.status === 'done'
  ).length

  return Math.round((done / myTasks.length) * 100)
}

/** @deprecated - use getMemberPercent with tasks */
export function getMemberTotalPercent(
  memberName: string,
  allProgress: TaskProgress[]
): number {
  return getMemberPercent(memberName, allProgress, [])
}

/** Cuántas tareas le faltan a un miembro (pending o in_progress) */
export function getMemberPendingCount(
  memberName: string,
  allProgress: TaskProgress[],
  tasks: Task[]
): number {
  const myTasks = tasks.filter(t => t.category === 'individual' || t.category === 'seniors')
  const doneTasks = new Set(
    allProgress.filter(p => p.member_name === memberName && p.status === 'done').map(p => p.task_id)
  )
  return myTasks.filter(t => !doneTasks.has(t.id)).length
}

/** Cuántas subtareas quedan en una tarea para un miembro */
export function getSubtaskRemainingCount(
  subtasks: Subtask[],
  subtaskProgress: SubtaskProgress[],
  memberName?: string | null
): number {
  if (!memberName) return subtasks.length
  const done = new Set(
    subtaskProgress
      .filter(sp => subtasks.some(s => s.id === sp.subtask_id) && sp.member_name === memberName && sp.completed)
      .map(sp => sp.subtask_id)
  )
  return subtasks.length - done.size
}

export function getTaskProgressPercent(progress: TaskProgress[]): number {
  if (!progress || progress.length === 0) return 0
  const done = progress.filter(p => p.status === 'done').length
  return Math.round((done / progress.length) * 100)
}

export function getSubtaskProgressPercent(
  totalSubtasks: number,
  completedSubtasks: number
): number {
  if (totalSubtasks === 0) return 0
  return Math.round((completedSubtasks / totalSubtasks) * 100)
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'ahora mismo'
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}
