'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, CheckCircle2, Circle, FileText, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { updateTaskDescription, updateTaskPriority } from '@/actions/task' // ✅ Import priority action
import PrioritySelect from '@/components/ui/PrioritySelect' // ✅ Import UI
import PriorityBadge from '@/components/ui/PriorityBadge' // ✅ Import UI

export default function TaskItem({
  task,
  onRemove,
  onToggle
}: {
  task: any
  onRemove?: (id: string) => void
  onToggle?: (id: string, status: boolean) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  // 🎨 Dynamic Border Logic:
  // If Expanded -> Focus Orange
  // If High Priority -> Rose Tint
  // If Medium -> Orange Tint
  // Default -> Stone
  const borderColor = isExpanded
    ? 'border-orange-300 shadow-md ring-1 ring-orange-100 dark:border-orange-800'
    : task.priority === 'high'
      ? 'border-rose-200 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-900/10'
      : task.priority === 'medium'
        ? 'border-orange-200 bg-orange-50/30 dark:border-orange-900/30 dark:bg-orange-900/10'
        : 'border-stone-200 dark:border-stone-800'

  return (
    <div ref={setNodeRef} style={style} className="group relative mb-2">
      <div className={`rounded-lg border bg-white transition-all dark:bg-[#262626] ${borderColor}`}>

        {/* MAIN ROW */}
        <div className="flex items-center gap-2 p-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-stone-300 hover:text-stone-600 active:cursor-grabbing dark:text-stone-600 dark:hover:text-stone-400"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Checkbox */}
          <button
            onClick={() => onToggle && onToggle(task.id, task.is_completed)}
            className="text-stone-300 transition-colors hover:text-emerald-500"
          >
            {task.is_completed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>

          {/* Title Area */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden"
          >
            <span className={`text-sm font-medium truncate ${task.is_completed ? 'text-stone-400 line-through' : 'text-stone-700 dark:text-stone-200'}`}>
              {task.title}
            </span>

            {/* ✅ Priority Badge (Visual Signal) */}
            <PriorityBadge priority={task.priority} />

            {/* Icon Indicator if desc exists */}
            {task.description && <FileText className="h-3 w-3 flex-shrink-0 text-stone-400" />}
          </div>

          {/* Delete Button (Only on Hover) */}
          {onRemove && (
            <button
              onClick={() => onRemove(task.id)}
              className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-stone-300 hover:text-stone-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* EXPANDED AREA: Priority & Notes */}
        {isExpanded && (
          <div className="border-t border-stone-100 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-black/20 animate-in slide-in-from-top-1">

            {/* ✅ Priority Selection Header */}
            <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Priority Level</span>
              <PrioritySelect
                value={task.priority || 'low'}
                onChange={(val) => updateTaskPriority(task.id, val)}
              />
            </div>

            {/* Description Textarea */}
            <textarea
              autoFocus
              defaultValue={task.description || ''}
              placeholder="Add notes, results, or learnings..."
              onBlur={(e) => updateTaskDescription(task.id, e.target.value)}
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
    </div>
  )
}