import { createClient } from '@/utils/supabase/server'
import { addTask, addGoal, toggleTask, deleteGoal } from './actions'
import { getWeekDays, formatDate, isSameDay } from '@/utils/date'
import Link from 'next/link'
import TaskItem from '@/components/TaskItem'
import { ThemeToggle } from '@/components/ThemeToggle' // <--- IMPORT THIS

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = createClient()
  const params = await searchParams

  const today = new Date()
  const selectedDateStr = params.date || formatDate(today)
  const normalizedDateStr = selectedDateStr.split('T')[0]
  const selectedDate = new Date(normalizedDateStr)
  const weekDays = getWeekDays(selectedDate)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [scheduledTasks, backlogTasks, goalsResponse] = await Promise.all([
    supabase.from('tasks').select('*, goals(title)').eq('user_id', user.id).eq('due_date', normalizedDateStr).order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('user_id', user.id).is('due_date', null).order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  const tasks = scheduledTasks.data || []
  const backlog = backlogTasks.data || []
  const goals = goalsResponse.data || []

  return (
    // Updated container with dark background classes
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">

      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl transition-colors">

        {/* Goals Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="mb-3 flex justify-between items-start">
            <div>
              <h2 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider mb-1">Goals</h2>
              <p className="text-xs text-slate-400">Your long-term visions</p>
            </div>
            {/* Added Theme Toggle here for easy access */}
            <ThemeToggle />
          </div>

          <form action={addGoal} className="mb-3">
            <input
              name="title"
              placeholder="+ New goal..."
              className="w-full bg-slate-100 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-200 dark:ring-indigo-900 placeholder:text-slate-400"
            />
          </form>

          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {goals.map(goal => (
              <div key={goal.id} className="group flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{goal.title}</span>
                <form action={deleteGoal} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <button className="text-indigo-400 hover:text-red-500 p-1">✕</button>
                </form>
              </div>
            ))}
            {goals.length === 0 && <div className="text-center text-xs text-slate-400 py-2">No goals yet</div>}
          </div>
        </div>

        {/* Backlog Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Idea Backlog</h2>
            <p className="text-xs text-slate-400 mt-1">Drag these to your calendar</p>
          </div>

          <div className="p-4">
            <form action={addTask} className="space-y-2">
              <input type="hidden" name="date_type" value="backlog" />
              <input name="title" placeholder="+ Add idea..." className="w-full bg-slate-100 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-200 dark:ring-indigo-900" />
              {goals.length > 0 && (
                <select
                  name="goal_id"
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 ring-indigo-200 dark:ring-indigo-900 text-slate-600 dark:text-slate-300"
                  defaultValue="none"
                >
                  <option value="none">No Goal</option>
                  {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
                </select>
              )}
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {backlog.map(task => (
              <div key={task.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-move shadow-sm">
                {task.title}
              </div>
            ))}
            {backlog.length === 0 && <div className="text-center text-xs text-slate-400 mt-10">Backlog empty</div>}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl transition-colors">

        {/* Week Strip */}
        <div className="h-24 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          {weekDays.map((day) => {
            const dateStr = formatDate(day)
            const isActive = dateStr === normalizedDateStr
            const isToday = isSameDay(day, today)
            return (
              <Link
                key={dateStr}
                href={`/?date=${dateStr}`}
                scroll={false}
                className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-200 border cursor-pointer ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent scale-110'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                  }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{day.getDate()}</span>
                {isToday && !isActive && <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1"></div>}
              </Link>
            )
          })}
        </div>

        {/* Day View */}
        <div className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{tasks.length} tasks scheduled for this day.</p>
          </header>

          <div className="mb-6">
            <form action={addTask} className="relative flex gap-2">
              <input type="hidden" name="specific_date" value={normalizedDateStr} />
              <input
                name="title"
                placeholder={`Add a task for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}...`}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm outline-none focus:ring-2 ring-indigo-500/20 dark:text-white"
              />
              {goals.length > 0 && (
                <select
                  name="goal_id"
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 shadow-sm outline-none focus:ring-2 ring-indigo-500/20 text-sm text-slate-600 dark:text-slate-300"
                  defaultValue="none"
                >
                  <option value="none">No Goal</option>
                  {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
                </select>
              )}
            </form>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                <p>Free day! Drag items from backlog?</p>
              </div>
            ) : (
              tasks.map(task => <TaskItem key={task.id} task={task} />)
            )}
          </div>
        </div>
      </main>
    </div>
  )
}