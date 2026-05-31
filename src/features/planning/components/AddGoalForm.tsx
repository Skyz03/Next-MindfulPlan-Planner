'use client'

import { useState } from 'react'
import { addGoal } from '@/features/goals/actions'
import { useToast } from '@/core/providers/ToastProvider'
import { Plus } from 'lucide-react'

export default function AddGoalForm() {
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setIsSaving(true)
    const formData = new FormData()
    formData.append('title', trimmedTitle)

    await addGoal(formData)
    setTitle('')
    setIsSaving(false)
    showToast('Goal added')
  }

  return (
    <form onSubmit={handleSubmit} className="group relative">
      <div className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500">
        <Plus className="h-3.5 w-3.5" />
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="New Strategic Goal..."
        className="w-full rounded-xl border border-transparent bg-stone-100 py-3 pr-4 pl-10 text-sm font-medium text-stone-800 shadow-sm transition-all outline-none placeholder:text-stone-400 focus:border-orange-300 focus:bg-white focus:shadow-md dark:bg-stone-800/50 dark:text-stone-200 dark:focus:border-orange-800/50 dark:focus:bg-stone-800"
      />
      <button type="submit" disabled={isSaving} className="hidden">
        Add Goal
      </button>
    </form>
  )
}
