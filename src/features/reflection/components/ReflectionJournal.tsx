'use client'

import { useState } from 'react'
import { saveReflection } from '@/features/reflection/actions'

export default function ReflectionJournal({
  dateStr,
  initialData,
  viewMode,
}: {
  dateStr: string
  initialData: any
  viewMode: 'week' | 'month'
}) {
  const [isSubmitted, setIsSubmitted] = useState(!!initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [energy, setEnergy] = useState(initialData?.energy_rating || 3)
  const [isSaving, setIsSaving] = useState(false)

  const title = viewMode === 'month' ? 'Monthly Review' : 'Weekly Debrief'
  const nextStepsLabel = viewMode === 'month' ? "Next Month's Big 3" : "Next Week's Big 3"
  const placeholder =
    viewMode === 'month'
      ? 'Review the big picture. Did you move closer to your strategic goals?'
      : 'What worked? What blocked you? Write it down...'

  const handleSave = async (formData: FormData) => {
    setIsSaving(true)
    await saveReflection(dateStr, formData)
    setIsSaving(false)
    setIsSubmitted(true)
    setIsEditing(false)
  }

  // --- 🟢 COMPLETED STATE (READ-ONLY) ---
  if (isSubmitted && !isEditing) {
    return (
      // ✅ RESPONSIVE: p-6 on mobile, p-8 on desktop
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center shadow-inner md:p-8 dark:border-stone-800 dark:bg-[#201e1d]">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-stone-100 bg-white shadow-sm md:h-16 md:w-16 dark:border-stone-700 dark:bg-[#262626]">
          <div className="text-emerald-500">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 md:h-8 md:w-8"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        <h3 className="mb-2 font-serif text-xl font-bold text-stone-800 md:text-2xl dark:text-stone-100">
          You're all set.
        </h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-stone-500">
          Your {viewMode === 'week' ? 'weekly' : 'monthly'} reflection is saved.{' '}
          <br className="hidden md:block" />
          Time to execute.
        </p>

        {/* Summary */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-[10px] text-stone-400 md:mt-8 md:gap-3 md:text-xs dark:border-stone-800 dark:bg-[#262626]">
          <span>Energy: {energy}/5</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 text-xs font-bold text-stone-400 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-600 md:mt-8 dark:hover:text-stone-300"
        >
          Edit Entry
        </button>
      </div>
    )
  }

  // --- ✍️ EDITING STATE ---
  return (
    // ✅ RESPONSIVE: Reduced padding on mobile (p-4)
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6 dark:border-stone-800 dark:bg-[#262626]">
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-stone-100 p-2 text-stone-500 dark:bg-stone-800">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <h3 className="text-[10px] font-bold tracking-widest text-stone-500 uppercase md:text-xs">
            {title}
          </h3>
        </div>

        {isSubmitted && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-stone-400 transition-colors hover:text-red-500"
          >
            Cancel
          </button>
        )}
      </div>

      <form action={handleSave} className="flex flex-1 flex-col gap-4 md:gap-6">
        <input type="hidden" name="energy" value={energy} />

        {/* 1. ENERGY SCORE */}
        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-widest text-stone-400 uppercase md:mb-3 md:text-xs">
            How did you feel?
          </label>
          <div className="flex justify-between gap-1 rounded-xl bg-stone-100 p-1 md:gap-2 dark:bg-stone-800/50">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergy(level)}
                // ✅ RESPONSIVE: Larger touch targets on mobile (py-2)
                className={`flex-1 rounded-lg py-2 text-base transition-all active:scale-95 md:text-lg ${
                  energy === level
                    ? 'scale-105 bg-white shadow-sm dark:bg-stone-600'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                {level === 1
                  ? '😫'
                  : level === 2
                    ? '😕'
                    : level === 3
                      ? '😐'
                      : level === 4
                        ? '🙂'
                        : '🔥'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. JOURNAL */}
        <div className="min-h-[150px] flex-1">
          <label className="mb-2 block text-[10px] font-bold tracking-widest text-stone-400 uppercase md:text-xs">
            Notes & Observations
          </label>
          <textarea
            name="notes"
            defaultValue={initialData?.reflection_text}
            placeholder={placeholder}
            // ✅ RESPONSIVE: text-base on mobile prevents auto-zoom
            className="h-full w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-3 text-base text-stone-700 focus:ring-2 focus:ring-orange-500/20 focus:outline-none md:p-4 md:text-sm dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-200"
          />
        </div>

        {/* 3. PLANNING */}
        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-widest text-orange-500 uppercase md:mb-3 md:text-xs">
            {nextStepsLabel}
          </label>
          <div className="space-y-3 md:space-y-2">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                name={`goal_${i + 1}`}
                defaultValue={initialData?.next_week_goals?.[i]}
                placeholder={`${i + 1}. Priority...`}
                // ✅ RESPONSIVE: text-base for inputs
                className="w-full border-b border-stone-200 bg-transparent py-2 text-base transition-colors outline-none placeholder:text-stone-300 focus:border-orange-500 md:text-sm dark:border-stone-700"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] dark:bg-stone-100 dark:text-stone-900"
        >
          {isSaving ? 'Saving...' : 'Commit to Plan'}
        </button>
      </form>
    </div>
  )
}
