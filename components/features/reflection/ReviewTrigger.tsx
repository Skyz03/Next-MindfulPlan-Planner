'use client'

import { useState } from 'react'
import WeeklyReviewModal from './WeeklyReviewModal'

export default function ReviewTrigger({
  data,
  weekStart,
  nextMonday,
}: {
  data: any
  weekStart: string
  nextMonday: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Check if today is Weekend (Sat=6, Sun=0)
  const today = new Date().getDay()
  const isWeekend = today === 0 || today === 6

  if (!isWeekend) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        // ✅ RESPONSIVE:
        // 1. Position: bottom-20 on mobile (avoids nav bars/gestures), bottom-6 on desktop
        // 2. Padding: Compact on mobile (px-4), spacious on desktop (md:px-5)
        // 3. Text: "Start Weekly Review" hides to "Review" on tiny screens if needed, mostly full text fits.
        className="animate-bounce-slow fixed right-4 bottom-20 z-50 flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-bold text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 md:right-6 md:bottom-6 md:px-5 md:py-3 md:text-base dark:bg-white dark:text-stone-900"
      >
        <span>✨</span>
        <span>Start Weekly Review</span>
      </button>

      <WeeklyReviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={data}
        weekStart={weekStart}
        nextMonday={nextMonday}
      />
    </>
  )
}
