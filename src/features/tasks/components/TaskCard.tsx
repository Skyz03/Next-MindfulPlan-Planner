'use client'

import { useState, useEffect, useRef } from 'react'
import { GripVertical, Check, Trash2, FileText, Pencil } from 'lucide-react'
import { updateTaskDescription, updateTaskPriority, updateTask } from '@/features/tasks/actions'
import PrioritySelect from '@/features/tasks/components/PrioritySelect'
import { Task } from '@/types'

interface TaskCardProps {
    task: Task
    isDragging?: boolean
    showDragHandle?: boolean
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
    onToggle,
    onRemove,
    dragRef,
    dragListeners,
    dragAttributes,
    className = ''
}: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [title, setTitle] = useState(task?.title || '')
    const [isCompleted, setIsCompleted] = useState(task?.is_completed || false)
    const [priority, setPriority] = useState(task?.priority || 'low')

    const inputRef = useRef<HTMLInputElement>(null)

    // Sync state
    useEffect(() => {
        if (task) {
            setPriority(task.priority)
            setTitle(task.title)
            setIsCompleted(task.is_completed)
        }
    }, [task])

    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditingTitle])

    if (!task) return null

    // 1. Priority Colors (The "Stripe")
    const priorityStyles = {
        high: 'border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20',
        medium: 'border-l-orange-400 bg-orange-50/5 hover:bg-orange-50/10',
        low: 'border-l-stone-300 bg-white hover:bg-stone-50 dark:bg-stone-900/40 dark:hover:bg-stone-800'
    }[priority] || 'border-l-stone-300'

    // 2. Handlers
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsCompleted(!isCompleted)
        onToggle?.()
    }

    const handleTitleSave = async () => {
        setIsEditingTitle(false)
        if (title.trim() === '' || title === task.title || !task.id) {
            setTitle(task.title)
            return
        }
        const formData = new FormData()
        formData.append('taskId', task.id)
        formData.append('title', title)
        await updateTask(formData)
    }

    const handlePriorityChange = (val: 'low' | 'medium' | 'high') => {
        if (!task.id) return
        setPriority(val)
        updateTaskPriority(task.id, val)
    }

    return (
        <div
            ref={dragRef}
            // 3. The "Ghost" Container
            className={`
                group relative mb-2 flex flex-col rounded-r-md border-l-[3px] shadow-sm transition-all duration-200
                ${priorityStyles}
                ${isDragging ? 'z-50 scale-105 shadow-2xl rotate-1 opacity-90' : ''}
                ${isCompleted ? 'opacity-60' : 'opacity-100'}
                ${className}
            `}
            style={isDragging ? { zIndex: 999 } : undefined}
        >
            {/* MAIN ROW */}
            <div className="flex items-center gap-3 p-3">

                {/* A. GHOST DRAG HANDLE (Visible on Group Hover) */}
                {showDragHandle && (
                    <div
                        {...dragListeners}
                        {...dragAttributes}
                        className="cursor-grab text-stone-300 opacity-0 transition-opacity hover:text-stone-600 group-hover:opacity-100 dark:hover:text-stone-400"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                )}

                {/* B. MINIMAL CHECKBOX */}
                <button
                    onClick={handleToggle}
                    className={`
                        flex h-5 w-5 items-center justify-center rounded-md border transition-all
                        ${isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-transparent border-stone-300 hover:border-emerald-400 dark:border-stone-600'
                        }
                    `}
                >
                    {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </button>

                {/* C. TITLE & EXPAND TRIGGER */}
                <div className="flex flex-1 items-center gap-2 min-w-0">
                    {isEditingTitle ? (
                        <input
                            ref={inputRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100"
                        />
                    ) : (
                        <span
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`
                                flex-1 cursor-pointer truncate text-sm font-medium transition-colors hover:text-orange-600
                                ${isCompleted ? 'text-stone-400 line-through decoration-stone-400' : 'text-stone-700 dark:text-stone-200'}
                            `}
                        >
                            {title}
                        </span>
                    )}

                    {/* Tiny Note Indicator */}
                    {task.description && !isExpanded && (
                        <FileText className="h-3 w-3 text-stone-400" />
                    )}
                </div>

                {/* D. GHOST ACTIONS (Edit / Delete) */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true) }}
                        className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {onRemove && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove() }}
                            className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* EXPANDED DETAILS (Animated) */}
            {isExpanded && (
                <div className="border-t border-stone-100/50 bg-black/5 px-4 pb-4 pt-2 animate-in slide-in-from-top-1 dark:border-white/5">

                    {/* Priority Selector Row */}
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Priority</span>
                        <PrioritySelect value={priority} onChange={handlePriorityChange} />
                    </div>

                    {/* Notes Area */}
                    <textarea
                        defaultValue={task.description ?? ''}
                        placeholder="Add details..."
                        onBlur={(e) => {
                            if (task.id) updateTaskDescription(task.id, e.target.value || '')
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="min-h-[60px] w-full resize-none rounded-md bg-transparent text-xs leading-relaxed text-stone-600 placeholder:text-stone-400 focus:outline-none dark:text-stone-300"
                    />
                </div>
            )}
        </div>
    )
}