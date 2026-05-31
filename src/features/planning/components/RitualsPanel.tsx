import Link from 'next/link'
import { LogOut, Calendar, Plus, X } from 'lucide-react'
import { deleteTask } from '@/features/tasks/actions'
import { addGoal } from '@/features/goals/actions'
import { signOut } from '@/features/auth/actions'
import { ThemeToggle } from '@/core/ui/ThemeToggle'
import EditableText from '@/core/ui/EditableText'
import SidebarGoal from '@/features/goals/components/SidebarGoal'
import DraggableTask from './DraggableTask'
import DroppableDay from './DroppableDay'
import { DbTask, GoalWithSteps } from '@/types'

interface RitualsPanelProps {
  inboxTasks: DbTask[]
  tree: GoalWithSteps[]
}

export default function RitualsPanel({ inboxTasks, tree }: RitualsPanelProps) {
  return (
    <DroppableDay
      dateStr={null}
      className="flex h-full w-full flex-col border-r border-stone-200 bg-[#F5F5F4] font-sans transition-colors duration-500 dark:border-stone-800 dark:bg-[#18181b]"
    >
      {/* HEADER */}
      <div className="flex flex-col px-6 pt-8 pb-4 pl-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Rituals
            </h2>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Design your week.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-stone-200/50 p-1 dark:bg-stone-800/50">
            <ThemeToggle />
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700" />
            <form action={signOut}>
              <button
                className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-white hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        <Link
          href="/reflection"
          className="flex items-center justify-between rounded-xl bg-orange-500/10 p-3 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-500/20 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-800/30"
        >
          <span>Review</span>
          <Calendar className="h-4 w-4" />
        </Link>

        <div className="pt-6">
          <hr className="border-stone-200 dark:border-stone-800" />
        </div>
      </div>

      {/* SCROLLABLE AREA */}
      <div className="custom-scrollbar relative flex-1 overflow-y-auto px-4 pb-24">
        {/* INBOX */}
        <div className="mb-8 px-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Inbox</span>
            <span className="rounded-full bg-stone-200 px-1.5 text-[10px] text-stone-500 dark:bg-stone-800">
              {inboxTasks.length}
            </span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          </div>

          <div className="space-y-2">
            {inboxTasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-stone-200 py-3 text-center dark:border-stone-800">
                <p className="text-[10px] text-stone-400">⌘K to capture thoughts</p>
              </div>
            )}
            {inboxTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                <div className="group flex cursor-grab items-center gap-3 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md active:cursor-grabbing dark:border-stone-800/60 dark:bg-[#262626] dark:hover:border-orange-700/50">
                  <div className="flex-none">
                    <div className="h-2 w-2 rounded-full bg-orange-400/80 ring-2 ring-orange-50 dark:ring-orange-900/10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <EditableText
                      id={task.id}
                      initialText={task.title}
                      type="task"
                      className="block truncate text-sm font-medium text-stone-700 transition-colors hover:text-orange-600 dark:text-stone-200"
                    />
                  </div>
                  <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                    <form action={deleteTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <button className="rounded p-1 text-stone-300 hover:text-red-500" title="Delete">
                        <X className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                </div>
              </DraggableTask>
            ))}
          </div>
        </div>

        {/* STRATEGIC GOALS */}
        {tree.length > 0 && (
          <div className="mt-8 mb-4 flex items-center gap-2 px-4">
            <span className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">
              Strategic Goals
            </span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          </div>
        )}

        <div className="space-y-6 px-2">
          {tree.map((goal) => (
            <SidebarGoal key={goal.id} goal={goal} />
          ))}
        </div>

        {/* ADD GOAL */}
        <div className="mt-8 px-4">
          <form action={addGoal} className="group relative">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <input
              name="title"
              placeholder="New Strategic Goal..."
              className="w-full rounded-xl border border-transparent bg-stone-100 py-3 pr-4 pl-10 text-sm font-medium text-stone-800 shadow-sm transition-all outline-none placeholder:text-stone-400 focus:border-orange-300 focus:bg-white focus:shadow-md dark:bg-stone-800/50 dark:text-stone-200 dark:focus:border-orange-800/50 dark:focus:bg-stone-800"
            />
          </form>
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-[#F5F5F4] to-transparent dark:from-[#18181b]" />
    </DroppableDay>
  )
}
