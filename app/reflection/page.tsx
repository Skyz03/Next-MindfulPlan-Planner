import { getWeeklyReport } from '@/utils/analytics'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function ReflectionPage() {
  const data = await getWeeklyReport()

  if (!data) return <div className="p-10">Loading...</div>

  const { score, total, completed, activityByDay, goalBreakdown, biggestWin } = data

  // Dynamic Color for Score
  const scoreColor = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-indigo-500' : 'text-orange-500'
  const scoreMessage = score >= 80 ? 'Elite Performance' : score >= 50 ? 'Steady Progress' : 'Needs Focus'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans p-4 md:p-8 transition-colors">

      {/* HEADER */}
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Data-driven analysis of your performance.</p>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <Link href="/" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:border-indigo-500 transition-colors">
            Close Report
          </Link>
        </div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1: THE SCORE (Big Square) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Productivity Score</h3>
            <div className={`text-6xl font-black mt-2 ${scoreColor}`}>
              {score}%
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{scoreMessage}</p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Tasks</span>
              <span className="font-bold">{completed} <span className="text-slate-400 font-normal">/ {total}</span></span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score}%` }}></div>
            </div>
          </div>
        </div>

        {/* CARD 2: GOAL ALIGNMENT (Tall Rectangle) */}
        <div className="md:col-span-1 md:row-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Focus Distribution</h3>

          <div className="flex-1 space-y-5">
            {goalBreakdown.length === 0 && <p className="text-slate-400 text-sm">No goals linked this week.</p>}
            {goalBreakdown.map((goal) => {
              const percentage = Math.round((goal.completed / goal.total) * 100) || 0
              return (
                <div key={goal.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate pr-4">{goal.name}</span>
                    <span className="text-slate-400 text-xs">{goal.completed}/{goal.total}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${percentage === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-indigo-500">Insight:</span> You spent most of your effort on <span className="text-slate-800 dark:text-slate-200 font-bold">"{goalBreakdown[0]?.name || 'Tasks'}"</span> this week.
            </p>
          </div>
        </div>

        {/* CARD 3: VELOCITY GRAPH (Wide Rectangle) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Daily Velocity</h3>

          {/* CSS-Only Bar Chart */}
          <div className="flex items-end justify-between h-32 gap-2">
            {activityByDay.map((day) => {
              // Calculate height relative to max (simple normalization)
              const max = Math.max(...activityByDay.map(d => d.total)) || 1
              const heightPct = Math.round((day.total / max) * 100)

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-full flex items-end overflow-hidden">
                    {/* Filled part */}
                    <div
                      className="w-full bg-indigo-500 opacity-80 group-hover:opacity-100 transition-all"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{day.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* CARD 4: BIGGEST WIN (Wide Rectangle) */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
          {/* Decorative bg */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div className="relative z-10 flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
            </div>
            <div>
              <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Biggest Win</h3>
              {biggestWin ? (
                <>
                  <p className="text-xl font-bold">{biggestWin.title}</p>
                  <p className="text-indigo-200 text-sm mt-1 opacity-80">Completed on {new Date(biggestWin.created_at).toLocaleDateString()}</p>
                </>
              ) : (
                <p className="text-xl font-bold opacity-50">No major tasks completed yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}