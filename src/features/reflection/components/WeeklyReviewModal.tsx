'use client'

import { useState, useEffect } from 'react'
import { migrateUncompletedTasks, saveWeeklyReflection } from '@/features/reflection/actions'
import { useRouter } from 'next/navigation'

export default function WeeklyReviewModal({
  isOpen,
  onClose,
  data,
  weekStart,
  nextMonday,
}: {
  isOpen: boolean
  onClose: () => void
  data: any
  weekStart: string
  nextMonday: string
}) {
  const [step, setStep] = useState(0)
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  if (!isOpen || !data) return null

  const steps = [
    // STEP 0: INTRO
    <div key="intro" className="space-y-6 py-4 text-center md:py-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl md:h-16 md:w-16 md:text-3xl dark:bg-stone-800">
        🧘
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-stone-800 md:text-2xl dark:text-stone-100">
          Sunday Review
        </h2>
        <p className="mt-2 text-sm text-stone-500 md:text-base">
          Take 2 minutes to close your loops and align for the week ahead.
        </p>
      </div>
      <button
        onClick={() => setStep(1)}
        className="w-full rounded-xl bg-orange-500 px-8 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 md:w-auto"
      >
        Start Review
      </button>
    </div>,

    // STEP 1: CLEAR THE DECKS
    <div key="clear" className="space-y-4 md:space-y-6">
      <header>
        <h3 className="font-serif text-lg font-bold md:text-xl">Clear the Decks</h3>
        <p className="text-xs text-stone-500 md:text-sm">
          You have {data.uncompleted?.length || 0} unfinished tasks. Move them or delete them.
        </p>
      </header>

      {/* ✅ RESPONSIVE: Max height adjust for mobile screens */}
      <div className="custom-scrollbar max-h-[40vh] space-y-2 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-3 pr-2 md:max-h-[300px] md:p-4 dark:border-stone-800 dark:bg-stone-900/50">
        {data.uncompleted?.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-400 italic">
            All clean! Nothing to clear.
          </p>
        ) : (
          data.uncompleted?.map((t: any) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-stone-100 bg-white p-3 dark:border-stone-700 dark:bg-stone-800"
            >
              <span className="max-w-[150px] truncate text-xs font-medium md:max-w-[200px] md:text-sm">
                {t.title}
              </span>
              <span className="rounded bg-red-50 px-2 py-1 text-[10px] text-red-400 dark:bg-red-900/20">
                Overdue
              </span>
            </div>
          ))
        )}
      </div>

      {data.uncompleted?.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={async () => {
              await migrateUncompletedTasks(
                data.uncompleted.map((t: any) => t.id),
                'move-next-week',
                nextMonday,
              )
              setStep(2)
            }}
            className="rounded-xl border border-stone-200 p-3 text-xs font-bold text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            🗓️ Move All to Next Week
          </button>
          <button
            onClick={async () => {
              await migrateUncompletedTasks(
                data.uncompleted.map((t: any) => t.id),
                'move-backlog',
              )
              setStep(2)
            }}
            className="rounded-xl border border-stone-200 p-3 text-xs font-bold text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            📥 Return to Backlog
          </button>
        </div>
      )}
      {data.uncompleted?.length === 0 && (
        <button
          onClick={() => setStep(2)}
          className="w-full rounded-xl bg-stone-800 py-3 font-bold text-white"
        >
          Next
        </button>
      )}
    </div>,

    // STEP 2: CELEBRATE
    <div key="celebrate" className="space-y-6 py-4 text-center md:space-y-8">
      <h3 className="font-serif text-lg font-bold md:text-xl">Weekly Intelligence</h3>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4 md:p-6 dark:border-green-900/50 dark:bg-green-900/20">
          <div className="text-3xl font-bold text-green-600 md:text-4xl dark:text-green-400">
            {data.completedCount}
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-wider text-green-800/60 uppercase md:text-xs dark:text-green-200/60">
            Completed
          </div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 md:p-6 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div className="text-3xl font-bold text-blue-600 md:text-4xl dark:text-blue-400">
            {data.totalCount > 0 ? Math.round((data.completedCount / data.totalCount) * 100) : 0}%
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-wider text-blue-800/60 uppercase md:text-xs dark:text-blue-200/60">
            Velocity
          </div>
        </div>
      </div>

      <p className="mx-auto max-w-xs text-xs text-stone-500 md:text-sm">
        "Success is the sum of small efforts, repeated day in and day out."
      </p>

      <button
        onClick={() => setStep(3)}
        className="w-full rounded-xl bg-stone-800 py-3 font-bold text-white transition-all hover:bg-black"
      >
        Continue
      </button>
    </div>,

    // STEP 3: ALIGN
    <div key="align" className="space-y-4 md:space-y-6">
      <header>
        <h3 className="font-serif text-lg font-bold md:text-xl">Align & Reflect</h3>
        <p className="text-xs text-stone-500 md:text-sm">
          Did this week move your Top Goal forward? What did you learn?
        </p>
      </header>

      <textarea
        autoFocus
        className="h-28 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm ring-orange-500/50 outline-none focus:ring-2 md:h-32 dark:border-stone-700 dark:bg-stone-800/50"
        placeholder="I learned that..."
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
      />

      <button
        disabled={isSubmitting}
        onClick={async () => {
          setIsSubmitting(true)
          await saveWeeklyReflection(weekStart, data.completedCount, data.totalCount, reflection)
          setIsSubmitting(false)
          onClose()
          router.refresh()
        }}
        className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:opacity-70"
      >
        {isSubmitting ? 'Saving...' : 'Complete Review'}
      </button>
    </div>,
  ]

  return (
    // ✅ RESPONSIVE: Safe area padding on mobile (p-4), backdrop blur
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm duration-200 dark:bg-black/80">
      {/* ✅ RESPONSIVE: Full width/height on very small screens if needed, otherwise centered modal */}
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-2xl dark:border-stone-800 dark:bg-[#1C1917]">
        {/* Progress Bar */}
        <div className="h-1 flex-shrink-0 bg-stone-100 dark:bg-stone-800">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          ></div>
        </div>

        {/* Scrollable Content Area */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-6 md:p-8">{steps[step]}</div>

        {step > 0 && (
          <div className="flex-shrink-0 bg-stone-50 p-3 text-center dark:bg-stone-900/50">
            <button
              onClick={onClose}
              className="text-xs font-medium text-stone-400 hover:text-stone-600"
            >
              Skip Review
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
