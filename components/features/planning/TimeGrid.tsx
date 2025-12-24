'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { useEffect, useState, useRef, useOptimistic, startTransition } from 'react'
import { scheduleTaskTime, toggleTask } from '@/actions/task'
import TaskTimer from './TaskTimer'
import { ChevronUp, ChevronDown, List } from 'lucide-react'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM
const PIXELS_PER_HOUR = 140

export default function TimeGrid({ tasks }: { tasks: any[] }) {
  const [now, setNow] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isMobileDockOpen, setIsMobileDockOpen] = useState(false) // 🆕 Mobile State
  const menuRef = useRef<HTMLDivElement>(null)

  const [optimisticTasks, setOptimisticTask] = useOptimistic(
    tasks,
    (state, { taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
      return state.map((t) => (t.id === taskId ? { ...t, is_completed: isCompleted } : t))
    },
  )

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedSlot(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const scheduledTasks = optimisticTasks.filter((t) => t.start_time)
  const unscheduledTasks = optimisticTasks.filter((t) => !t.start_time && !t.is_completed)

  let nowPosition = -1
  if (now) {
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    if (currentHour >= 5 && currentHour <= 22) {
      nowPosition = (currentHour - 5) * PIXELS_PER_HOUR + (currentMin / 60) * PIXELS_PER_HOUR
    }
  }

  async function quickSchedule(taskId: string) {
    if (!selectedSlot) return
    await scheduleTaskTime(taskId, selectedSlot, 60)
    setSelectedSlot(null)
  }

  async function unschedule(taskId: string) {
    await scheduleTaskTime(taskId, null)
  }

  function handleToggle(taskId: string, currentStatus: boolean) {
    const newStatus = !currentStatus
    startTransition(() => {
      setOptimisticTask({ taskId, isCompleted: newStatus })
    })
    toggleTask(taskId, newStatus)
  }

  return (
    <div className="group/container relative flex h-full overflow-hidden">
      {/* 1. TIMELINE (Takes full width on mobile, flexible on desktop) */}
      <div className="custom-scrollbar relative h-full flex-1 overflow-y-auto bg-[#FAFAF9] dark:bg-[#1C1917]">
        <div
          className="absolute top-0 right-0 left-0 w-full p-2 md:p-4"
          style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px`, paddingBottom: '100px' }} // Extra padding for mobile dock
        >
          {HOURS.map((hour) => {
            const timeLabel = `${hour < 10 ? '0' + hour : hour}:00`
            return (
              <TimeSlot key={hour} time={timeLabel} onClick={() => setSelectedSlot(timeLabel)} />
            )
          })}

          {/* Current Time Indicator */}
          {nowPosition > 0 && (
            <div
              className="pointer-events-none absolute right-0 left-12 z-10 border-t-2 border-red-500 md:left-16"
              style={{ top: `${nowPosition}px` }}
            >
              <div className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-red-500"></div>
            </div>
          )}

          {/* TASK CARDS */}
          {scheduledTasks.map((task) => {
            const [h, m] = task.start_time.split(':').map(Number)
            const startHour = 5
            const topPosition = (h - startHour) * PIXELS_PER_HOUR + (m / 60) * PIXELS_PER_HOUR + 16
            const height = Math.max((task.duration / 60) * PIXELS_PER_HOUR, 80)
            const isDone = task.is_completed
            const isRunning = !!task.last_started_at

            return (
              <DraggableTask key={task.id} task={task}>
                <div
                  // ✅ RESPONSIVE: left-12 on mobile, left-20 on desktop
                  className={`group/card absolute right-2 left-12 flex cursor-grab flex-col justify-between rounded-xl border p-2 text-xs shadow-sm transition-all hover:z-30 hover:scale-[1.01] md:right-4 md:left-20 md:p-3 ${
                    isDone
                      ? 'border-stone-200 bg-stone-50 opacity-60 dark:bg-stone-800'
                      : isRunning
                        ? 'z-20 border-orange-500 bg-white shadow-lg ring-1 shadow-orange-500/10 ring-orange-500/20 dark:bg-[#262626]'
                        : 'border-stone-200 bg-white hover:border-orange-300 dark:border-stone-700 dark:bg-[#262626]'
                  } `}
                  style={{ top: `${topPosition}px`, height: `${height}px` }}
                >
                  {/* TOP ROW */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div
                        className={`truncate text-sm leading-tight font-bold ${isDone ? 'text-stone-400 line-through' : 'text-stone-800 dark:text-stone-100'}`}
                      >
                        {task.title}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-stone-400">
                        {task.start_time.slice(0, 5)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        unschedule(task.id)
                      }}
                      className="rounded-md p-1.5 text-stone-300 transition-colors hover:bg-stone-100 hover:text-red-500 dark:hover:bg-stone-800"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  {/* BOTTOM ROW */}
                  <div className="mt-1 flex items-center justify-between border-t border-stone-100 pt-1.5 dark:border-stone-800">
                    <div className={isDone ? 'pointer-events-none opacity-0' : 'opacity-100'}>
                      <TaskTimer task={task} />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(task.id, isDone)
                      }}
                      className={`flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10px] font-bold transition-all md:h-7 md:px-3 md:text-xs ${
                        isDone
                          ? 'border-green-200 bg-green-100 text-green-700 hover:bg-green-200'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-green-500 hover:text-green-600'
                      }`}
                    >
                      {isDone ? <span>Done</span> : <span>Check</span>}
                    </button>
                  </div>
                </div>
              </DraggableTask>
            )
          })}

          {/* Quick Slot Picker Modal */}
          {selectedSlot && (
            <div
              ref={menuRef}
              className="animate-in fade-in zoom-in-95 absolute right-4 left-12 z-50 rounded-xl border border-stone-200 bg-white shadow-2xl duration-100 md:right-10 md:left-24 dark:border-stone-700 dark:bg-stone-800"
              style={{
                top: `${(parseInt(selectedSlot.split(':')[0]) - 5) * PIXELS_PER_HOUR + 20}px`,
              }}
            >
              <div className="flex items-center justify-between rounded-t-xl border-b border-stone-100 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-900/50">
                <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                  Schedule {selectedSlot}
                </span>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>
              <div className="custom-scrollbar max-h-60 overflow-y-auto p-2">
                {unscheduledTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400 italic">
                    No unscheduled tasks.
                  </div>
                ) : (
                  unscheduledTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => quickSchedule(task.id)}
                      className="group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                        {task.title}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 opacity-0 transition-opacity group-hover:text-orange-500 group-hover:opacity-100">
                        Select
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. DESKTOP DOCK (Hidden on Mobile) */}
      <div className="z-20 hidden w-72 flex-col border-l border-stone-200 bg-white shadow-xl md:flex dark:border-stone-800 dark:bg-[#221F1D]">
        <DockHeader count={unscheduledTasks.length} />
        <DockContent tasks={unscheduledTasks} />
      </div>

      {/* 3. MOBILE DOCK (Slide-up Sheet) */}
      <div className="md:hidden">
        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsMobileDockOpen(!isMobileDockOpen)}
          className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
        >
          <List className="h-4 w-4" />
          Unscheduled ({unscheduledTasks.length})
          {isMobileDockOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>

        {/* Backdrop */}
        {isMobileDockOpen && (
          <div
            className="animate-in fade-in fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileDockOpen(false)}
          />
        )}

        {/* The Sheet */}
        <div
          className={`fixed right-0 bottom-0 left-0 z-50 transform rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#1C1917] ${isMobileDockOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ maxHeight: '60vh' }}
        >
          <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />
          <DockHeader count={unscheduledTasks.length} />
          <div className="custom-scrollbar h-[50vh] overflow-y-auto p-1">
            <DockContent tasks={unscheduledTasks} />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- SUB COMPONENTS ---

function DockHeader({ count }: { count: number }) {
  return (
    <div className="border-b border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
      <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">Unscheduled</h3>
      <p className="text-xs text-stone-400">{count} tasks pending.</p>
    </div>
  )
}

function DockContent({ tasks }: { tasks: any[] }) {
  return (
    <DockDropZone>
      <div className="flex-1 space-y-3 p-3">
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task}>
            <div className="group cursor-grab rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-orange-400 active:cursor-grabbing dark:border-stone-700 dark:bg-stone-800">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                {task.title}
              </span>
            </div>
          </DraggableTask>
        ))}
        {tasks.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 text-stone-300 dark:border-stone-800">
            <span className="text-xs italic">All clear!</span>
          </div>
        )}
      </div>
    </DockDropZone>
  )
}

function TimeSlot({ time, onClick }: { time: string; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${time}`, data: { time: time } })
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className="group relative flex cursor-pointer touch-manipulation"
      style={{ height: `${PIXELS_PER_HOUR}px` }}
    >
      {/* ✅ RESPONSIVE: Width reduced for mobile to save space */}
      <div className="pointer-events-none -mt-2.5 w-10 pr-2 text-right font-mono text-[10px] font-bold text-stone-400 select-none md:w-16 md:pr-4 md:text-xs">
        {time}
      </div>
      <div
        className={`flex-1 border-t border-stone-200 transition-colors dark:border-stone-800 ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : 'group-hover:bg-stone-50 dark:group-hover:bg-white/5'}`}
      >
        <div className="pointer-events-none h-[50%] border-b border-dashed border-stone-100 dark:border-stone-800/30"></div>
        <div className="hidden h-full items-center justify-center opacity-30 group-hover:flex">
          <span className="text-[10px] font-bold text-stone-400 uppercase">+</span>
        </div>
      </div>
    </div>
  )
}

function DockDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'dock', data: { type: 'dock' } })
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-1 flex-col transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
    >
      {children}
    </div>
  )
}
