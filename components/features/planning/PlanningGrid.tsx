'use client'

import DroppableDay from './DroppableDay'
import DraggableTask from './DraggableTask'
import TaskItem from './TaskItem'

export default function PlanningGrid({
  weekDays,
  allTasks,
}: {
  weekDays: Date[]
  allTasks: any[]
}) {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="custom-scrollbar h-full w-full overflow-x-auto overflow-y-hidden bg-[#F5F5F4] dark:bg-[#121212]">
      {/* THE GRID LAYOUT 
         Added gap-6 for breathing room.
         Added min-w to ensure columns don't crush on small screens.
      */}
      <div className="flex h-full min-w-max gap-6 p-8">
        {weekDays.map((day) => {
          const dateStr = formatDate(day)
          const isToday = formatDate(new Date()) === dateStr
          const dayTasks = allTasks.filter((t) => t.due_date === dateStr)

          // Total Estimated Time
          const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.duration || 0), 0)
          const hours = Math.floor(totalMinutes / 60)
          const mins = totalMinutes % 60
          const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

          return (
            <DroppableDay
              key={dateStr}
              dateStr={dateStr}
              className={`group relative flex h-full w-80 flex-col rounded-3xl border transition-colors duration-300 ${
                isToday
                  ? 'border-stone-200 bg-white shadow-xl shadow-stone-200/50 dark:border-stone-800 dark:bg-[#1C1917] dark:shadow-black/50'
                  : 'border-transparent bg-stone-100/50 hover:border-stone-200 dark:bg-[#18181b] dark:hover:border-stone-800'
              } `}
            >
              {/* DAY HEADER */}
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

              {/* TASKS CONTAINER (Scrollable within the day) */}
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-2">
                {dayTasks.map((task) => (
                  <DraggableTask key={task.id} task={task}>
                    <TaskItem task={task} />
                  </DraggableTask>
                ))}

                {/* Empty State / Drop Target Area */}
                {dayTasks.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800">
                    <span className="text-xs font-medium text-stone-400">Drop plan here</span>
                  </div>
                )}

                {/* Bottom spacer for easy dropping at end of list */}
                <div className="h-12 w-full transition-all group-hover:h-24"></div>
              </div>
            </DroppableDay>
          )
        })}
      </div>
    </div>
  )
}
