'use client'

import { Task } from '@/types'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export default function DraggableTask({
  task,
  children,
  className,
  style: propStyle,
}: {
  task: Task
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id }, // We only need the ID to identify it
  })

  const style = {
    ...propStyle,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 45,
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    scale: isDragging ? '1.05' : '1',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      suppressHydrationWarning={true}
      className={`${className || ''} cursor-grab touch-none active:cursor-grabbing ${isDragging ? 'scale-105 shadow-2xl' : ''}`}
    >
      {children}
    </div>
  )
}
