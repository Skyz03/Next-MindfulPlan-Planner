'use server'

import { createClient } from '@/core/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { TaskSchema, PriorityEnum } from './schema' // Import your new laws

// --- HELPER: PROTECTED USER ---
async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return { supabase, user }
}

// ==========================================
// 1. ADD TASK (Fully Validated)
// ==========================================
export async function addTask(formData: FormData) {
  const { supabase, user } = await getUser()

  // A. Extract Raw Form Data
  const rawTitle = formData.get('title')
  const rawPriority = formData.get('priority')
  const rawStartTime = formData.get('start_time')
  const rawDuration = formData.get('duration')
  const dateType = formData.get('date_type')
  const specificDate = formData.get('specific_date')
  const goalId = formData.get('goal_id')

  // B. Handle Date Logic (Business Logic Layer)
  let computedDate: string | null = null
  if (dateType === 'specific' && specificDate) {
    computedDate = specificDate.toString()
  }
  // 'inbox' and 'backlog' imply date is null, which is the default

  // C. Define Action-Specific Schema
  // We extend the base TaskSchema to handle Form string coercion
  const CreateTaskPayload = TaskSchema.pick({
    title: true,
    priority: true,
    start_time: true,
    // We don't pick 'date' directly because we mapped it manually above
  }).extend({
    duration: z.coerce.number().default(60), // Auto-convert "60" string to 60 number
    goal_id: z.string().optional().nullable()
  })

  // D. Validate
  const result = CreateTaskPayload.safeParse({
    title: rawTitle,
    priority: rawPriority,
    start_time: rawStartTime || null, // Convert empty strings to null
    duration: rawDuration,
    goal_id: (goalId && goalId !== 'none') ? goalId : null
  })

  // E. Guard Clause
  if (!result.success) {
    console.error("Validation Failed:", result.error.flatten())
    return { error: result.error.flatten().fieldErrors }
  }

  // F. Database Insert (Type-Safe)
  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: result.data.title,
    priority: result.data.priority,
    start_time: result.data.start_time,
    duration: result.data.duration,
    due_date: computedDate, // The computed logic result
    goal_id: result.data.goal_id,
    is_completed: false,
    actual_duration: 0
  })

  if (error) {
    console.error('Database Error:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

// ==========================================
// 2. TOGGLE COMPLETION
// ==========================================
export async function toggleTask(taskId: string, isCompleted: boolean) {
  const { supabase, user } = await getUser()

  // Validate inputs simply
  const idCheck = z.string().uuid().safeParse(taskId)
  if (!idCheck.success) return

  await supabase
    .from('tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

// ==========================================
// 3. DELETE TASK
// ==========================================
export async function deleteTask(formData: FormData) {
  const { supabase, user } = await getUser()
  const taskId = formData.get('taskId')

  const result = z.string().uuid().safeParse(taskId)
  if (!result.success) return

  await supabase
    .from('tasks')
    .delete()
    .eq('id', result.data)
    .eq('user_id', user.id)

  revalidatePath('/')
}

// ==========================================
// 4. SCHEDULE TASK (Drag & Drop)
// ==========================================
export async function scheduleTask(formData: FormData) {
  const { supabase, user } = await getUser()

  const rawData = {
    taskId: formData.get('taskId'),
    date: formData.get('date')
  }

  const Schema = z.object({
    taskId: z.string().uuid(),
    date: z.string().date() // Enforces YYYY-MM-DD
  })

  const result = Schema.safeParse(rawData)
  if (!result.success) return

  await supabase
    .from('tasks')
    .update({ due_date: result.data.date })
    .eq('id', result.data.taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

// ==========================================
// 5. UPDATE TITLE
// ==========================================
export async function updateTask(formData: FormData) {
  const { supabase, user } = await getUser()

  const Schema = z.object({
    taskId: z.string().uuid(),
    title: z.string().min(1).max(100)
  })

  const result = Schema.safeParse({
    taskId: formData.get('taskId'),
    title: formData.get('title')
  })

  if (!result.success) return

  await supabase
    .from('tasks')
    .update({ title: result.data.title })
    .eq('id', result.data.taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

// ==========================================
// 6. MOVE TASK TO DATE (Utility)
// ==========================================
export async function moveTaskToDate(taskId: string, dateStr: string | null) {
  const { supabase, user } = await getUser()

  // Validate ID
  if (!z.string().uuid().safeParse(taskId).success) return
  // Validate Date (allow null)
  if (dateStr && !z.string().date().safeParse(dateStr).success) return

  await supabase
    .from('tasks')
    .update({ due_date: dateStr })
    .eq('id', taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

// ==========================================
// 7. TIMEBLOCKING
// ==========================================
export async function scheduleTaskTime(taskId: string, startTime: string | null, duration: number = 60) {
  const { supabase, user } = await getUser()

  const Schema = z.object({
    taskId: z.string().uuid(),
    startTime: z.string().nullable(), // Could add regex for HH:MM
    duration: z.number().min(1)
  })

  const result = Schema.safeParse({ taskId, startTime, duration })
  if (!result.success) return

  await supabase
    .from('tasks')
    .update({
      start_time: result.data.startTime,
      duration: result.data.duration,
    })
    .eq('id', result.data.taskId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

// ==========================================
// 8. UPDATE PRIORITY (Optimistic UI Action)
// ==========================================
export async function updateTaskPriority(taskId: string, priority: string) {
  const { supabase, user } = await getUser()

  // 1. Validate the Enum using Zod
  const result = PriorityEnum.safeParse(priority)
  const idCheck = z.string().uuid().safeParse(taskId)

  if (!result.success || !idCheck.success) {
    console.error("Invalid Priority/ID")
    return
  }

  await supabase
    .from('tasks')
    .update({ priority: result.data })
    .eq('id', taskId)
    .eq('user_id', user.id) // Security check

  revalidatePath('/dashboard')
}

// ==========================================
// 9. UPDATE DESCRIPTION
// ==========================================
export async function updateTaskDescription(taskId: string, description: string) {
  const { supabase, user } = await getUser()

  // Sanitization / Validation
  const Schema = z.object({
    taskId: z.string().uuid(),
    description: z.string().max(5000).optional()
  })

  const result = Schema.safeParse({ taskId, description })
  if (!result.success) return

  await supabase
    .from('tasks')
    .update({ description: result.data.description })
    .eq('id', result.data.taskId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}

// ==========================================
// 10. TIMER LOGIC (Complex)
// ==========================================
export async function toggleTimer(taskId: string) {
  const { supabase } = await getUser() // Ensures auth

  if (!z.string().uuid().safeParse(taskId).success) return

  const { data: task } = await supabase
    .from('tasks')
    .select('last_started_at, actual_duration')
    .eq('id', taskId)
    .single()

  if (!task) return

  const now = new Date()

  if (task.last_started_at) {
    // STOPPING
    const startTime = new Date(task.last_started_at)
    const sessionMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000)
    const newTotal = (task.actual_duration || 0) + sessionMinutes

    await supabase
      .from('tasks')
      .update({
        last_started_at: null,
        actual_duration: newTotal,
      })
      .eq('id', taskId)
  } else {
    // STARTING
    await supabase
      .from('tasks')
      .update({ last_started_at: now.toISOString() })
      .eq('id', taskId)
  }

  revalidatePath('/dashboard')
}

export async function updateTaskDuration(taskId: string, duration: number) {
  const { supabase } = await getUser()

  const result = z.object({
    taskId: z.string().uuid(),
    duration: z.number().min(1)
  }).safeParse({ taskId, duration })

  if (!result.success) return

  await supabase.from('tasks').update({ duration: result.data.duration }).eq('id', result.data.taskId)
  revalidatePath('/dashboard')
}