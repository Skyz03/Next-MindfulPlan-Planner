import { Clock, Target } from 'lucide-react'
import type { ProductivityReport } from '@/core/lib/analytics'

export default function StaticAnalysis({ data }: { data: ProductivityReport }) {
  const { completed, total, activityByDay, goalBreakdown, peakTime, planningAccuracy } = data

  const busiestDay = [...activityByDay].sort((a, b) => b.total - a.total)[0]
  const topGoal = goalBreakdown[0] || { name: 'General Admin', completed: 0, total: 1 }
  const focusPercent = Math.round((topGoal.completed / (completed || 1)) * 100)
  const efficiency = Math.round((completed / (total || 1)) * 100)

  return (
    <div className="h-full rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6 dark:border-stone-800 dark:bg-[#262626]">
      <h3 className="mb-4 text-[10px] font-bold tracking-widest text-stone-500 uppercase md:mb-6 md:text-xs">
        Analysis
      </h3>

      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex-shrink-0 rounded-lg bg-stone-100 p-2 text-stone-500 dark:bg-stone-800">
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Peak velocity on {busiestDay?.day ?? '—'}
            </h4>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500 md:mt-1">
              You cleared{' '}
              <strong className="text-stone-700 dark:text-stone-300">{busiestDay?.total ?? 0} tasks</strong>{' '}
              on your best day.{(busiestDay?.total ?? 0) > 5 ? ' High throughput.' : ' Steady pace.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex-shrink-0 rounded-lg bg-stone-100 p-2 text-stone-500 dark:bg-stone-800">
            <Target className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {focusPercent}% focus on &ldquo;{topGoal.name}&rdquo;
            </h4>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500 md:mt-1">
              {planningAccuracy === 'Calibrated'
                ? 'Your time estimates were accurate.'
                : `You tend to ${planningAccuracy === 'Underestimator' ? 'underestimate' : 'overestimate'} task duration.`}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 md:p-4 dark:border-stone-800/50 dark:bg-stone-900/50">
          <p className="text-xs leading-relaxed text-stone-500 italic">
            Based on timestamps, you are a{' '}
            <span className="font-bold text-stone-700 dark:text-stone-300">{peakTime}</span> worker with{' '}
            {efficiency}% overall efficiency.
          </p>
        </div>
      </div>
    </div>
  )
}
