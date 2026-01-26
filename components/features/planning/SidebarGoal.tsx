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
import TaskCard from '@/components/universal/TaskCard'

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
  // Use Draggable (Clone behavior) instead of Sortable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${task.id}`,
    data: { taskId: task.id, type: 'sidebar-task', duration: task.duration }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div style={style}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        dragRef={setNodeRef}
        dragListeners={listeners}
        dragAttributes={attributes}
        // Sidebar specific: slightly smaller text or padding if needed via className
        className="mb-1"
      />
    </div>
  )
}