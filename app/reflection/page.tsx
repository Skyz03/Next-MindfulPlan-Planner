import { getWeeklyStats } from '@/utils/stats'
import { saveReflection } from '@/app/actions'
import Link from 'next/link'

export default async function ReflectionPage() {
    const { completed, total, startOfWeek } = await getWeeklyStats()
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden relative z-10">

                {/* Left Side: The Data (Visuals) */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div>
                        <h1 className="text-3xl font-bold mb-2">Weekly Review</h1>
                        <p className="text-indigo-200">Take a breath. Look back.</p>
                    </div>

                    <div className="space-y-8 my-10">
                        <div>
                            <span className="text-6xl font-black tracking-tighter">{percentage}%</span>
                            <p className="text-indigo-200 font-medium uppercase tracking-widest text-xs mt-1">Completion Rate</p>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold">{completed}</span>
                            <span className="text-indigo-300 mb-1">/ {total} tasks done</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <p className="text-sm italic opacity-80">"Productivity is about doing the right things, not just doing things."</p>
                    </div>
                </div>

                {/* Right Side: The Form */}
                <div className="p-10 flex flex-col justify-center">
                    <form action={saveReflection} className="space-y-6">
                        <input type="hidden" name="completed_count" value={completed} />
                        <input type="hidden" name="week_start" value={startOfWeek.toISOString()} />

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">🏆 Biggest Win</label>
                            <textarea
                                name="win"
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-700 focus:bg-white focus:ring-2 ring-indigo-200 outline-none transition-all shadow-inner resize-none"
                                rows={2}
                                placeholder="I shipped the MVP..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">🚧 Biggest Challenge</label>
                            <textarea
                                name="challenge"
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-700 focus:bg-white focus:ring-2 ring-red-200 outline-none transition-all shadow-inner resize-none"
                                rows={2}
                                placeholder="Social media distraction..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">⚡ Energy Rating</label>
                            <div className="flex justify-between bg-slate-50 p-2 rounded-xl inner-shadow">
                                {[2, 4, 6, 8, 10].map((num) => (
                                    <label key={num} className="cursor-pointer group relative">
                                        <input type="radio" name="energy" value={num} className="peer sr-only" />
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400 group-hover:bg-white group-hover:text-indigo-500 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:shadow-lg transition-all">
                                            {num}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Link href="/" className="px-6 py-3 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-colors">
                                Back
                            </Link>
                            <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold shadow-xl shadow-slate-300/50 hover:bg-black hover:scale-[1.02] transition-all">
                                Save Reflection
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}