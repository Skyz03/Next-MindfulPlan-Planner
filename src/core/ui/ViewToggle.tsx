'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Zap, CalendarDays, Mountain } from 'lucide-react'

export default function ViewToggle() {
  const searchParams = useSearchParams()
  
  // 1. Get current state from URL
  const currentView = searchParams.get('view') || 'plan'
  const currentDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const views = [
    { id: 'focus', label: 'Focus', icon: Zap },
    { id: 'plan', label: 'Plan', icon: CalendarDays },
    { id: 'strategy', label: 'Strategy', icon: Mountain },
  ]

  return (
    <div 
      id="tour-planner" // Kept your ID for the tour guide
      className="flex items-center gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-sm dark:border-stone-800 dark:bg-[#1C1917]"
    >
      {views.map((view) => {
        const isActive = currentView === view.id

        return (
          <Link
            key={view.id}
            id={`view-toggle-${view.id}`} // Kept IDs for tour
            href={`/dashboard?date=${currentDate}&view=${view.id}`}
            className={`
              group relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200
              ${isActive
                ? 'bg-stone-900 text-white shadow-md dark:bg-white dark:text-black'
                : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800'
              }
            `}
          >
            <view.icon className="h-4 w-4 stroke-[2.5]" />
            
            {/* Tooltip on Hover */}
            <span className="absolute top-full mt-2 pointer-events-none scale-0 rounded-md bg-stone-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100 dark:bg-white dark:text-black">
              {view.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}