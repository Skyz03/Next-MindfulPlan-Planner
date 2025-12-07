'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// THIS IS OUR FAKE USER FOR NOW
const TEST_USER_ID = 'test-user-1'

export async function addTask(formData: FormData) {
    const supabase = createClient()
    const title = formData.get('title') as string

    if (!title) return

    await supabase.from('tasks').insert({
        title,
        user_id: TEST_USER_ID, // <--- Hardcoded!
        priority: 'medium'
    })

    revalidatePath('/')
}

export async function toggleTask(taskId: string, currentStatus: boolean) {
    const supabase = createClient()

    await supabase
        .from('tasks')
        .update({ is_completed: !currentStatus })
        .eq('id', taskId)

    revalidatePath('/')
}