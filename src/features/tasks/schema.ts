import { z } from 'zod';
// 1. Define Enums (Reusable constants)
export const PriorityEnum = z.enum(['low', 'medium', 'high']);

// 2. The Main Schema (Matches your Database logic)
export const TaskSchema = z.object({
    id: z.string().uuid().optional(), // Optional because new tasks won't have an ID yet
    title: z.string()
        .min(1, "Task title cannot be empty")
        .max(100, "Task title is too long (max 100 chars)"),
    description: z.string().optional().nullable(), // Allow nulls from DB
    priority: PriorityEnum.default('low'),
    is_completed: z.boolean().default(false),

    // Dates can be tricky. We allow strings (ISO) or Date objects, transforming them to standard strings.
    date: z.union([z.string(), z.date(), z.null()])
        .optional()
        .transform((val) => (val instanceof Date ? val.toISOString().split('T')[0] : val)),

    start_time: z.string().nullable().optional(),
    duration: z.number().min(0).optional(),
});

// 3. Specific Schemas for Actions (Optimization)
// When CREATING, we only need a title.
export const CreateTaskSchema = TaskSchema.pick({
    title: true,
    priority: true,
    date: true
});

// When UPDATING, we need an ID and partial fields.
export const UpdateTaskSchema = TaskSchema.partial().required({
    id: true
});

// 4. Export the Type (No need to write interfaces manually anymore!)
export type Task = z.infer<typeof TaskSchema>;