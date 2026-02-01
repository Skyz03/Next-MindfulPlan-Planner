'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { useEffect, useState, useRef, useOptimistic, startTransition } from 'react'
import { scheduleTaskTime, toggleTask, updateTaskDuration, updateTaskDescription } from '@/features/tasks/actions'
import TaskTimer from './TaskTimer'
import DurationInput from '@/core/ui/DurationInput'
import { FileText, X, Clock, Calendar } from 'lucide-react'
import { Task } from '@/types'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM
const PIXELS_PER_HOUR = 140

export default function TimeGrid({ tasks }: { tasks: any[] }) {
  const [now, setNow] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMobileDockOpen, setIsMobileDockOpen] = useState(false)

  // 🆕 STATE: Track which task's note is open
  const [activeNoteTask, setActiveNoteTask] = useState<any>(null)

  // 1. OPTIMISTIC STATE
  const [optimisticTasks, setOptimisticTask] = useOptimistic(
    tasks,
    (state, { taskId, changes }: { taskId: string; changes: any }) => {
      return state.map((t) => (t.id === taskId ? { ...t, ...changes } : t))
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
      setOptimisticTask({ taskId, changes: { is_completed: newStatus } })
    })
    toggleTask(taskId, newStatus)
  }

  function handleDurationChange(taskId: string, newDuration: number) {
    startTransition(() => {
      setOptimisticTask({ taskId, changes: { duration: newDuration } })
    })
    updateTaskDuration(taskId, newDuration)
  }

  return (
    <div className="group/container relative flex h-full">
      {/* 1. TIMELINE */}
      <div className="custom-scrollbar relative h-full flex-1 overflow-y-auto bg-[#FAFAF9] dark:bg-[#1C1917]">
        <div
          className="absolute top-0 right-0 left-0 w-full p-4"
          style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px`, paddingBottom: '120px' }}
        >
          {HOURS.map((hour) => {
            const timeLabel = `${hour < 10 ? '0' + hour : hour}:00`
            return (
              <TimeSlot key={hour} time={timeLabel} onClick={() => setSelectedSlot(timeLabel)} />
            )
          })}

          {nowPosition > 0 && (
            <div
              className="pointer-events-none absolute right-0 left-16 z-10 border-t-2 border-red-500"
              style={{ top: `${nowPosition}px` }}
            >
              <div className="absolute -top-1.5 -left-2 h-3 w-3 rounded-full bg-red-500"></div>
            </div>
          )}

          {/* RENDER TASKS */}
          {scheduledTasks.map((task) => {
            const [h, m] = task.start_time.split(':').map(Number)
            const startHour = 5
            const topPosition = (h - startHour) * PIXELS_PER_HOUR + (m / 60) * PIXELS_PER_HOUR + 16

            const height = Math.max((task.duration / 60) * PIXELS_PER_HOUR, 80)

            return (
              <TimeGridTaskCard
                key={task.id}
                task={task}
                isDone={task.is_completed}
                isRunning={!!task.last_started_at}
                height={height}
                topPosition={topPosition}
                unschedule={unschedule}
                handleToggle={handleToggle}
                handleDurationChange={handleDurationChange}
                // 🆕 Pass the opener function
                onOpenNotes={() => setActiveNoteTask(task)}
              />
            )
          })}

          {/* QUICK PICKER MODAL */}
          {selectedSlot && (
            <div
              ref={menuRef}
              className="animate-in fade-in zoom-in-95 absolute right-10 left-24 z-50 rounded-xl border border-stone-200 bg-white shadow-2xl duration-100 dark:border-stone-700 dark:bg-stone-800"
              style={{
                top: `${(parseInt(selectedSlot.split(':')[0]) - 5) * PIXELS_PER_HOUR + 20}px`,
              }}
            >
              <div className="flex items-center justify-between rounded-t-xl border-b border-stone-100 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-900/50">
                <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                  Schedule for {selectedSlot}
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
                    No unscheduled tasks available.
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

      {/* 2. DOCK */}
      <div className="z-20 flex hidden w-72 flex-col border-l border-stone-200 bg-white shadow-xl md:flex dark:border-stone-800 dark:bg-[#221F1D]">
        <div className="border-b border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
          <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">Unscheduled</h3>
          <p className="text-xs text-stone-400">Tasks for today.</p>
        </div>
        <DockDropZone>
          <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-3">
            {unscheduledTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                <div className="group cursor-grab rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-orange-400 active:cursor-grabbing dark:border-stone-700 dark:bg-stone-800">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                    {task.title}
                  </span>
                </div>
              </DraggableTask>
            ))}
            {unscheduledTasks.length === 0 && (
              <div className="flex h-40 flex-col items-center justify-center text-stone-300">
                <span className="text-xs italic">All scheduled</span>
              </div>
            )}
          </div>
        </DockDropZone>
      </div>

      {/* 3. MOBILE DOCK */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileDockOpen(!isMobileDockOpen)}
          className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          Unscheduled ({unscheduledTasks.length})
          {isMobileDockOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
          )}
        </button>

        {isMobileDockOpen && (
          <div
            className="animate-in fade-in fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileDockOpen(false)}
          />
        )}

        <div
          className={`fixed right-0 bottom-0 left-0 z-50 transform rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#1C1917] ${isMobileDockOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ maxHeight: '60vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />
          <div className="border-b border-stone-100 p-4 dark:border-stone-800">
            <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">
              Unscheduled Tasks
            </h3>
          </div>
          <div className="custom-scrollbar h-[50vh] overflow-y-auto p-1">
            <DockDropZone>
              <div className="flex-1 space-y-3 p-3">
                {unscheduledTasks.map((task) => (
                  <DraggableTask key={task.id} task={task}>
                    <div className="group cursor-grab rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-orange-400 active:cursor-grabbing dark:border-stone-700 dark:bg-stone-800">
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                        {task.title}
                      </span>
                    </div>
                  </DraggableTask>
                ))}
                {unscheduledTasks.length === 0 && (
                  <div className="flex h-32 flex-col items-center justify-center text-stone-300">
                    <span className="text-xs italic">All clear!</span>
                  </div>
                )}
              </div>
            </DockDropZone>
          </div>
        </div>
      </div>

      {/* 🆕 TASK NOTE POPUP MODAL */}
      {activeNoteTask && (
        <TaskNoteModal
          task={activeNoteTask}
          onClose={() => setActiveNoteTask(null)}
        />
      )}

    </div>
  )
}

