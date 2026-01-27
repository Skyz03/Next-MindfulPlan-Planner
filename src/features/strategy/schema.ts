import { z } from 'zod';

export const GoalSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3, "Goal must be at least 3 characters"),
    vision_statement: z.string().optional(),
    current_reality: z.string().optional(),

    deadline: z.string().date().optional().nullable(),
    progress: z.number().min(0).max(100).default(0),

    // Nested logic (Strategies have tasks)
    tasks: z.array(z.any()).optional(), // We'll link strict types later
});

export type Goal = z.infer<typeof GoalSchema>;