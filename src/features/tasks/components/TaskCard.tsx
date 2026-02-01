'use client'

import { useState, useEffect } from 'react'
import { GripVertical, X, CheckCircle2, Circle, FileText, ChevronDown } from 'lucide-react'
import { updateTaskDescription, updateTaskPriority } from '@/features/tasks/actions'
import PriorityBadge from '@/features/tasks/components/PriorityBadge'
import PrioritySelect from '@/features/tasks/components/PrioritySelect'
import { Task } from '@/types'

interface TaskCardProps {
    task: Task
    isDragging?: boolean
    showDragHandle?: boolean
    showStatusBadge?: boolean
    onToggle?: () => void
    onRemove?: () => void
    dragRef?: (node: HTMLElement | null) => void
    dragListeners?: any
    dragAttributes?: any
    className?: string
}

export default function TaskCard({
    task,
    isDragging,
    showDragHandle = true,
    showStatusBadge = false,
    onToggle,
    onRemove,
    dragRef,
    dragListeners,
    dragAttributes,
    className = ''
}: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Safety: Default to 'low' if priority is missing
    const [priority, setPriority] = useState(task?.priority || 'low')

    // Sync state when data loads
    useEffect(() => {
        if (task?.priority) {
            setPriority(task.priority)
        }
    }, [task?.priority])

    // Safety Guard: Don't render if task is totally broken
    if (!task) return null

    const handlePriorityChange = (val: 'low' | 'medium' | 'high') => {
        // ✅ GUARD CLAUSE: Stop if ID is missing
        if (!task.id) return

        setPriority(val)
        updateTaskPriority(task.id, val)
    }

    const borderColor = isDragging
        ? 'border-stone-300 bg-white opacity-90 rotate-2 shadow-2xl'
        : isExpanded
            ? 'border-orange-300 shadow-md ring-1 ring-orange-100 bg-white dark:border-orange-800'
            : priority === 'high'
                ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/30 dark:bg-rose-900/10'
                : priority === 'medium'
                    ? 'border-orange-200 bg-orange-50/40 dark:border-orange-900/30 dark:bg-orange-900/10'
                    : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-[#262626]'

    const isScheduled = !!task.date || !!task.start_time

    return (
        <div
            ref={dragRef}
            style={isDragging ? { zIndex: 999, position: 'relative' } : undefined}
            className={`group relative mb-2 rounded-lg border transition-all ${borderColor} ${className}`}
        >
            <div className="flex items-center gap-2 p-3">
                {showDragHandle && (
                    <button
                        {...dragListeners}
                        {...dragAttributes}
                        className="cursor-grab text-stone-300 hover:text-stone-600 active:cursor-grabbing dark:text-stone-600 dark:hover:text-stone-400"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); onToggle?.() }}
                    className="text-stone-300 transition-colors hover:text-emerald-500"
                >
                    {task.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                        <Circle className="h-4 w-4" />
                    )}
                </button>

                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex flex-1 cursor-pointer items-center gap-2 min-w-0"
                >
                    <span className={`text-xs md:text-sm font-medium truncate ${task.is_completed ? 'text-stone-400 line-through' : 'text-stone-700 dark:text-stone-200'}`}>
                        {task.title}
                    </span>
                    <PriorityBadge priority={priority} />
                    {task.description && <FileText className="h-3 w-3 flex-shrink-0 text-stone-400" />}
                </div>

                {showStatusBadge && !task.is_completed && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap hidden md:inline-block ${isScheduled
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
                        }`}>
                        {isScheduled ? 'Scheduled' : 'Backlog'}
                    </span>
                )}

                {onRemove && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove() }}
                        className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`text-stone-300 hover:text-stone-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>

            {isExpanded && (
                <div className="border-t border-stone-100 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-black/20 animate-in slide-in-from-top-1">
                    <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Priority Level</span>
                        <PrioritySelect
                            value={priority}
                            onChange={handlePriorityChange}
                        />
                    </div>

                    <textarea
                        autoFocus
                        defaultValue={task.description ?? ''}
                        placeholder="Add notes, results, or learnings..."
                        onBlur={(e) => {
                            // ✅ FIX IS HERE: We check if ID exists before sending
                            if (task.id) {
                                updateTaskDescription(task.id, e.target.value || '')
                            }
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-full resize-none rounded-md bg-transparent text-xs leading-relaxed text-stone-600 placeholder:text-stone-400 focus:outline-none dark:text-stone-300"
                        rows={3}
                    />
                    <div className="mt-1 flex justify-end">
                        <span className="text-[9px] text-stone-400">Auto-saved</span>
                    </div>
                </div>
            )}
        </div>
    )
}