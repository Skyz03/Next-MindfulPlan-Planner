import { getProductivityReport } from '@/core/lib/analytics'
import { getExistingReflection } from '@/features/reflection/actions'
import Link from 'next/link'
import { ThemeToggle } from '@/core/ui/ThemeToggle'
import StaticAnalysis from '@/features/reflection/components/StaticAnalysis'
import ReflectionJournal from '@/features/reflection/components/ReflectionJournal'

export default async function ReflectionPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const range = params.range === 'month' ? 'month' : 'week'

  const data = await getProductivityReport(range)
  if (!data) return null

  const dateStr = data.activityByDay[0]?.fullDate
  const userReflection = await getExistingReflection(dateStr)

  const { score, total, completed, goalBreakdown, focusHours, peakTime, planningAccuracy } = data
  const scoreColor =
    score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-stone-700 dark:text-stone-200' : 'text-orange-500'

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 font-sans text-stone-800 transition-colors duration-500 md:p-8 dark:bg-[#1C1917] dark:text-stone-200">

      {/* HEADER */}
      <header className="mx-auto mb-8 flex max-w-7xl flex-col items-end justify-between gap-4 md:flex-row">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Reflection
          </h1>
          <p className="mt-1 text-sm text-stone-500">Performance review & strategic journaling.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-lg bg-stone-200 p-1 text-xs font-bold dark:bg-stone-800">
            <Link
              href="/reflection?range=week"
              className={`rounded-md px-4 py-1.5 transition-all ${range === 'week' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-600 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Weekly
            </Link>
            <Link
              href="/reflection?range=month"
              className={`rounded-md px-4 py-1.5 transition-all ${range === 'month' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-600 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Monthly
            </Link>
          </div>
          <div className="h-6 w-px bg-stone-300 dark:bg-stone-700" />
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold transition-colors hover:border-orange-500 dark:border-stone-700 dark:bg-stone-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-12">

        {/* LEFT: Metrics */}
        <div className="space-y-6 md:col-span-8">

          {/* SCORE CARDS */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div className={`text-4xl font-black ${scoreColor}`}>{score}</div>
              <div className="mt-1 text-[10px] font-bold text-stone-400 uppercase">Score</div>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">
                {completed}<span className="text-lg text-stone-400">/{total}</span>
              </div>
              <div className="mt-1 text-[10px] font-bold text-stone-400 uppercase">Tasks Done</div>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">
                {focusHours}<span className="text-lg text-stone-400">h</span>
              </div>
              <div className="mt-1 text-[10px] font-bold text-stone-400 uppercase">Deep Work</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-[#262626]">
              <div className="text-xs font-bold text-stone-500">{peakTime}</div>
              <div className={`mt-1 text-sm font-bold ${planningAccuracy === 'Calibrated' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {planningAccuracy}
              </div>
              <div className="mt-1 text-[10px] font-bold text-stone-400 uppercase">Peak · Calibration</div>
            </div>
          </div>

          {/* ANALYSIS */}
          <StaticAnalysis data={data} />

          {/* FOCUS DISTRIBUTION */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-[#262626]">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-400 uppercase">
              Focus Distribution
            </h3>
            <div className="space-y-4">
              {goalBreakdown.length === 0 && (
                <p className="text-xs text-stone-400 italic">No strategic goals tracked this period.</p>
              )}
              {goalBreakdown.slice(0, 5).map((g) => (
                <div key={g.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="truncate pr-2 font-medium text-stone-700 dark:text-stone-300">{g.name}</span>
                    <span className="shrink-0 text-stone-400">{g.completed}/{g.total}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${g.total > 0 ? (g.completed / g.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Journal */}
        <div className="h-full md:col-span-4">
          <div className="sticky top-6 h-[calc(100vh-6rem)]">
            <ReflectionJournal
              dateStr={dateStr}
              initialData={userReflection}
              viewMode={range as 'week' | 'month'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
