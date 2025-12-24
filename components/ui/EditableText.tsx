'use client'

import { useState, useRef, useEffect } from 'react'
import { updateTask } from '@/actions/task'
import { updateGoal } from '@/actions/goal'

interface EditableTextProps {
  id: string
  initialText: string
  type: 'task' | 'goal'
  className?: string
}

export default function EditableText({ id, initialText, type, className = '' }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(initialText)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  async function handleSave() {
    setIsEditing(false)
    if (text === initialText) return

    const formData = new FormData()
    formData.append(type === 'task' ? 'taskId' : 'goalId', id)
    formData.append('title', text)

    if (type === 'task') await updateTask(formData)
    else await updateGoal(formData)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    else if (e.key === 'Escape') {
      setIsEditing(false)
      setText(initialText)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        // ✅ RESPONSIVE: text-base on mobile avoids zoom, md:text-sm matches desktop UI
        className={`w-full min-w-[100px] border-b border-indigo-500 bg-transparent py-1 text-base text-slate-800 outline-none md:py-0 md:text-sm dark:text-slate-100 ${className}`}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      // ✅ RESPONSIVE: touch-manipulation improves tap delay
      className={`-ml-1 cursor-pointer touch-manipulation rounded border border-transparent px-1 transition-colors hover:border-slate-200 hover:bg-slate-100 active:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800 ${className}`}
      title="Click to edit"
    >
      {text}
    </span>
  )
}
