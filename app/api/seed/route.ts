import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { seedDatabase } from '@/lib/seed-data'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const force = url.searchParams.get('force') === 'true'

  if (force) {
    // Delete all data and re-seed
    const supabase = createSupabaseClient()
    await supabase.from('task_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('subtask_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('task_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('subtasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  }

  const result = await seedDatabase()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

export async function POST() {
  const result = await seedDatabase()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
