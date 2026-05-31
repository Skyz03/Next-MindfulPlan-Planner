'use server'

import { createClient } from '@/core/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function addGoal(formData: FormData) {
  const { supabase, user } = await getUser()
  const title = formData.get('title') as string
  if (!title?.trim()) return
  await supabase.from('goals').insert({ title: title.trim(), user_id: user.id })
  revalidatePath('/')
}

export async function deleteGoal(formData: FormData) {
  const { supabase, user } = await getUser()
  const goalId = formData.get('goalId') as string
  if (!goalId) return
  await supabase.from('goals').delete().eq('id', goalId).eq('user_id', user.id)
  revalidatePath('/')
}

export async function updateGoal(formData: FormData) {
  const { supabase, user } = await getUser()
  const goalId = formData.get('goalId') as string
  const newTitle = formData.get('title') as string
  if (!goalId || !newTitle?.trim()) return
  await supabase.from('goals').update({ title: newTitle.trim() }).eq('id', goalId).eq('user_id', user.id)
  revalidatePath('/')
}
