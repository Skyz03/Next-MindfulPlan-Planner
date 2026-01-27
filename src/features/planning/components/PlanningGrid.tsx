'use client'

import DroppableDay from './DroppableDay'
import DraggableTask from './DraggableTask'
import TaskItem from '@/features/tasks/components/TaskItem'
import { ArrowRight, CalendarClock } from 'lucide-react'

export default function PlanningGrid({
  weekDays,
  allTasks,
  nextWeekTasks = [],
  nextMondayStr,
}: {
  weekDays: Date[]
  allTasks: any[]
  nextWeekTasks?: any[]
  nextMondayStr: string
}) {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const safeNextWeekTasks = nextWeekTasks || []

  return (
    // ✅ RESPONSIVE: Snap scrolling for mobile
    <div className="custom-scrollbar h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden bg-[#F5F5F4] dark:bg-[#121212]">
      {/* ✅ RESPONSIVE: Dynamic padding and gap */}
      <div className="flex h-full min-w-max gap-4 p-4 md:gap-6 md:p-8">
        {/* --- STANDARD WEEK COLUMNS --- */}
        {weekDays.map((day) => {
          const dateStr = formatDate(day)
          const isToday = formatDate(new Date()) === dateStr
          const dayTasks = allTasks.filter((t) => t.due_date === dateStr)

          const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.duration || 0), 0)
          const hours = Math.floor(totalMinutes / 60)
          const mins = totalMinutes % 60
          const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

          return (
            <DroppableDay
              key={dateStr}
              dateStr={dateStr}
              // ✅ RESPONSIVE: Mobile width [85vw] allows peeking, Desktop fixed w-80
              className={`group relative flex h-full w-[85vw] snap-center flex-col rounded-3xl border transition-colors duration-300 md:w-80 ${
                isToday
                  ? 'border-stone-200 bg-white shadow-xl shadow-stone-200/50 dark:border-stone-800 dark:bg-[#1C1917] dark:shadow-black/50'
                  : 'border-transparent bg-stone-100/50 hover:border-stone-200 dark:bg-[#18181b] dark:hover:border-stone-800'
              } `}
            >
              <div className="flex-none p-5 pb-2">
                <div className="mb-1 flex items-end justify-between">
                  <span
                    className={`text-sm font-bold tracking-widest uppercase ${isToday ? 'text-orange-500' : 'text-stone-400'}`}
                  >
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="rounded bg-stone-200 px-1.5 py-0.5 font-mono text-[10px] text-stone-400 dark:bg-stone-800">
                      {timeLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-serif text-3xl font-bold ${isToday ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-stone-600'}`}
                  >
                    {day.getDate()}
                  </span>
                </div>
              </div>

              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-2">
                {dayTasks.map((task) => (
                  <DraggableTask key={task.id} task={task}>
                    <TaskItem task={task} />
                  </DraggableTask>
                ))}
                <div className="h-12 w-full transition-all group-hover:h-24"></div>
              </div>
            </DroppableDay>
          )
        })}

        {/* --- 🆕 THE "NEXT WEEK" QUEUE --- */}
        <div className="flex snap-align-none items-center justify-center">
          <div className="mx-2 h-full w-px bg-stone-300 dark:bg-stone-800/50"></div>
        </div>

        <DroppableDay
          dateStr={nextMondayStr}
          className="group relative flex h-full w-[85vw] snap-center flex-col rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 md:w-80 dark:border-stone-800/50 dark:bg-[#151515]"
        >
          <div className="flex-none p-5 pb-2 opacity-60 transition-opacity group-hover:opacity-100">
            <div className="mb-2 flex items-center gap-2 text-stone-500">
              <CalendarClock className="h-5 w-5" />
              <span className="text-sm font-bold tracking-widest uppercase">The Queue</span>
            </div>
            <h3 className="font-serif text-xl leading-tight font-bold text-stone-400 dark:text-stone-500">
              Next Week <br /> & Beyond
            </h3>
          </div>

          <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-2">
            {safeNextWeekTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                <div className="opacity-80 transition-opacity hover:opacity-100">
                  <TaskItem task={task} />
                </div>
              </DraggableTask>
            ))}

            {safeNextWeekTasks.length === 0 && (
              <div className="mt-8 px-4 text-center">
                <p className="text-xs leading-relaxed text-stone-400">
                  Drag tasks here to push them to next week. They will appear on Monday.
                </p>
              </div>
            )}
            <div className="h-24 w-full"></div>
          </div>
        </DroppableDay>
      </div>
    </div>
  )
}
