'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Trash2, GripVertical, FileText } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import EditableText from '@/components/ui/EditableText'
import AIGenerateButton from '@/components/features/planning/AIGenerateButton'
import { addTask, updateTaskDescription, updateTaskPriority } from '@/actions/task'
import { deleteGoal as deleteGoalAction } from '@/actions/goal'
import DurationInput from '@/components/ui/DurationInput'
import PriorityBadge from '@/components/ui/PriorityBadge'
import PrioritySelect from '@/components/ui/PrioritySelect'

export default function SidebarGoal({ goal }: { goal: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [addPriority, setAddPriority] = useState('medium')

  return (
    <div className="group/goal relative w-full pl-2">
      {/* Connector Line */}
      <div className="absolute top-8 bottom-0 left-[19px] w-px bg-stone-200 dark:bg-stone-800"></div>

      {/* HEADER */}
      <div className="relative mb-2 flex items-start gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-900 dark:hover:border-orange-800"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
          )}
        </button>

        <div className="min-w-0 flex-1 py-1">
          <div className="group/title flex items-center justify-between gap-2">
            <h3 className="truncate pr-1 text-sm font-semibold text-stone-800 dark:text-stone-200">
              <EditableText
                id={goal.id}
                initialText={goal.title}
                type="goal"
                className="transition-colors hover:text-orange-600"
              />
            </h3>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover/title:opacity-100">
              <AIGenerateButton goalId={goal.id} goalTitle={goal.title} />
              <form action={deleteGoalAction}>
                <input type="hidden" name="goalId" value={goal.id} />
                <button className="rounded p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-900/20">
                  <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                </button>
              </form>
            </div>
          </div>

          {!isExpanded && (
            <div
              onClick={() => setIsExpanded(true)}
              className="mt-0.5 cursor-pointer truncate text-[10px] text-stone-400 hover:text-stone-500"
            >
              {goal.steps.length} steps inside
            </div>
          )}
        </div>
      </div>

      {/* EXPANDABLE CONTENT */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 fade-in relative space-y-2 pr-1 pb-4 pl-9 duration-200">
          {goal.steps.length === 0 && (
            <div className="flex items-center gap-2 py-2 opacity-50">
              <div className="h-px w-3 bg-stone-300"></div>
              <p className="text-[10px] text-stone-500 italic">No rituals yet.</p>
            </div>
          )}

          {goal.steps.map((task: any) => (
            <SidebarTaskItem key={task.id} task={task} />
          ))}

          {/* ADD STEP FORM */}
          {/* ✅ FIXED: Added relative z-[100] so popup renders ON TOP of next goal */}
          <form
            action={addTask}
            className="group/add relative z-[100] mt-2 opacity-100 transition-opacity hover:opacity-100 md:opacity-60"
          >
            <input type="hidden" name="date_type" value="backlog" />
            <input type="hidden" name="goal_id" value={goal.id} />
            <input type="hidden" name="priority" value={addPriority} />

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-stone-100 text-stone-400 transition-colors group-hover/add:bg-orange-100 group-hover/add:text-orange-500 md:h-4 md:w-4 dark:bg-stone-800">
                <Plus className="h-3.5 w-3.5 md:h-3 md:w-3" />
              </div>

              <input
                name="title"
                placeholder="Add next step..."
                autoComplete="off"
                className="min-w-[100px] flex-1 border-b border-transparent bg-transparent py-1.5 text-xs text-stone-600 transition-colors outline-none placeholder:text-stone-300 focus:border-stone-300 md:py-1 dark:text-stone-400 dark:focus:border-stone-600"
              />

              {/* ✅ FIXED: Removed 'scale-90' transform wrapper which traps z-index */}
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover/add:opacity-100 focus-within:opacity-100">

                <div className="w-[60px]">
                  <DurationInput defaultMinutes={60} />
                </div>

                {/* Priority Select */}
                <div className="min-w-[80px]">
                  <PrioritySelect
                    value={addPriority}
                    onChange={setAddPriority}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="hidden" />
          </form>
        </div>
      )}
    </div>
  )
}

function SidebarTaskItem({ task }: { task: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${task.id}`,
    data: { taskId: task.id, type: 'sidebar-task', duration: task.duration }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
    position: 'relative' as 'relative'
  } : undefined

  const priorityStyles = task.priority === 'high'
    ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/30 dark:bg-rose-900/10'
    : task.priority === 'medium'
      ? 'border-orange-200 bg-orange-50/40 dark:border-orange-900/30 dark:bg-orange-900/10'
      : 'border-stone-100 bg-white dark:border-stone-800 dark:bg-[#222]'

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-lg border border-stone-300 bg-white p-3 shadow-2xl opacity-90 rotate-2 cursor-grabbing"
      >
        <span className="text-xs font-bold text-stone-800">{task.title}</span>
      </div>
    )
  }

  return (
    <div className={`group relative rounded-lg border transition-all ${priorityStyles}`}>
      <div className="flex items-center gap-2 p-2.5">
        <button
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          className="cursor-grab text-stone-300 hover:text-stone-600 active:cursor-grabbing dark:text-stone-600 dark:hover:text-stone-400"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 cursor-pointer items-center gap-2 min-w-0"
        >
          <span className="truncate text-xs font-medium text-stone-600 dark:text-stone-300">
            {task.title}
          </span>
          <PriorityBadge priority={task.priority} />
          {task.description && <FileText className="h-3 w-3 flex-shrink-0 text-stone-400" />}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-stone-300 hover:text-stone-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-stone-100 bg-stone-50/80 p-3 animate-in slide-in-from-top-1 dark:border-stone-800 dark:bg-black/20">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Priority</span>
            <PrioritySelect
              value={task.priority || 'low'}
              onChange={(val) => updateTaskPriority(task.id, val)}
            />
          </div>
          <textarea
            defaultValue={task.description || ''}
            placeholder="Add details, links, or notes..."
            onBlur={(e) => updateTaskDescription(task.id, e.target.value)}
            className="w-full resize-none rounded-md bg-white border border-stone-100 p-2 text-xs text-stone-600 outline-none focus:border-orange-200 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300"
            rows={2}
          />
        </div>
      )}
    </div>
  )
}