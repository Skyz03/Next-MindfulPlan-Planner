'use client'

import { useState } from 'react'
import { updateGoalStrategy, deleteStrategyGoal, addGoalStep } from '@/actions/strategy'
import { updateTaskDescription, updateTaskPriority } from '@/actions/task' // ✅ Import priority action
import { Calendar, Flag, MapPin, Pencil, Save, X, Sparkles, Target, Trash2, Plus, CheckCircle2, Circle, FileText, ChevronDown } from 'lucide-react'
import PrioritySelect from '@/components/ui/PrioritySelect' // ✅ Import
import PriorityBadge from '@/components/ui/PriorityBadge'   // ✅ Import

export default function StrategyCard({ goal }: { goal: any }) {
    const [isEditing, setIsEditing] = useState(false)
    const [addPriority, setAddPriority] = useState('medium')

    // Calculate days left
    const daysLeft = goal.deadline
        ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null

    const progressColor = goal.progress >= 100
        ? 'from-emerald-400 to-emerald-600'
        : 'from-orange-400 via-rose-500 to-purple-600'

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-stone-800 dark:bg-[#1C1917]">
            {/* HEADER */}
            <div className="relative flex items-start justify-between border-b border-stone-100 bg-stone-50/40 p-6 backdrop-blur-sm dark:border-stone-800 dark:bg-white/5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                            {goal.progress}%
                        </span>
                        <h3 className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                            {goal.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-stone-500 dark:text-stone-400">
                        {daysLeft !== null && (
                            <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 ${daysLeft < 14 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-stone-100 dark:bg-stone-800'}`}>
                                <Calendar className="h-3 w-3" />
                                <span>{daysLeft > 0 ? `${daysLeft} days remaining` : 'Due today'}</span>
                            </div>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Target className="h-3 w-3 text-stone-400" />
                            {goal.completedTasks} / {goal.totalTasks} Milestones
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="group/btn relative flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition-colors hover:border-stone-300 hover:text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600 dark:hover:text-stone-200"
                >
                    {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </button>
            </div>

            {/* BODY */}
            <div className="p-6 md:p-8">
                {isEditing ? (
                    <EditForm goal={goal} close={() => setIsEditing(false)} />
                ) : (
                    <div className="space-y-10">
                        {/* JOURNEY BAR */}
                        <div className="relative mx-2 pt-4 pb-2">
                            <div className="absolute -top-1 left-0 text-[9px] font-bold tracking-widest text-stone-300 uppercase">Start</div>
                            <div className="absolute -top-1 right-0 text-[9px] font-bold tracking-widest text-stone-300 uppercase">Vision</div>
                            <div className="relative h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800">
                                <div className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${progressColor} opacity-90 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-1000 ease-out`} style={{ width: `${Math.max(goal.progress, 5)}%` }}></div>
                                <div className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out will-change-left" style={{ left: `${Math.max(goal.progress, 5)}%` }}>
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute h-8 w-8 animate-ping rounded-full bg-orange-500 opacity-20"></div>
                                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-red-500 text-sm shadow-lg dark:border-[#1C1917]">🚀</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NARRATIVE */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="relative rounded-2xl border border-stone-100 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900/50">
                                <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase dark:bg-[#1C1917]"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Reality</span></div>
                                <p className="text-sm leading-relaxed text-stone-600 italic dark:text-stone-400">"{goal.current_reality || "Define where you are starting from..."}"</p>
                            </div>
                            <div className="relative rounded-2xl border border-orange-100 bg-orange-50/50 p-5 dark:border-orange-900/20 dark:bg-orange-900/10">
                                <div className="absolute -top-3 right-4 bg-white px-2 text-[10px] font-bold tracking-widest text-orange-600 uppercase dark:bg-[#1C1917] dark:text-orange-400"><span className="flex items-center gap-1">The Goal <Flag className="h-3 w-3" /></span></div>
                                <p className="text-sm font-medium leading-relaxed text-stone-800 dark:text-stone-200">"{goal.vision_statement || "Define what success looks like..."}"</p>
                            </div>
                        </div>

                        {/* TACTICAL BREAKDOWN */}
                        <div className="border-t border-stone-100 pt-6 dark:border-stone-800">
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-500">Tactical Breakdown</h4>

                            {/* ADD STEP FORM */}
                            <form action={addGoalStep} className="mb-4 relative z-[100]">
                                <input type="hidden" name="goalId" value={goal.id} />
                                <input type="hidden" name="priority" value={addPriority} />

                                {/* Input Container */}
                                <div className="relative flex items-center">
                                    <input
                                        name="title"
                                        autoComplete="off"
                                        placeholder="Add a step..."
                                        className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-4 pr-32 text-sm shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:ring-orange-900/20"
                                    />

                                    {/* Priority Picker (Inside Input) */}
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 scale-90">
                                        <PrioritySelect
                                            value={addPriority}
                                            onChange={setAddPriority}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-stone-100 p-1.5 text-stone-500 hover:bg-orange-500 hover:text-white transition-colors dark:bg-stone-700">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>

                            {/* STEPS LIST */}
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {goal.tasks && goal.tasks.length > 0 ? (
                                    goal.tasks.map((task: any) => (
                                        <StrategyTaskRow key={task.id} task={task} />
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-xs text-stone-400 italic">
                                        No steps defined yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ⚡️ EXPANDABLE TASK ROW WITH PRIORITY
function StrategyTaskRow({ task }: { task: any }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const isScheduled = !!task.date || !!task.start_time

    // Priority Styling
    const borderClass = task.priority === 'high'
        ? 'border-rose-200 bg-rose-50/20 dark:border-rose-900/30'
        : task.priority === 'medium'
            ? 'border-orange-200 bg-orange-50/20 dark:border-orange-900/30'
            : 'border-transparent bg-white dark:bg-white/5'

    return (
        <div className={`rounded-lg border transition-all hover:border-stone-200 dark:hover:border-stone-700 ${borderClass}`}>

            {/* Main Row */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="group/task flex cursor-pointer items-center justify-between p-2"
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Status Circle */}
                    {task.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    ) : (
                        <Circle className="h-4 w-4 flex-shrink-0 text-stone-300" />
                    )}

                    {/* Title */}
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <span className={`text-sm truncate ${task.is_completed ? 'text-stone-400 line-through' : 'text-stone-700 dark:text-stone-300'}`}>
                            {task.title}
                        </span>

                        {/* ✅ Priority Badge */}
                        <PriorityBadge priority={task.priority} />

                        {/* Note Indicator */}
                        {task.description && (
                            <FileText className="h-3 w-3 flex-shrink-0 text-stone-400" />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {!task.is_completed && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isScheduled
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
                            }`}>
                            {isScheduled ? 'Scheduled' : 'Backlog'}
                        </span>
                    )}

                    {/* Chevron */}
                    <div className={`text-stone-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-stone-100 px-3 py-3 dark:border-stone-800 animate-in slide-in-from-top-1">

                    {/* Priority Settings */}
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Priority Level</span>
                        <PrioritySelect
                            value={task.priority || 'low'}
                            onChange={(val) => updateTaskPriority(task.id, val)}
                        />
                    </div>

                    {/* Description */}
                    <textarea
                        defaultValue={task.description || ''}
                        placeholder="Log what was done, key learnings, or results..."
                        onBlur={(e) => updateTaskDescription(task.id, e.target.value)}
                        className="w-full resize-none rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-700 outline-none focus:ring-2 focus:ring-orange-100 dark:bg-black/20 dark:text-stone-300 dark:focus:ring-orange-900/20"
                        rows={3}
                    />
                </div>
            )}
        </div>
    )
}

function EditForm({ goal, close }: { goal: any, close: () => void }) {
    // ... (Keep existing EditForm code exactly as is)
    return (
        <form action={async (formData) => {
            await updateGoalStrategy(formData)
            close()
        }} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <input type="hidden" name="goalId" value={goal.id} />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Current Reality (Point A)</label>
                    <textarea name="reality" defaultValue={goal.current_reality} placeholder="I currently struggle with..." className="h-32 w-full resize-none rounded-xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-700 shadow-sm outline-none ring-2 ring-transparent transition-all focus:border-stone-300 focus:ring-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:ring-stone-800" />
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-500"><Sparkles className="h-3 w-3" /> Success Vision (Point B)</label>
                    <textarea name="vision" defaultValue={goal.vision_statement} placeholder="I want to become..." className="h-32 w-full resize-none rounded-xl border border-orange-200 bg-orange-50/30 p-4 text-sm leading-relaxed text-stone-900 shadow-sm outline-none ring-2 ring-transparent transition-all focus:border-orange-300 focus:ring-orange-100 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-stone-100 dark:focus:ring-orange-900/20" />
                </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-6 dark:border-stone-800">
                <button type="button" onClick={async () => { if (confirm('Delete strategy?')) await deleteStrategyGoal(goal.id) }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /> Delete</button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-1.5 dark:bg-stone-800"><Calendar className="h-4 w-4 text-stone-400" /><input type="date" name="deadline" defaultValue={goal.deadline} className="bg-transparent text-xs font-bold text-stone-700 outline-none dark:text-stone-300" /></div>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-stone-900/20 transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black"><Save className="h-4 w-4" /> Save Design</button>
                </div>
            </div>
        </form>
    )
}