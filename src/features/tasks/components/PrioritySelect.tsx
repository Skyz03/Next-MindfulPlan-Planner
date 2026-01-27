'use client'

import { useState } from 'react'
import { Check, ChevronDown, SignalHigh, SignalMedium, SignalLow } from 'lucide-react'

type Priority = 'low' | 'medium' | 'high'

const PRIORITIES = [
    { value: 'high', label: 'Critical', icon: SignalHigh, color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Must be done today' },
    { value: 'medium', label: 'Standard', icon: SignalMedium, color: 'text-orange-600 bg-orange-50 border-orange-200', desc: 'Important but flexible' },
    { value: 'low', label: 'Low', icon: SignalLow, color: 'text-stone-500 bg-stone-100 border-stone-200', desc: 'Can wait' },
]

export default function PrioritySelect({
    value,
    onChange
}: {
    value: string;
    onChange: (val: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const current = PRIORITIES.find(p => p.value === value) || PRIORITIES[2]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all hover:bg-white hover:shadow-sm ${current.color.replace('bg-', 'hover:bg-')}`}
            >
                <current.icon className="h-3.5 w-3.5" />
                <span>{current.label}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl dark:border-stone-800 dark:bg-[#1C1917] animate-in fade-in zoom-in-95">
                        <div className="bg-stone-50 p-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:bg-stone-900">
                            Select Priority
                        </div>
                        <div className="p-1">
                            {PRIORITIES.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => {
                                        onChange(p.value)
                                        setIsOpen(false)
                                    }}
                                    className={`group flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 ${value === p.value ? 'bg-stone-50 dark:bg-stone-800' : ''}`}
                                >
                                    <div className={`mt-0.5 rounded-md border p-1 ${p.color}`}>
                                        <p.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-stone-700 dark:text-stone-200">{p.label}</span>
                                            {value === p.value && <Check className="h-3 w-3 text-stone-400" />}
                                        </div>
                                        <span className="text-[10px] text-stone-400">{p.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}