'use client'

import { useState } from 'react'
import { addStrategyGoal } from '@/features/strategy/actions'
import { Plus, Sparkles, X } from 'lucide-react'

export default function NewStrategyCard() {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="group flex h-full min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-white/50 transition-all hover:border-orange-300 hover:bg-orange-50/30 dark:border-stone-800 dark:bg-white/5 dark:hover:border-orange-900/50"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 transition-transform group-hover:scale-110 dark:bg-stone-800">
                    <Plus className="h-8 w-8 text-stone-400 group-hover:text-orange-500" />
                </div>
                <span className="mt-4 font-serif text-lg font-bold text-stone-500 group-hover:text-orange-600 dark:text-stone-400">
                    Design New Strategy
                </span>
            </button>
        )
    }

    return (
        <div className="relative h-full min-h-[300px] rounded-3xl border border-stone-200 bg-white p-8 shadow-xl animate-in zoom-in-95 dark:border-stone-800 dark:bg-[#1C1917]">
            <button
                onClick={() => setIsExpanded(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
            >
                <X className="h-5 w-5" />
            </button>

            <form action={async (formData) => {
                await addStrategyGoal(formData)
                setIsExpanded(false)
            }} className="space-y-6">

                <div>
                    <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-stone-800 dark:text-stone-100">
                        <Sparkles className="h-5 w-5 text-orange-500" /> New Vision
                    </h3>
                    <p className="text-xs text-stone-500">What do you want to achieve?</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-stone-400">Goal Title</label>
                        <input
                            name="title"
                            autoFocus
                            placeholder="e.g. Launch SaaS MVP"
                            required
                            className="w-full border-b border-stone-200 bg-transparent py-2 text-lg font-bold text-stone-900 placeholder:text-stone-300 focus:border-orange-500 focus:outline-none dark:border-stone-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-stone-400">Target Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            className="w-full rounded-lg bg-stone-50 p-3 text-sm outline-none dark:bg-stone-800 dark:text-stone-300"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-stone-400">Vision Statement</label>
                        <textarea
                            name="vision"
                            placeholder="Success looks like..."
                            className="h-24 w-full resize-none rounded-lg bg-stone-50 p-3 text-sm outline-none dark:bg-stone-800 dark:text-stone-300"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-stone-900 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-black"
                >
                    Initialize Strategy
                </button>
            </form>
        </div>
    )
}