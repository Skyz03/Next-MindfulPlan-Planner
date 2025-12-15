'use client'

import { useState } from 'react'
import { saveReflection } from '@/actions/reflections'

export default function ReflectionJournal({
    dateStr,
    initialData,
    viewMode // 'week' | 'month'
}: {
    dateStr: string,
    initialData: any,
    viewMode: 'week' | 'month'
}) {
    const [energy, setEnergy] = useState(initialData?.energy_rating || 3)
    const [isSaving, setIsSaving] = useState(false)

    // 1. Dynamic Labels based on View Mode
    const title = viewMode === 'month' ? 'Monthly Review' : 'Weekly Debrief'
    const nextStepsLabel = viewMode === 'month' ? "Next Month's Big 3" : "Next Week's Big 3"
    const placeholder = viewMode === 'month'
        ? "Review the big picture. Did you move closer to your strategic goals?"
        : "What worked? What blocked you? Write it down..."

    const handleSave = async (formData: FormData) => {
        setIsSaving(true)
        await saveReflection(dateStr, formData)
        setIsSaving(false)
    }

    return (
        <div className="h-full bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                {/* Dynamic Title */}
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">{title}</h3>
            </div>

            <form action={handleSave} className="flex-1 flex flex-col gap-6">
                <input type="hidden" name="energy" value={energy} />

                {/* Energy Rating */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 block">How did you feel?</label>
                    <div className="flex justify-between gap-2 p-1 bg-stone-100 dark:bg-stone-800/50 rounded-xl">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setEnergy(level)}
                                className={`flex-1 py-2 rounded-lg text-lg transition-all ${energy === level
                                        ? 'bg-white dark:bg-stone-600 shadow-sm scale-105'
                                        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                                    }`}
                            >
                                {level === 1 ? '😫' : level === 2 ? '😕' : level === 3 ? '😐' : level === 4 ? '🙂' : '🔥'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes Area */}
                <div className="flex-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 block">Notes & Observations</label>
                    <textarea
                        name="notes"
                        defaultValue={initialData?.reflection_text}
                        placeholder={placeholder}
                        className="w-full h-32 md:h-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-sm text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                    />
                </div>

                {/* Forward Planning */}
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3 block">{nextStepsLabel}</label>
                    <div className="space-y-2">
                        <input name="goal_1" defaultValue={initialData?.next_week_goals?.[0]} placeholder="1. Most important outcome..." className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-2 text-sm focus:border-orange-500 outline-none transition-colors" />
                        <input name="goal_2" defaultValue={initialData?.next_week_goals?.[1]} placeholder="2. Secondary objective..." className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-2 text-sm focus:border-orange-500 outline-none transition-colors" />
                        <input name="goal_3" defaultValue={initialData?.next_week_goals?.[2]} placeholder="3. Third priority..." className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-2 text-sm focus:border-orange-500 outline-none transition-colors" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    {isSaving ? 'Saving...' : 'Commit to Plan'}
                </button>
            </form>
        </div>
    )
}