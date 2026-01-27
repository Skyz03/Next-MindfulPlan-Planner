import { z } from 'zod'

// Define the shape of a Task. If data doesn't match this, the app rejects it.
export const TaskSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, "Task title cannot be empty").max(100),
    priority: z.enum(['low', 'medium', 'high']),
    is_completed: z.boolean().default(false),
    date: z.string().date().optional(), // YYYY-MM-DD
})

// Derive the TypeScript type FROM the schema (Single Source of Truth)
export type Task = z.infer<typeof TaskSchema>

// Schema for creating a task (we don't need ID or completion status yet)
export const CreateTaskSchema = TaskSchema.pick({ title: true, priority: true })