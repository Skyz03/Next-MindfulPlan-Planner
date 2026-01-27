import { z } from 'zod';
import { TaskSchema } from '@/features/tasks/schema';

export const GoalSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3, "Goal must be at least 3 characters"),
    vision_statement: z.string().optional(),
    current_reality: z.string().optional(),

    deadline: z.string().date().optional().nullable(),
    progress: z.number().min(0).max(100).default(0),

    // Nested logic (Strategies have tasks)
    tasks: z.array(TaskSchema).optional().default([]),
});

export type Goal = z.infer<typeof GoalSchema>;