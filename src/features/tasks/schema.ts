import { z } from 'zod';

// 1. REUSABLE ATOMS (The Basics)
// Define these once, use them everywhere.
export const PriorityEnum = z.enum(['low', 'medium', 'high']);
export const TaskIdSchema = z.string().uuid({ message: "Invalid Task ID" });
export const DateStringSchema = z.string().date(); // Enforces YYYY-MM-DD
export const TimeStringSchema = z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM");

// 2. THE MAIN SCHEMA
export const TaskSchema = z.object({
    id: TaskIdSchema.optional(),
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().optional().nullable(),
    priority: PriorityEnum.default('low'),
    is_completed: z.boolean().default(false),
    date: z.union([DateStringSchema, z.date(), z.null()])
        .optional()
        .transform((val) => (val instanceof Date ? val.toISOString().split('T')[0] : val)),
    start_time: TimeStringSchema.nullable().optional(),
    duration: z.number().min(0).optional(),
});

// 3. ACTION SPECIFIC SCHEMAS (Optimization)

// For Creating
export const CreateTaskSchema = TaskSchema.pick({
    title: true,
    priority: true,
    date: true
});

// For Scheduling (Drag & Drop)
export const ScheduleTaskSchema = z.object({
    taskId: TaskIdSchema,
    date: DateStringSchema
});

// For Timeblocking
export const TimeBlockSchema = z.object({
    taskId: TaskIdSchema,
    startTime: TimeStringSchema.nullable(),
    duration: z.number().min(1).default(60)
});

// For Simple Updates (Title/Description)
export const UpdateTitleSchema = z.object({
    taskId: TaskIdSchema,
    title: z.string().min(1).max(100)
});

// Export Type
export type Task = z.infer<typeof TaskSchema>;