import { createClient } from '@/core/lib/supabase/server'
import { signOut } from '@/features/auth/actions'
import { getWeeklyReviewData } from '@/features/reflection/actions'
import { addTask, deleteTask } from '@/features/tasks/actions'
import { addGoal } from '@/features/goals/actions'
import { getWeekDays, formatDate } from '@/core/lib/date'
import Link from 'next/link'
import PlannerBoard from '@/features/planning/components/PlannerBoard'
import DraggableTask from '@/features/planning/components/DraggableTask'
import DroppableDay from '@/features/planning/components/DroppableDay'
import PlanningGrid from '@/features/planning/components/PlanningGrid'
import { ThemeToggle } from '@/core/ui/ThemeToggle'
import EditableText from '@/core/ui/EditableText'
import DashboardShell from '@/core/layout/DashboardShell'
import TimeGrid from '@/features/planning/components/TimeGrid'
import SidebarGoal from '@/features/goals/components/SidebarGoal'
import OnboardingTour from '@/features/onboarding/components/OnboardingTour'
import BlueprintModal from '@/features/planning/components/BlueprintModal'
import StrategyDashboard from '@/features/strategy/components/StrategyDashboard'
import ViewToggle from '@/core/ui/ViewToggle'
import { ChevronLeft, ChevronRight, RotateCcw, Calendar, Plus, LogOut, BookOpen, Inbox, XIcon } from 'lucide-react'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const viewMode = params.view || 'focus' // 'focus' | 'plan'


  const today = new Date()
  const selectedDateStr = params.date || formatDate(today)
  const normalizedDateStr = selectedDateStr.split('T')[0]
  const selectedDate = new Date(normalizedDateStr)

  // 1. Calculate Week Range (Mon - Sun)
  const weekDays = getWeekDays(selectedDate)
  const startOfWeekDate = weekDays[0]
  const endOfWeekDate = weekDays[6]
  const startOfWeek = formatDate(startOfWeekDate)
  const endOfWeek = formatDate(endOfWeekDate)

  const nextMondayStr = formatDate(new Date(weekDays[1]))
  const reviewData = await getWeeklyReviewData(startOfWeek, endOfWeek)

  // 2. Calculate NEXT Week (For the Queue)
  const nextWeekStart = new Date(startOfWeekDate)
  nextWeekStart.setDate(startOfWeekDate.getDate() + 7)
  const nextWeekEnd = new Date(endOfWeekDate)
  nextWeekEnd.setDate(endOfWeekDate.getDate() + 7)

  const nextWeekStartStr = formatDate(nextWeekStart)
  const nextWeekEndStr = formatDate(nextWeekEnd)

  // Navigation Logic
  const prevWeek = new Date(selectedDate)
  prevWeek.setDate(selectedDate.getDate() - 7)
  const nextWeek = new Date(selectedDate)
  nextWeek.setDate(selectedDate.getDate() + 7)
  const todayStr = formatDate(today)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // 2. FETCH DATA (Parallel Fetching)
  const [
    weekTasksResponse,
    weeklyHabitsResponse,
    goalsResponse,
    inboxResponse,
    profileResponse,
    blueprintResponse,
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

    supabase.from('profiles').select('has_onboarded').eq('id', user.id).single(),

    supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true }),

    // 🆕 Fetch Next Week's Tasks
    supabase
      .from('tasks')
      .select('*, goals(title)')
      .eq('user_id', user.id)
      .gte('due_date', nextWeekStartStr)
      .lte('due_date', nextWeekEndStr)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const allWeekTasks = weekTasksResponse.data || []
  const weeklyList = weeklyHabitsResponse.data || []
  const goals = goalsResponse.data || []
  const inboxTasks = inboxResponse.data || []
  const blueprints = blueprintResponse.data || []
  const hasOnboarded = profileResponse.data?.has_onboarded ?? false
  const nextWeekTasks = nextWeekTasksResponse.data || []

  const tree = goals.map((goal: any) => ({
    ...goal,
    steps: weeklyList.filter((t: any) => t.goal_id === goal.id),
  }))

  const dateRangeText = `${startOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  // --- SIDEBAR CONTENT (Passed to MobileSidebar inside DashboardShell) ---
  const sidebarContent = (
    <DroppableDay
      dateStr={null}
      className="flex h-full w-full flex-col border-r border-stone-200 bg-[#FAFAF9] px-6 py-8 font-sans transition-colors duration-500 dark:border-stone-800 dark:bg-[#111]"
    >
      {/* 1. HEADER: Editorial Style */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Rituals
          </h1>
          <p className="text-xs font-medium text-stone-400">Design your week.</p>
        </div>

        {/* Subtle Controls (Theme / Sign Out) */}
        <div className="flex items-center gap-1 opacity-40 transition-opacity hover:opacity-100">
          <ThemeToggle />
          <form action={signOut}>
            <button
              className="rounded-full p-1.5 transition-colors hover:bg-stone-200 dark:hover:bg-stone-800"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 text-stone-600 dark:text-stone-400" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. MAIN ACTION (Review) - Replaced heavy box with clean link */}
      <Link
        href="/reflection"
        id="tour-reflection"
        className="group mb-8 flex items-center justify-between border-b border-stone-200 pb-2 text-sm font-medium text-stone-600 transition-all hover:text-orange-600 dark:border-stone-800 dark:text-stone-400 dark:hover:text-orange-500"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Weekly Review
        </span>
        <span className="text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
          OPEN ↵
        </span>
      </Link>

      {/* 3. SCROLLABLE AREA */}
      <div className="custom-scrollbar flex-1 overflow-y-auto pr-2 -mr-2">

        {/* INBOX SECTION */}
        <div className="mb-8 space-y-3" id="tour-inbox">
          {/* Minimal Header */}
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-stone-400 uppercase">
            <span className="flex items-center gap-2">
              <Inbox className="h-3 w-3" /> Inbox
            </span>
            <span className="font-mono text-[10px]">{inboxTasks.length}</span>
          </div>

          {/* Task List */}
          <div className="space-y-1">
            {inboxTasks.length === 0 && (
              <div className="py-2 text-[10px] text-stone-300 italic">Inbox zero.</div>
            )}

            {inboxTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                {/* Ghost UI Item */}
                <div className="group flex cursor-grab items-center gap-2 rounded-md py-1 transition-all hover:bg-white hover:shadow-sm hover:px-2 -mx-2 dark:hover:bg-stone-800">
                  {/* Priority Dot */}
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400 ring-2 ring-transparent group-hover:ring-orange-100 dark:group-hover:ring-orange-900/20"></div>

                  {/* Editable Text */}
                  <div className="min-w-0 flex-1">
                    <EditableText
                      id={task.id}
                      initialText={task.title}
                      type="task"
                      className="block truncate text-xs font-medium text-stone-600 transition-colors group-hover:text-stone-900 dark:text-stone-400 dark:group-hover:text-stone-200"
                    />
                  </div>

                  {/* Ghost Delete Action */}
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <form action={deleteTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <button className="text-stone-300 hover:text-red-500">
                        <XIcon className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                </div>
              </DraggableTask>
            ))}

            {/* Ghost Input (The Line) */}
            <div className="relative pt-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300">
                <Plus className="h-3 w-3" />
              </div>
              <input
                placeholder="Capture a thought..."
                className="w-full bg-transparent border-b border-dashed border-stone-200 py-1.5 pl-5 text-sm text-stone-600 placeholder:text-stone-300 focus:border-orange-500 focus:outline-none dark:border-stone-800 dark:text-stone-300 dark:placeholder:text-stone-700"
              // Optional: Add onKeyDown handler here to submit via Client Action if needed
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-bold text-stone-300">⌘K</span>
            </div>
          </div>
        </div>

        {/* STRATEGIC GOALS SECTION */}
        <div id="tour-goals">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">
              Strategic Goals
            </span>
          </div>

          <div className="space-y-1">
            {tree.map((goal) => (
              <SidebarGoal key={goal.id} goal={goal} />
            ))}
          </div>

          {/* New Goal Input (Ghost UI) */}
          <form action={addGoal} className="mt-4 group flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100">
            <Plus className="h-3.5 w-3.5 text-stone-400" />
            <input
              name="title"
              placeholder="Add new goal..."
              className="flex-1 bg-transparent py-1 text-sm font-medium text-stone-600 outline-none placeholder:text-stone-300 focus:text-stone-900 dark:text-stone-400 dark:placeholder:text-stone-700 dark:focus:text-stone-200"
            />
          </form>
        </div>
      </div>

      {/* Footer Gradient Fade */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-[#FAFAF9] to-transparent dark:from-[#111]"></div>
    </DroppableDay>
  )

  return (
    <PlannerBoard>
      <OnboardingTour hasSeenTour={hasOnboarded} />

      <DashboardShell sidebar={sidebarContent} viewMode={viewMode}>
        {/* HEADER: COMMAND CENTER */}
        {/* ✅ RESPONSIVE: Padding adjusted for mobile vs desktop */}


        <div
          id="tour-welcome"
          className="relative z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-[#FAFAF9] px-4 transition-colors duration-500 md:px-8 md:pl-16 dark:border-stone-800 dark:bg-[#1C1917]"
        >
          {/* LEFT: Title & Date Nav */}
          {/* 1. TITLE (Serif & Bold) */}
          <div className="flex items-center gap-3 pl-12 md:gap-6 md:pl-0">
            <h1 className="hidden font-serif text-2xl font-bold tracking-tight text-stone-900 md:block dark:text-stone-100">
              {viewMode === 'plan' ? 'Weekly Rituals' : 'Daily Focus'}
            </h1>

            {/* 2. NAVIGATION PILL */}
            <div className="group flex items-center rounded-full border border-stone-200 bg-white p-1 shadow-sm transition-all hover:shadow-md dark:border-stone-800 dark:bg-[#1C1917]">

              {/* Previous Arrow */}
              <Link
                href={`/dashboard?date=${formatDate(prevWeek)}&view=${viewMode}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              {/* Today Button (Action Badge) */}
              <Link
                href={`/dashboard?date=${todayStr}&view=${viewMode}`}
                className={`
        mx-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all
        ${normalizedDateStr === todayStr
                    ? 'cursor-default bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500' // Inactive state
                    : 'bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg dark:shadow-none' // Active action
                  }
      `}
              >
                {normalizedDateStr !== todayStr && <RotateCcw className="h-3 w-3" />}
                <span>Today</span>
              </Link>

              {/* Next Arrow */}
              <Link
                href={`/dashboard?date=${formatDate(nextWeek)}&view=${viewMode}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>

              {/* Divider */}
              <div className="mx-1 h-4 w-px bg-stone-200 dark:bg-stone-800"></div>

              {/* Date Range Display */}
              <div className="hidden items-center gap-2 px-3 sm:flex">
                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                <span className="font-mono text-xs font-medium tracking-widest text-stone-600 uppercase dark:text-stone-400">
                  {dateRangeText}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Tools & View Toggle */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* 2. Blueprint Modal - ✅ RESPONSIVE: Hide on mobile to declutter */}
            <div className="hidden md:block">
              <BlueprintModal items={blueprints} currentDateStr={normalizedDateStr} />
            </div>

            {/* Separator */}
            <div className="hidden h-6 w-px bg-stone-200 md:block dark:bg-stone-800"></div>

            {/* 3. View Toggle */}
            <ViewToggle />
          </div>
        </div>


        {/* MAIN CONTENT AREA */}

        {viewMode === 'strategy' ? (
          <StrategyDashboard />
        ) :
          viewMode === 'plan' ? (
            // PlanningGrid internal logic handles the scroll snapping
            <PlanningGrid
              weekDays={weekDays}
              allTasks={allWeekTasks}
              nextWeekTasks={nextWeekTasks}
              nextMondayStr={nextWeekStartStr}
            />
          ) : (
            <div className="relative flex h-full flex-col overflow-hidden">
              <div className="z-30 flex h-auto min-h-[5rem] flex-none flex-col border-b border-stone-200 bg-[#FAFAF9]/90 px-4 py-4 shadow-sm backdrop-blur-md md:px-8 dark:border-stone-800 dark:bg-[#1C1917]/90">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="hidden text-[10px] font-bold tracking-widest text-stone-400 uppercase md:block">
                    Move tasks to another day
                  </h2>
                </div>
                {/* ✅ RESPONSIVE: Added overflow-x-auto for day list on mobile */}
                <div className="no-scrollbar flex flex-1 items-start gap-2 overflow-x-auto pb-2">
                  {weekDays.map((day) => {
                    const dateStr = formatDate(day)
                    const isActive = dateStr === normalizedDateStr
                    const dayLoad = allWeekTasks.filter((t) => t.due_date === dateStr).length

                    return (
                      // ✅ RESPONSIVE: Added min-w-[70px] to prevent squishing
                      <DroppableDay
                        key={dateStr}
                        dateStr={dateStr}
                        className="h-full min-w-[70px] flex-1"
                      >
                        <Link
                          href={`/dashboard?date=${dateStr}&view=focus`}
                          scroll={false}
                          className={`block flex h-full flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${isActive ? 'border-stone-800 bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900' : 'border-transparent bg-white text-stone-500 hover:border-orange-300 dark:bg-stone-800'} `}
                        >
                          <span className="text-[10px] font-bold uppercase">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="font-serif text-lg leading-none font-bold">
                            {day.getDate()}
                          </span>
                          <div className="mt-1 flex gap-0.5">
                            {Array.from({ length: Math.min(dayLoad, 4) }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 w-1 rounded-full ${isActive ? 'bg-white/50' : 'bg-orange-400'}`}
                              ></div>
                            ))}
                          </div>
                        </Link>
                      </DroppableDay>
                    )
                  })}
                </div>
              </div>
              <div id="tour-focus" className="relative z-10 flex-1 overflow-hidden">
                <TimeGrid tasks={allWeekTasks.filter((t) => t.due_date === normalizedDateStr)} />
              </div>
            </div>
          )}
        {/* <ReviewTrigger data={reviewData} weekStart={startOfWeek} nextMonday={nextMondayStr} /> */}
      </DashboardShell>
    </PlannerBoard>
  )
}
