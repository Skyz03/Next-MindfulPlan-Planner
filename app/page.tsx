import { createClient } from '@/utils/supabase/server'
import { addTask, toggleTask, deleteTask } from './actions'
import { getWeekDays, formatDate, isSameDay } from '@/utils/date'
import Link from 'next/link'
import TaskItem from '@/components/TaskItem'

// 1. Accept searchParams (This is how we get the ?date=... from URL)
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = createClient()

  // Await searchParams in Next.js 15+
  const params = await searchParams

  // Determine the Active Date (Default to Today)
  const today = new Date()
  const selectedDateStr = params.date || formatDate(today)
  const selectedDate = new Date(selectedDateStr)

  // Generate the Strip (3 days before, 3 days after)
  const weekDays = getWeekDays(selectedDate)

  // 2. FETCH DATA (Parallel Fetching)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [scheduledTasks, backlogTasks] = await Promise.all([
    // Query A: Tasks for the SELECTED date
    supabase.from('tasks')
      .select('*, goals(title)')
      .eq('user_id', user.id)
      .eq('due_date', selectedDateStr)
      .order('created_at', { ascending: false }),
    // Query B: Tasks with NO date (The Backlog)
    supabase.from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('due_date', null) 
      .order('created_at', { ascending: false })
  ])

  const tasks = scheduledTasks.data || []
  const backlog = backlogTasks.data || []

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 font-sans overflow-hidden">

      {/* --- LEFT SIDEBAR: THE BACKLOG --- */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Idea Backlog</h2>
          <p className="text-xs text-slate-400 mt-1">Drag these to your calendar</p>
        </div>

        {/* Quick Add to Backlog */}
        <div className="p-4">
          <form action={addTask}>
            <input type="hidden" name="date_type" value="backlog" /> 
            <input name="title" placeholder="+ Add idea..." className="w-full bg-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-200" />
          </form>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {backlog.map(task => (
            <div key={task.id} className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-indigo-300 cursor-move shadow-sm">
              {task.title}
              {/* Add a button here later to "Schedule for Today" */}
            </div>
          ))}
          {backlog.length === 0 && <div className="text-center text-xs text-slate-400 mt-10">Backlog empty</div>}
        </div>
      </aside>

      {/* --- MAIN CONTENT: THE CALENDAR VIEW --- */}
      <main className="flex-1 flex flex-col relative bg-white/50 backdrop-blur-3xl">

        {/* 1. THE WEEK STRIP */}
        <div className="h-24 border-b border-slate-200/60 flex items-center justify-center gap-4 bg-white/40 backdrop-blur-md">
          {weekDays.map((day) => {
            const dateStr = formatDate(day)
            const isActive = dateStr === selectedDateStr
            const isToday = isSameDay(day, today)
            return (
              <Link 
                key={dateStr} 
                href={`/?date=${dateStr}`}
                scroll={false}
                className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-200 border cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent scale-110' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {day.getDate()}
                </span>
                {isToday && !isActive && <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1"></div>}
              </Link>
            )
          })}
        </div>

        {/* 2. THE DAY VIEW */}
        <div className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h1>
            <p className="text-slate-500">
              {tasks.length} tasks scheduled for this day.
            </p>
          </header>

          {/* Add Task for THIS Specific Date */}
          <div className="mb-6">
            <form action={addTask} className="relative">
              <input type="hidden" name="specific_date" value={selectedDateStr} />
              <input 
                name="title" 
                placeholder={`Add a task for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}...`}
                className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm outline-none focus:ring-2 ring-indigo-500/20" 
              />
            </form>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
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