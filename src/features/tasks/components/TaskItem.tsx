'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '@/features/tasks/components/TaskCard' // 👈 Importing the universal component

export default function TaskItem({
  task,
  onRemove,
  onToggle
}: {
  task: any
  onRemove?: (id: string) => void
  onToggle?: (id: string, status: boolean) => void
}) {
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
  }

  return (
    <div style={style} className="touch-none">
      <TaskCard
        task={task}
        isDragging={isDragging}
        // Pass DND props down
        dragRef={setNodeRef}
        dragListeners={listeners}
        dragAttributes={attributes}
        // Pass Actions
        onToggle={() => onToggle && onToggle(task.id, task.is_completed)}
        onRemove={() => onRemove && onRemove(task.id)}
      />
    </div>
  )
}