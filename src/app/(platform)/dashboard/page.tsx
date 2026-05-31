import { createClient } from '@/core/lib/supabase/server'
import { getWeekDays, formatDate } from '@/core/lib/date'
import Link from 'next/link'
import PlannerBoard from '@/features/planning/components/PlannerBoard'
import DroppableDay from '@/features/planning/components/DroppableDay'
import PlanningGrid from '@/features/planning/components/PlanningGrid'
import DashboardShell from '@/core/layout/DashboardShell'
import TimeGrid from '@/features/planning/components/TimeGrid'
import RitualsPanel from '@/features/planning/components/RitualsPanel'
import StrategyDashboard from '@/features/strategy/components/StrategyDashboard'
import { DbTask, DbTaskWithGoal, DbGoal, GoalWithSteps } from '@/types'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const viewMode = params.view || 'focus'

  const today = new Date()
  const selectedDateStr = params.date || formatDate(today)
  const normalizedDateStr = selectedDateStr.split('T')[0]
  const selectedDate = new Date(normalizedDateStr)

  const weekDays = getWeekDays(selectedDate)
  const startOfWeekDate = weekDays[0]
  const endOfWeekDate = weekDays[6]
  const startOfWeek = formatDate(startOfWeekDate)
  const endOfWeek = formatDate(endOfWeekDate)

  const nextWeekStart = new Date(startOfWeekDate)
  nextWeekStart.setDate(startOfWeekDate.getDate() + 7)
  const nextWeekEnd = new Date(endOfWeekDate)
  nextWeekEnd.setDate(endOfWeekDate.getDate() + 7)
  const nextWeekStartStr = formatDate(nextWeekStart)
  const nextWeekEndStr = formatDate(nextWeekEnd)

  const prevWeek = new Date(selectedDate)
  prevWeek.setDate(selectedDate.getDate() - 7)
  const nextWeek = new Date(selectedDate)
  nextWeek.setDate(selectedDate.getDate() + 7)
  const todayStr = formatDate(today)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    weekTasksResponse,
    weeklyHabitsResponse,
    goalsResponse,
    inboxResponse,
    nextWeekTasksResponse,
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, goals(title)')
      .eq('user_id', user.id)
      .gte('due_date', startOfWeek)
      .lte('due_date', endOfWeek)
      .order('is_completed', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('due_date', null)
      .eq('is_completed', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('due_date', null)
      .is('goal_id', null)
      .eq('is_completed', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('*, goals(title)')
      .eq('user_id', user.id)
      .gte('due_date', nextWeekStartStr)
      .lte('due_date', nextWeekEndStr)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const allWeekTasks = (weekTasksResponse.data ?? []) as DbTaskWithGoal[]
  const weeklyList = (weeklyHabitsResponse.data ?? []) as DbTask[]
  const goals = (goalsResponse.data ?? []) as DbGoal[]
  const inboxTasks = (inboxResponse.data ?? []) as DbTask[]
  const nextWeekTasks = (nextWeekTasksResponse.data ?? []) as DbTaskWithGoal[]

  const tree: GoalWithSteps[] = goals.map((goal) => ({
    ...goal,
    steps: weeklyList.filter((t) => t.goal_id === goal.id),
  }))

  const dateRangeText = `${startOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <PlannerBoard>
      <DashboardShell sidebar={<RitualsPanel inboxTasks={inboxTasks} tree={tree} />} viewMode={viewMode}>

        {/* HEADER */}
        <div className="relative z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-[#FAFAF9] px-4 transition-colors duration-500 md:px-8 md:pl-16 dark:border-stone-800 dark:bg-[#1C1917]">

          {/* LEFT: Title & Date Nav */}
          <div className="flex items-center gap-3 pl-8 md:gap-6 md:pl-0">
            <h1 className="hidden font-serif text-lg font-bold text-stone-900 md:block dark:text-stone-100">
              {viewMode === 'plan' ? 'Weekly Plan' : viewMode === 'strategy' ? 'Strategy' : 'Daily Focus'}
            </h1>

            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-100 p-1 shadow-sm md:gap-3 md:pr-4 dark:border-stone-800/50 dark:bg-stone-800/50">
              <div className="flex items-center gap-0.5">
                <Link
                  href={`/dashboard?date=${formatDate(prevWeek)}&view=${viewMode}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-all hover:bg-white hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </Link>
                <Link
                  href={`/dashboard?date=${todayStr}&view=${viewMode}`}
                  className={`flex h-7 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all ${normalizedDateStr === todayStr ? 'cursor-default bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100' : 'text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20'}`}
                >
                  Today
                </Link>
                <Link
                  href={`/dashboard?date=${formatDate(nextWeek)}&view=${viewMode}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-all hover:bg-white hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </div>
              <div className="hidden h-4 w-px bg-stone-300 sm:block dark:bg-stone-700" />
              <span className="hidden font-mono text-xs font-medium tracking-tight text-stone-500 uppercase sm:block dark:text-stone-400">
                {dateRangeText}
              </span>
            </div>
          </div>

          {/* RIGHT: View Toggle */}
          <div className="flex flex-col rounded-lg bg-stone-200 p-1 dark:bg-stone-800">
            <div className="flex rounded-lg bg-stone-200 p-1 dark:bg-stone-800">
              {(['focus', 'plan', 'strategy'] as const).map((mode) => (
                <Link
                  key={mode}
                  href={`/dashboard?date=${normalizedDateStr}&view=${mode}`}
                  className={`rounded-md px-3 py-1 text-xs font-bold capitalize transition-all md:px-4 ${viewMode === mode ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-600 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
                >
                  {mode}
                </Link>
              ))}
            </div>
            <div className="hidden gap-2 px-2 pt-2 text-[10px] text-stone-500 md:flex">
              <span className="rounded-full border border-stone-300 bg-white px-2 py-1 text-[10px] font-semibold dark:border-stone-700 dark:bg-stone-900">F Focus</span>
              <span className="rounded-full border border-stone-300 bg-white px-2 py-1 text-[10px] font-semibold dark:border-stone-700 dark:bg-stone-900">P Plan</span>
              <span className="rounded-full border border-stone-300 bg-white px-2 py-1 text-[10px] font-semibold dark:border-stone-700 dark:bg-stone-900">S Strategy</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        {viewMode === 'strategy' ? (
          <StrategyDashboard />
        ) : viewMode === 'plan' ? (
          <PlanningGrid
            weekDays={weekDays}
            allTasks={allWeekTasks}
            nextWeekTasks={nextWeekTasks}
            nextMondayStr={nextWeekStartStr}
          />
        ) : (
          <div className="relative flex h-full flex-col overflow-hidden">
            {/* WEEK STRIP */}
            <div className="z-30 flex h-auto min-h-[5rem] flex-none flex-col border-b border-stone-200 bg-[#FAFAF9]/90 px-4 py-4 shadow-sm backdrop-blur-md md:px-8 dark:border-stone-800 dark:bg-[#1C1917]/90">
              <div className="no-scrollbar flex flex-1 items-start gap-2 overflow-x-auto pb-2">
                {weekDays.map((day) => {
                  const dateStr = formatDate(day)
                  const isActive = dateStr === normalizedDateStr
                  const dayLoad = allWeekTasks.filter((t) => t.due_date === dateStr).length

                  return (
                    <DroppableDay key={dateStr} dateStr={dateStr} className="h-full min-w-[70px] flex-1">
                      <Link
                        href={`/dashboard?date=${dateStr}&view=focus`}
                        scroll={false}
                        className={`flex h-full flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${isActive ? 'border-stone-800 bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900' : 'border-transparent bg-white text-stone-500 hover:border-orange-300 dark:bg-stone-800'}`}
                      >
                        <span className="text-[10px] font-bold uppercase">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="font-serif text-lg leading-none font-bold">{day.getDate()}</span>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: Math.min(dayLoad, 4) }).map((_, i) => (
                            <div key={i} className={`h-1 w-1 rounded-full ${isActive ? 'bg-white/50' : 'bg-orange-400'}`} />
                          ))}
                        </div>
                      </Link>
                    </DroppableDay>
                  )
                })}
              </div>
            </div>

            {/* TIME GRID */}
            <div className="relative z-10 flex-1 overflow-hidden">
              <TimeGrid tasks={allWeekTasks.filter((t) => t.due_date === normalizedDateStr)} todayStr={todayStr} />
            </div>
          </div>
        )}
      </DashboardShell>
    </PlannerBoard>
  )
}
