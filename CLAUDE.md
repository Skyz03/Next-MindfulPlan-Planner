# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Next.js with Turbopack)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm format       # Format all files with Prettier
pnpm format:check # Check formatting without writing
```

There are no tests in this project.

## Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
```

## Architecture

### Route Groups

- `src/app/(marketing)/` — public pages: landing (`/`) and login (`/login`)
- `src/app/(platform)/` — authenticated pages: `dashboard` and `reflection`

Auth is enforced in `src/core/lib/supabase/middleware.ts`, which redirects unauthenticated requests to `/login`. The Supabase server client (`src/core/lib/supabase/server.ts`) must always be called with `await createClient()` because `cookies()` is async in Next.js 15.

### Feature-sliced Structure

Each feature under `src/features/` is self-contained with an `actions.ts` (Server Actions) and `components/`:

| Feature | Purpose |
|---|---|
| `tasks/` | Core task CRUD, timer tracking, scheduling |
| `goals/` | Strategic goal sidebar |
| `planning/` | Drag-and-drop weekly board + `RitualsPanel` sidebar |
| `reflection/` | Weekly/monthly analytics and journal |
| `strategy/` | Strategy dashboard view (Goals with vision/deadline) |
| `auth/` | Sign-in/sign-out actions |
| `inbox/` | Cmd+K inbox capture modal |
| `user/` | Profile actions (`completeOnboarding`) |

Shared infrastructure lives in `src/core/`: layout shells (`DashboardShell`, `MobileSidebar`), reusable UI primitives (`EditableText`, `ThemeToggle`, `DurationInput`), and utilities (`date.ts`, `analytics.ts`, `stats.ts`).

### Server Actions Pattern

Every `actions.ts` file has `'use server'` at the top. All protected actions call a local `getUser()` helper that redirects to `/login` if no session exists:

```ts
async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}
```

All mutations call `revalidatePath('/')` or `revalidatePath('/dashboard')` after the DB write.

### Type System

Two parallel type layers exist — do not confuse them:

- **Zod schemas** (`features/tasks/schema.ts`, `features/strategy/schema.ts`) — used for **form validation** and the Strategy view's `Goal` type (which has `vision_statement`, `deadline`, nested `tasks`).
- **DB row types** (`src/types/index.ts`) — `DbTask`, `DbGoal`, `DbTaskWithGoal`, `GoalWithSteps` — used everywhere data is **fetched from Supabase**.

`TaskCard` accepts a minimal `TaskShape` interface that both satisfy. When adding a new DB column, add it to the `Db*` type in `src/types/index.ts`; for form validation add it to the Zod schema.

### Task Data Model

The `due_date` column on the `tasks` table determines a task's state:

- `due_date = null` + `goal_id = null` → **Inbox** (unprocessed capture)
- `due_date = null` + `goal_id != null` → **Backlog/Ritual** (weekly habit linked to a goal)
- `due_date = YYYY-MM-DD` → **Scheduled** (appears on calendar)

### Dashboard View Modes

The dashboard at `/dashboard` has three views controlled by the `?view=` query parameter:

- `focus` — `TimeGrid` for today's time-blocked tasks
- `plan` — `PlanningGrid` showing the full week as a kanban
- `strategy` — `StrategyDashboard` for goal management

### Drag-and-Drop

`PlannerBoard` is a client component that wraps the entire dashboard in dnd-kit's `DndContext`. `DraggableTask` wraps any draggable task chip; `DroppableDay` wraps any date column. The `handleDragEnd` handler in `PlannerBoard` calls the appropriate server action (`moveTaskToDate` or `scheduleTaskTime`) based on what the task was dropped onto.

### Theming

Tailwind v4 is configured CSS-first inside `src/app/globals.css` using `@theme` and `@custom-variant`. Dark mode uses the `class` strategy (`.dark` on `<html>`), managed by `next-themes`. Do not add a `tailwind.config.*` file — all theme customization belongs in `globals.css`.

### Prettier

No semicolons, single quotes, 100-char print width, trailing commas, Tailwind class sorting via `prettier-plugin-tailwindcss`.
