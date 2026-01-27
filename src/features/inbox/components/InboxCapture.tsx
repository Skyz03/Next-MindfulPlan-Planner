'use client'

import { useState, useEffect, useRef } from 'react'
import { addTask } from '@/features/tasks/actions'

export default function InboxCapture() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('medium')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setPriority('medium')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsSaving(true)
    const formData = new FormData()
    formData.append('title', input)
    formData.append('date_type', 'inbox')
    formData.append('priority', priority)

    await addTask(formData)

    setInput('')
    setIsSaving(false)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    // ✅ RESPONSIVE: pt-4 on mobile (to avoid keyboard cover), pt-[20vh] on desktop
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-4 backdrop-blur-sm duration-200 md:pt-[20vh]">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      <div className="animate-in zoom-in-95 relative w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl duration-200 dark:border-stone-800 dark:bg-[#262626]">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3 px-4 py-4 md:gap-4 md:px-6 md:py-6">
            <div className="flex-none rounded-xl bg-stone-100 p-2 text-stone-500 md:p-3 dark:bg-stone-800">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="md:h-6 md:w-6"
              >
                <path d="M22 2L11 13"></path>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
              </svg>
            </div>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Capture a thought..."
              // ✅ RESPONSIVE: text-lg on mobile, text-2xl on desktop
              className="flex-1 bg-transparent font-serif text-lg text-stone-800 outline-none placeholder:text-stone-300 md:text-2xl dark:text-stone-100"
              autoComplete="off"
            />

            {isSaving && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-y-3 border-t border-stone-100 bg-stone-50 px-4 py-3 md:px-6 dark:border-stone-800 dark:bg-stone-900/50">
            {/* Priority Toggles */}
            <div className="flex items-center gap-2">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'border-red-200 bg-white text-red-600 dark:bg-stone-700 dark:text-red-400'
                        : p === 'medium'
                          ? 'border-orange-200 bg-white text-orange-600 dark:bg-stone-700 dark:text-orange-400'
                          : 'border-stone-300 bg-white text-stone-600 dark:bg-stone-700 dark:text-stone-200'
                      : 'border-transparent text-stone-400 hover:bg-stone-200/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* ✅ RESPONSIVE: Hidden on mobile (users just hit 'Go' on keyboard) */}
            <div className="hidden gap-4 text-xs text-stone-400 md:flex">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-sans text-[10px] shadow-sm dark:border-stone-700 dark:bg-stone-800">
                  ↵
                </kbd>{' '}
                Save
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-sans text-[10px] shadow-sm dark:border-stone-700 dark:bg-stone-800">
                  Esc
                </kbd>{' '}
                Close
              </span>
            </div>
          </div>

          <button type="submit" className="hidden" />
        </form>
      </div>
    </div>
  )
}
