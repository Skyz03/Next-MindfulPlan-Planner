import { createClient } from '@/utils/supabase/server'
import { addTask, addGoal, toggleTask, deleteGoal } from './actions'
import { getWeekDays, formatDate, isSameDay } from '@/utils/date'
import Link from 'next/link'
import TaskItem from '@/components/TaskItem'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = createClient()
  const params = await searchParams

  // Date Logic
  const today = new Date()
  const selectedDateStr = params.date || formatDate(today)
  const normalizedDateStr = selectedDateStr.split('T')[0]
  const selectedDate = new Date(normalizedDateStr)
  const weekDays = getWeekDays(selectedDate)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [scheduledTasks, weeklyHabits, goalsResponse] = await Promise.all([
    // A: Scheduled Tasks (For the selected day)
    supabase.from('tasks')
      .select('*, goals(title)')
      .eq('user_id', user.id)
      .eq('due_date', normalizedDateStr)
      .order('is_completed', { ascending: true }) // Unfinished first
      .order('created_at', { ascending: false }),

    // B: Weekly Rituals (Undated tasks - "The Lifestyle Checklist")
    // We filter out completed ones so the list shrinks as you win the week
    supabase.from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('due_date', null)
      .eq('is_completed', false)
      .order('created_at', { ascending: false }),

    // C: Goals
    supabase.from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ])

  const tasks = scheduledTasks.data || []
  const weeklyList = weeklyHabits.data || []
  const goals = goalsResponse.data || []

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">

      {/* --- LEFT SIDEBAR: LIFESTYLE & CONTEXT --- */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl transition-colors">

        {/* 1. Goals (The Vision) */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-widest">Vision Board</h2>
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-2 mb-3">
            {goals.map(goal => (
              <div key={goal.id} className="group flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">{goal.title}</span>
                <form action={deleteGoal} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <button className="text-slate-300 hover:text-red-400 px-2 transition-colors">×</button>
                </form>
              </div>
            ))}
            {goals.length === 0 && <p className="text-[10px] text-slate-400 italic">No visions set yet.</p>}
          </div>

          <form action={addGoal}>
            <input
              name="title"
              placeholder="+ Add vision..."
              className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 text-xs outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all"
            />
          </form>
        </div>

        {/* 2. Weekly Rituals (The Lifestyle Checklist) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30 dark:bg-black/10">
          <div className="p-5 pb-2">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-widest flex items-center gap-2">
              <span>Weekly Rituals</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">{weeklyList.length}</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">Check them off here or drag to a day.</p>
          </div>

          <div className="px-5 pb-4">
            <form action={addTask} className="relative">
              <input type="hidden" name="date_type" value="backlog" />
              <input
                name="title"
                placeholder="New weekly habit..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 ring-indigo-500/20 shadow-sm"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-5 custom-scrollbar">
            {weeklyList.map(task => (
              <div key={task.id} className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 cursor-move transition-all">

                {/* Inline Checkbox for "Just getting it done" */}
                <form action={toggleTask.bind(null, task.id, task.is_completed)}>
                  <button className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:border-indigo-400 transition-colors">
                  </button>
                </form>

                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate flex-1">
                  {task.title}
                </span>

                {/* Drag Handle Icon (Visual Cue) */}
                <div className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </div>
              </div>
            ))}

            {weeklyList.length === 0 && (
              <div className="text-center py-8 opacity-50">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-xs text-slate-500">All cleared for the week!</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT: CALENDAR FOCUS --- */}
      <main className="flex-1 flex flex-col relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl transition-colors">

        {/* Date Strip */}
        <div className="h-24 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-center gap-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          {weekDays.map((day) => {
            const dateStr = formatDate(day)
            const isActive = dateStr === normalizedDateStr
            const isToday = isSameDay(day, today)
            return (
              <Link
                key={dateStr}
                href={`/?date=${dateStr}`}
                scroll={false}
                className={`group flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-300 border cursor-pointer relative overflow-hidden ${isActive
                    ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                  }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-100' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                  {day.getDate()}
                </span>
                {isToday && !isActive && <div className="absolute bottom-2 w-1 h-1 bg-indigo-500 rounded-full"></div>}
              </Link>
            )
          })}
        </div>

        {/* Today's Focus */}
        <div className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-indigo-100 dark:text-slate-800">{tasks.filter(t => t.is_completed).length}/{tasks.length}</span>
            </div>
          </header>

          <div className="mb-8">
            <form action={addTask} className="relative flex gap-2">
              <input type="hidden" name="specific_date" value={normalizedDateStr} />
              <div className="flex-1 relative group">
                <input
                  name="title"
                  placeholder="What is the main focus?"
                  autoComplete="off"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pl-5 shadow-sm outline-none focus:ring-2 ring-indigo-500/20 dark:text-white transition-all placeholder:text-slate-300"
                />
                <div className="absolute right-3 top-3.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-lg p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                </div>
              </div>

              {goals.length > 0 && (
                <select
                  name="goal_id"
                  className="w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 shadow-sm outline-none focus:ring-2 ring-indigo-500/20 text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  defaultValue="none"
                >
                  <option value="none">General Task</option>
                  {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
                </select>
              )}
            </form>
          </div>

          <div className="space-y-3 pb-10">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/20">
                <p className="font-medium">No plans for {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })} yet.</p>
                <p className="text-xs mt-2">Add a task or drag a ritual from the left.</p>
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