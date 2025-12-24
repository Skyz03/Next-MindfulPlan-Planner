'use client'

import { useState, useEffect } from 'react'
import { toggleTimer } from '@/actions/task'

export default function TaskTimer({ task }: { task: any }) {
  const [isRunning, setIsRunning] = useState(!!task.last_started_at)
  const [elapsed, setElapsed] = useState(task.actual_duration || 0)

  useEffect(() => {
    setIsRunning(!!task.last_started_at)
    if (task.last_started_at) {
      const startTime = new Date(task.last_started_at).getTime()
      const now = new Date().getTime()
      const currentSession = Math.floor((now - startTime) / 60000)
      setElapsed((task.actual_duration || 0) + currentSession)
    } else {
      setElapsed(task.actual_duration || 0)
    }
  }, [task.last_started_at, task.actual_duration])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && task.last_started_at) {
      const startTime = new Date(task.last_started_at).getTime()
      interval = setInterval(() => {
        const now = new Date().getTime()
        const currentSessionMinutes = Math.floor((now - startTime) / 60000)
        setElapsed((task.actual_duration || 0) + currentSessionMinutes)
      }, 1000 * 60)
    }
    return () => clearInterval(interval)
  }, [isRunning, task.last_started_at, task.actual_duration])

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRunning(!isRunning)
    await toggleTimer(task.id)
  }

  const isOverBudget = elapsed > task.duration

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        // ✅ RESPONSIVE: h-8 on mobile (better touch target), md:h-7 on desktop
        className={`flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-bold transition-all md:h-7 ${
          isRunning
            ? 'animate-pulse border-red-600 bg-red-500 text-white shadow-sm'
            : 'border-stone-200 bg-white text-stone-600 hover:border-orange-500 hover:text-orange-600'
        }`}
      >
        {isRunning ? (
          <>
            <div className="h-2 w-2 animate-none rounded-sm bg-white" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Start</span>
          </>
        )}
      </button>

      {/* Time Display Pill */}
      {(elapsed > 0 || isRunning) && (
        <div
          // ✅ RESPONSIVE: h-8 on mobile, md:h-7 on desktop
          className={`flex h-8 items-center rounded-md border px-2 font-mono text-[10px] font-bold md:h-7 ${
            isOverBudget
              ? 'border-red-100 bg-red-50 text-red-600'
              : isRunning
                ? 'border-orange-100 bg-orange-50 text-orange-700'
                : 'border-stone-200 bg-stone-50 text-stone-500'
          }`}
        >
          {elapsed}m <span className="mx-1 text-stone-300">/</span> {task.duration}m
        </div>
      )}
    </div>
  )
}
