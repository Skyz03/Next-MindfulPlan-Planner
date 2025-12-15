import { ArrowUpRight, ArrowDownRight, Clock, Target } from 'lucide-react' // Or use your SVG icons

export default function StaticAnalysis({ data }: { data: any }) {
    const {
        completed, total, activityByDay, goalBreakdown,
        peakTime, planningAccuracy, focusHours
    } = data

    // 1. Calculate "Busiest Day"
    const busiestDay = [...activityByDay].sort((a, b) => b.total - a.total)[0]

    // 2. Calculate "Top Focus"
    const topGoal = goalBreakdown[0] || { name: 'General Admin', completed: 0, total: 1 }
    const focusPercent = Math.round((topGoal.completed / (completed || 1)) * 100)

    // 3. Efficiency Rate
    const efficiency = Math.round((completed / (total || 1)) * 100)

    return (
        <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">Analysis Report</h3>
            </div>

            <div className="space-y-6">

                {/* Insight 1: Velocity */}
                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-500">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">Peak Velocity on {busiestDay.day}</h4>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                            You cleared <strong className="text-stone-700 dark:text-stone-300">{busiestDay.total} tasks</strong> on your best day.
                            {busiestDay.total > 5 ? " High throughput." : " Steady pace."}
                        </p>
                    </div>
                </div>

                {/* Insight 2: Focus */}
                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-500">
                        <Target className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">{focusPercent}% Focus on "{topGoal.name}"</h4>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                            Your primary effort went towards your top goal.
                            {planningAccuracy === 'Calibrated'
                                ? " Your time estimation was accurate."
                                : ` You tend to ${planningAccuracy === 'Underestimator' ? 'underestimate' : 'overestimate'} task duration.`
                            }
                        </p>
                    </div>
                </div>

                {/* Insight 3: Rhythm */}
                <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-100 dark:border-stone-800/50 mt-2">
                    <p className="text-xs text-stone-500 italic">
                        "Based on your timestamps, you are a <span className="font-bold text-stone-700 dark:text-stone-300">{peakTime}</span> worker with an overall efficiency of {efficiency}%."
                    </p>
                </div>

            </div>
        </div>
    )
}