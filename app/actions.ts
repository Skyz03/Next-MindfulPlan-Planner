'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const TEST_USER_ID = 'test-user-1'

// --- NEW: Goal Action ---
export async function addGoal(formData: FormData) {
    const supabase = createClient()
    const title = formData.get('title') as string

    if (!title) return

    await supabase.from('goals').insert({
        title,
        user_id: TEST_USER_ID,
    })

    revalidatePath('/')
}

// --- UPDATED: Task Action ---
export async function addTask(formData: FormData) {
    const supabase = createClient()
    const title = formData.get('title') as string
    const goalId = formData.get('goal_id') as string // <--- Get the selected Goal

    if (!title) return

    await supabase.from('tasks').insert({
        title,
        user_id: TEST_USER_ID,
        priority: 'medium',
        goal_id: goalId !== 'none' ? goalId : null // <--- Save the relationship
    })

    revalidatePath('/')
}

// ... keep toggleTask as is ...
export async function toggleTask(taskId: string, currentStatus: boolean) {
    const supabase = createClient()
    await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', taskId)
    revalidatePath('/')
}