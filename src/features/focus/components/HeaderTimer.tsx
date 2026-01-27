'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square } from 'lucide-react'

export default function HeaderTimer() {
  const [isActive, setIsActive] = useState(false)
  const [seconds, setSeconds] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => setIsActive(!isActive)

  const stopTimer = () => {
    setIsActive(false)
    setSeconds(0)
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-full border py-1 pr-1 pl-2 transition-all duration-300 md:gap-3 md:py-1.5 md:pr-1.5 md:pl-3 ${
        isActive
          ? 'border-orange-200 bg-orange-50 text-orange-700 shadow-sm dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
          : 'border-stone-200 bg-white text-stone-500 dark:border-stone-700 dark:bg-stone-800'
      } `}
    >
      {/* Time Display: Smaller text on mobile */}
      <div className="w-10 text-center font-mono text-xs font-bold tracking-wider select-none md:w-12 md:text-sm">
        {formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTimer}
          className={`rounded-full p-1 transition-colors md:p-1.5 ${isActive ? 'hover:bg-orange-200/50 dark:hover:bg-orange-800/50' : 'hover:bg-stone-100 dark:hover:bg-stone-700'}`}
          title={isActive ? 'Pause' : 'Start'}
        >
          {isActive ? (
            <Pause className="h-3 w-3 fill-current md:h-3.5 md:w-3.5" />
          ) : (
            <Play className="h-3 w-3 fill-current md:h-3.5 md:w-3.5" />
          )}
        </button>

        {(seconds > 0 || isActive) && (
          <button
            onClick={stopTimer}
            className="rounded-full p-1 text-stone-400 transition-colors hover:bg-red-100 hover:text-red-500 md:p-1.5"
            title="Stop & Reset"
          >
            <Square className="h-2.5 w-2.5 fill-current md:h-3 md:w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
