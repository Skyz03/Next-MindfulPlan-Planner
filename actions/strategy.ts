'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStrategyData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch Goals with their Tasks to calculate progress
    const { data: goals } = await supabase
        .from('goals')
        .select(`
      *,
      tasks (id, title, is_completed, priority, description)
    `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Calculate Progress % for each goal
    const strategies = goals?.map((g) => {
        const total = g.tasks.length
        const completed = g.tasks.filter((t: any) => t.is_completed).length
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

        return {
            ...g,
            progress,
            totalTasks: total,
            completedTasks: completed
        }
    }) || []

    return strategies
}

export async function updateGoalStrategy(formData: FormData) {
    const supabase = await createClient()
    const goalId = String(formData.get('goalId'))

    const updates = {
        vision_statement: String(formData.get('vision')),
        current_reality: String(formData.get('reality')),
        deadline: formData.get('deadline') ? String(formData.get('deadline')) : null,
    }

    await supabase.from('goals').update(updates).eq('id', goalId)
    revalidatePath('/dashboard')
}

export async function addStrategyGoal(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const title = String(formData.get('title'))
    const deadline = formData.get('deadline') ? String(formData.get('deadline')) : null
    const vision = String(formData.get('vision'))

    if (!user || !title) return

    await supabase.from('goals').insert({
        user_id: user.id,
        title: title,
        deadline: deadline,
        vision_statement: vision,
        current_reality: '', // Start blank
        status: 'active'
    })

    revalidatePath('/dashboard')
}

export async function deleteStrategyGoal(goalId: string) {
    const supabase = await createClient()

    // Delete the goal (Cascade will likely handle tasks, or you can update tasks to have null goal_id)
    await supabase.from('goals').delete().eq('id', goalId)

    revalidatePath('/dashboard')
}

export async function addGoalStep(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const title = String(formData.get('title'))
    const goalId = String(formData.get('goalId'))
    const priority = String(formData.get('priority') || 'medium')

    if (!user || !title || !goalId) return

    // Create a task linked to this goal, but NO date/time (it sits in the backlog)
    await supabase.from('tasks').insert({
        user_id: user.id,
        title: title,
        goal_id: goalId,
        duration: 60, // Default 1h
        is_completed: false,
        priority: priority
    })

    revalidatePath('/dashboard')
}