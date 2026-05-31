export type { Task } from '@/features/tasks/schema'
export type { Goal } from '@/features/strategy/schema'

// Row types matching Supabase table structure
export type DbTask = {
  id: string
  user_id: string
  goal_id: string | null
  title: string
  description: string | null
  due_date: string | null
  is_completed: boolean
  priority: 'low' | 'medium' | 'high'
  start_time: string | null
  duration: number
  actual_duration: number
  last_started_at: string | null
  created_at: string
}

export type DbTaskWithGoal = DbTask & {
  goals: { title: string } | null
}

export type DbGoal = {
  id: string
  user_id: string
  title: string
  created_at: string
}

export type GoalWithSteps = DbGoal & {
  steps: DbTask[]
}
