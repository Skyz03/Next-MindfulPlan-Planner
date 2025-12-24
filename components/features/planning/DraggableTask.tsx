'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export default function DraggableTask({
  task,
  children,
}: {
  task: any
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 999,
        opacity: 0.9,
        // ✅ RESPONSIVE: 'grabbing' cursor gives feedback
        cursor: 'grabbing',
        // ✅ RESPONSIVE: Scale up slightly to visualize 'lift' on mobile
        scale: '1.05',
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      suppressHydrationWarning={true}
      // ✅ RESPONSIVE:
      // 1. touch-none: Prevents page scroll while dragging this item
      // 2. active:scale-95: Tactile feedback on press
      // 3. active:cursor-grabbing: Cursor feedback
      className={`cursor-grab touch-none transition-transform active:scale-95 active:cursor-grabbing ${
        isDragging ? 'z-50 rotate-2 opacity-50 shadow-2xl' : ''
      }`}
    >
      {children}
    </div>
  )
}
