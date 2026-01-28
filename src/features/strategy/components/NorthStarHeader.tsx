import { getStrategyData } from '@/features/strategy/actions' // Ensure this exists
import { Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function NorthStarHeader() {
    const strategies = await getStrategyData()

    // RUTHLESS LOGIC: Only show Active, High-Priority goals.
    // Don't clutter the view with "Someday" lists.
    const topStrategies = strategies
        .filter((s: any) => s.progress < 100) // Not done
        .slice(0, 3) // Only the top 3 focus points

    if (topStrategies.length === 0) return null

    return (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-300">
                    <Target className="h-4 w-4" />
                    North Star Objectives
                </h3>
                <Link
                    href="/strategy"
                    className="group flex items-center gap-1 text-[10px] font-medium text-indigo-400 transition-colors hover:text-indigo-600"
                >
                    View Strategy <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {topStrategies.map((goal: any) => (
                    <div
                        key={goal.id}
                        className="relative overflow-hidden rounded-lg border border-white bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                    >
                        {/* Progress Bar Background */}
                        <div
                            className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all"
                            style={{ width: `${goal.progress}%` }}
                        />

                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="line-clamp-1 font-serif text-sm font-semibold text-stone-900 dark:text-stone-100">
                                    {goal.title}
                                </h4>
                                <p className="mt-1 line-clamp-1 text-[10px] text-stone-500">
                                    {goal.totalTasks - goal.completedTasks} milestones remaining
                                </p>
                            </div>
                            {/* Visual indicator of priority */}
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}