'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { useEffect, useState, useRef, useOptimistic, startTransition } from 'react'
import { scheduleTaskTime, toggleTask } from '@/app/actions'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM
const PIXELS_PER_HOUR = 120

export default function TimeGrid({ tasks }: { tasks: any[] }) {
    const [now, setNow] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // ⚡️ OPTIMISTIC STATE: This makes the UI instant
    // It allows us to flip the 'is_completed' switch before the server responds
    const [optimisticTasks, setOptimisticTask] = useOptimistic(
        tasks,
        (state, { taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
            return state.map((t) =>
                t.id === taskId ? { ...t, is_completed: isCompleted } : t
            )
        }
    )

    useEffect(() => {
        setNow(new Date())
        const interval = setInterval(() => setNow(new Date()), 60000)

        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setSelectedSlot(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            clearInterval(interval)
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Filter based on OPTIMISTIC data, not raw data
    const scheduledTasks = optimisticTasks.filter(t => t.start_time)
    const unscheduledTasks = optimisticTasks.filter(t => !t.start_time && !t.is_completed)

    let nowPosition = -1
    if (now) {
        const currentHour = now.getHours()
        const currentMin = now.getMinutes()
        if (currentHour >= 5 && currentHour <= 22) {
            nowPosition = ((currentHour - 5) * PIXELS_PER_HOUR) + ((currentMin / 60) * PIXELS_PER_HOUR)
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

    // ⚡️ THE FIX: Wrapped in startTransition
    function handleToggle(taskId: string, currentStatus: boolean) {
        const newStatus = !currentStatus

        // 1. Instant UI update
        startTransition(() => {
            setOptimisticTask({ taskId, isCompleted: newStatus })
        })

        // 2. Server Update
        toggleTask(taskId, newStatus)
    }

    return (
        <div className="flex h-full relative group/container">

            {/* 1. THE TIMELINE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#FAFAF9] dark:bg-[#1C1917] h-full">
                <div
                    className="absolute top-0 left-0 right-0 w-full p-4"
                    style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px` }}
                >
                    {HOURS.map(hour => {
                        const timeLabel = `${hour < 10 ? '0' + hour : hour}:00`
                        return (
                            <TimeSlot
                                key={hour}
                                time={timeLabel}
                                onClick={() => setSelectedSlot(timeLabel)}
                            />
                        )
                    })}

                    {nowPosition > 0 && (
                        <div className="absolute left-16 right-0 border-t-2 border-red-500 z-10 pointer-events-none" style={{ top: `${nowPosition}px` }}>
                            <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    )}

                    {scheduledTasks.map(task => {
                        const [h, m] = task.start_time.split(':').map(Number)
                        const startHour = 5
                        const topPosition = ((h - startHour) * PIXELS_PER_HOUR) + ((m / 60) * PIXELS_PER_HOUR) + 16
                        const height = Math.max((task.duration / 60) * PIXELS_PER_HOUR, 40)
                        const isDone = task.is_completed

                        return (
                            <DraggableTask key={task.id} task={task}>
                                <div
                                    className={`absolute left-20 right-4 rounded-xl border-l-4 pl-4 py-3 text-xs hover:z-30 cursor-grab shadow-sm transition-all hover:scale-[1.01] group/card flex flex-col justify-between
                          ${isDone
                                            ? 'bg-stone-100 dark:bg-stone-800 border-stone-400 opacity-80'
                                            : 'bg-orange-100 dark:bg-orange-900/30 border-orange-500'
                                        }
                        `}
                                    style={{ top: `${topPosition}px`, height: `${height}px` }}
                                >
                                    <div className="pr-12"> {/* Added padding-right so text doesn't hit buttons */}
                                        <div className={`font-bold text-sm truncate ${isDone ? 'text-stone-500 line-through decoration-2' : 'text-orange-900 dark:text-orange-100'}`}>
                                            {task.title}
                                        </div>
                                        <div className={`text-[10px] font-mono mt-1 ${isDone ? 'text-stone-400' : 'text-orange-700 dark:text-orange-300/70'}`}>
                                            {task.start_time.slice(0, 5)} • {task.duration}m
                                        </div>
                                    </div>

                                    {/* CONTROLS - NOW MUCH BIGGER & VISIBLE */}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">

                                        {/* 1. CHECKBOX (Big & Green) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleToggle(task.id, isDone)
                                            }}
                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${isDone
                                                    ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                                                    : 'bg-white border-stone-300 hover:border-orange-500 hover:bg-orange-50'
                                                }`}
                                            title={isDone ? "Mark Incomplete" : "Mark Complete"}
                                        >
                                            {isDone ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-stone-200"></div>
                                            )}
                                        </button>

                                        {/* 2. UNSCHEDULE (Big & Red) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                unschedule(task.id)
                                            }}
                                            className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-red-200 bg-white/50 hover:bg-red-50 text-stone-400 hover:text-red-500 flex items-center justify-center transition-all"
                                            title="Unschedule (Back to Dock)"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            </DraggableTask>
                        )
                    })}

                    {selectedSlot && (
                        <div
                            ref={menuRef}
                            className="absolute left-24 right-10 z-50 bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in-95 duration-100"
                            style={{
                                top: `${((parseInt(selectedSlot.split(':')[0]) - 5) * PIXELS_PER_HOUR) + 20}px`
                            }}
                        >
                            <div className="p-3 border-b border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 rounded-t-xl flex justify-between items-center">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Schedule for {selectedSlot}</span>
                                <button onClick={() => setSelectedSlot(null)} className="text-stone-400 hover:text-stone-600">✕</button>
                            </div>

                            <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                                {unscheduledTasks.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-stone-400 italic">No unscheduled tasks available.</div>
                                ) : (
                                    unscheduledTasks.map(task => (
                                        <button
                                            key={task.id}
                                            onClick={() => quickSchedule(task.id)}
                                            className="w-full text-left p-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg group flex items-center justify-between transition-colors"
                                        >
                                            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{task.title}</span>
                                            <span className="text-[10px] text-stone-400 group-hover:text-orange-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. THE DOCK (Right Side) */}
            <div className="w-72 flex flex-col bg-white dark:bg-[#221F1D] border-l border-stone-200 dark:border-stone-800 shadow-xl z-20">
                {/* ... (Keep Dock logic exactly the same) ... */}
                <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                    <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">Unscheduled</h3>
                    <p className="text-xs text-stone-400">Tasks for today.</p>
                </div>

                <DockDropZone>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                        {unscheduledTasks.map(task => (
                            <DraggableTask key={task.id} task={task}>
                                <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:border-orange-400 cursor-grab active:cursor-grabbing group">
                                    <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{task.title}</span>
                                </div>
                            </DraggableTask>
                        ))}
                        {unscheduledTasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-stone-300">
                                <span className="text-xs italic">All scheduled</span>
                            </div>
                        )}
                    </div>
                </DockDropZone>
            </div>
        </div>
    )
}

// ... Keep Helper Functions (TimeSlot, DockDropZone)
function TimeSlot({ time, onClick }: { time: string, onClick: () => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${time}`,
        data: { time: time }
    })

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className="flex group relative cursor-pointer"
            style={{ height: `${PIXELS_PER_HOUR}px` }}
        >
            <div className="w-16 text-right pr-4 text-xs font-mono font-bold text-stone-400 -mt-2.5 select-none pointer-events-none">
                {time}
            </div>
            <div className={`flex-1 border-t border-stone-200 dark:border-stone-800 transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : 'group-hover:bg-stone-50 dark:group-hover:bg-white/5'}`}>
                <div className="h-[50%] border-b border-stone-100 dark:border-stone-800/30 border-dashed pointer-events-none"></div>
                <div className="hidden group-hover:flex h-full items-center justify-center opacity-30">
                    <span className="text-[10px] uppercase font-bold text-stone-400">+ Schedule Here</span>
                </div>
            </div>
        </div>
    )
}

function DockDropZone({ children }: { children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'dock',
        data: { type: 'dock' }
    })
    return (
        <div ref={setNodeRef} className={`flex-1 flex flex-col overflow-hidden transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
            {children}
        </div>
    )
}