// ⚡️ UPDATED SUB-COMPONENT
function TimeGridTaskCard({ task, isDone, isRunning, height, topPosition, unschedule, handleToggle, handleDurationChange, onOpenNotes }: any) {

  return (
    <DraggableTask
      key={task.id}
      task={task}
      className="absolute right-4 left-20 z-10"
      style={{ top: `${topPosition}px`, height: `${height}px` }}
    >
      <div
        className={`group/card flex h-full flex-col justify-between rounded-xl border p-3 text-xs shadow-sm transition-all hover:z-30 hover:scale-[1.01] overflow-hidden ${isDone
          ? 'border-stone-200 bg-stone-50 opacity-60 dark:bg-stone-800'
          : isRunning
            ? 'z-20 border-orange-500 bg-white shadow-lg ring-1 shadow-orange-500/10 ring-orange-500/20 dark:bg-[#262626]'
            : 'border-stone-200 bg-white hover:border-orange-300 dark:border-stone-700 dark:bg-[#262626]'
          } `}
      >
        {/* TOP ROW */}
        <div className="flex items-start justify-between gap-2 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className={`text-sm leading-tight font-bold truncate ${isDone ? 'text-stone-400 line-through' : 'text-stone-800 dark:text-stone-100'}`}>
              {task.title}
            </div>

            <div
              className="mt-1 flex items-center gap-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="font-mono text-[10px] text-stone-400">
                {task.start_time.slice(0, 5)}
              </div>
              <div className="h-3 w-px bg-stone-200 dark:bg-stone-700"></div>
              <DurationInput
                defaultMinutes={task.duration}
                onChange={(val: number) => handleDurationChange(task.id, val)}
              />
            </div>
          </div>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              unschedule(task.id)
            }}
            className="rounded-md p-1.5 text-stone-300 transition-colors hover:bg-stone-100 hover:text-red-500 dark:hover:bg-stone-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* BOTTOM ROW */}
        <div
          className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2 flex-shrink-0 dark:border-stone-800"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <div className={isDone ? 'pointer-events-none opacity-0' : 'opacity-100'}>
              <TaskTimer task={task} />
            </div>

            {/* 📝 NOTES BUTTON (Triggers Modal) */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenNotes() }}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${task.description ? 'text-stone-600 bg-stone-100 dark:text-stone-300 dark:bg-stone-700' : 'text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              title="Open Notes"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggle(task.id, isDone)
            }}
            className={`flex h-6 md:h-7 items-center gap-1.5 rounded-md border px-2 md:px-3 text-[10px] md:text-xs font-bold transition-all ${isDone
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
}

// 🆕 THE POPUP COMPONENT
function TaskNoteModal({ task, onClose }: { task: Task, onClose: () => void }) {
  // Local state for the textarea value
  const [desc, setDesc] = useState(task.description || '')

  const handleSave = () => {
    if (!task.id) return
    updateTaskDescription(task.id, desc)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-[#1C1917] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${task.is_completed ? 'bg-emerald-500' : 'bg-stone-300'}`} />
            <h3 className="font-bold text-stone-800 dark:text-stone-100 line-clamp-1">{task.title}</h3>
          </div>
          <button onClick={handleSave} className="rounded-full p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-600 dark:hover:bg-stone-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-0">
          <textarea
            autoFocus
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Log your results, blockers, or ideas..."
            className="h-64 w-full resize-none p-6 text-sm leading-relaxed text-stone-700 outline-none placeholder:text-stone-300 dark:bg-[#1C1917] dark:text-stone-300"
          />
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-6 py-3 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex gap-4 text-xs text-stone-400">
            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {task.duration}m scheduled</span>
            {task.start_time && <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {task.start_time}</span>}
          </div>
          <button
            onClick={handleSave}
            className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-black dark:bg-white dark:text-black"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}

function TimeSlot({ time, onClick }: { time: string; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${time}`, data: { time: time } })
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className="group relative flex cursor-pointer"
      style={{ height: `${PIXELS_PER_HOUR}px` }}
    >
      <div className="pointer-events-none -mt-2.5 w-16 pr-4 text-right font-mono text-xs font-bold text-stone-400 select-none">
        {time}
      </div>
      <div
        className={`flex-1 border-t border-stone-200 transition-colors dark:border-stone-800 ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : 'group-hover:bg-stone-50 dark:group-hover:bg-white/5'}`}
      >
        <div className="pointer-events-none h-[50%] border-b border-dashed border-stone-100 dark:border-stone-800/30"></div>
        <div className="hidden h-full items-center justify-center opacity-30 group-hover:flex">
          <span className="text-[10px] font-bold text-stone-400 uppercase">+ Schedule Here</span>
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
      className={`flex flex-1 flex-col overflow-hidden transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
    >
      {children}
    </div>
  )
}