'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '@/features/tasks/components/TaskCard'
import { Task } from '@/types'

interface TaskItemProps {
  task: Task
  onRemove?: (id: string) => void
  onToggle?: (id: string, newStatus: boolean) => void
}

export default function TaskItem({
  task,
  onRemove,
  onToggle
}: TaskItemProps) {

  // ✅ FIX 1: Provide a fallback ID for the hook to satisfy TypeScript.
  // We use the nullish coalescing operator (??). 
  // If task.id is undefined, we use 'ghost-id' (though we will disable it below).
  const uniqueId = task.id ?? 'ghost-id'

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: uniqueId,
    data: { task },
    disabled: !task.id // ✅ FIX 2: Disable dragging if ID is missing (safety)
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  // Optional: If you want to strictly hide tasks without IDs, uncomment this:
  // if (!task.id) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none"
    >
      <TaskCard
        task={task}
        isDragging={isDragging}

        // Pass DND props
        dragRef={undefined}
        dragListeners={listeners}
        dragAttributes={attributes}

        // ✅ FIX 3: Safety Guards for Actions
        // Only run the function if task.id exists
        onToggle={() => task.id && onToggle?.(task.id, !task.is_completed)}
        onRemove={() => task.id && onRemove?.(task.id)}
      />
    </div>
  )
}