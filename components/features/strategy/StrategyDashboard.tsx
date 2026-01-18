import { getStrategyData } from '@/actions/strategy'
import StrategyCard from './StrategyCard'
import { Layout, Compass } from 'lucide-react'
import NewStrategyCard from './NewStrategyCard'

export default async function StrategyDashboard() {
    const strategies = await getStrategyData()

    return (
        // Use a subtle background pattern for a "Studio" feel
        <div className="h-full w-full overflow-y-auto bg-[#F9F9F8] dark:bg-[#121212]">
            <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">

                {/* HERO SECTION */}
                <div className="mb-12 max-w-2xl">
                    <div className="flex items-center gap-3 text-orange-600 dark:text-orange-500">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                            <Compass className="h-6 w-6" />
                        </div>
                        <span className="font-bold tracking-widest text-xs uppercase">Strategy Studio</span>
                    </div>
                    <h1 className="mt-4 font-serif text-4xl font-bold text-stone-900 dark:text-white md:text-5xl">
                        Design your outcomes.
                    </h1>
                    <p className="mt-4 text-lg text-stone-500 dark:text-stone-400 leading-relaxed">
                        Stop reacting to tasks. Start architecting your future. Define the gap between your current reality and your vision.
                    </p>
                </div>

                {/* GRID LAYOUT */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-10">
                    {strategies.map((goal) => (
                        <StrategyCard key={goal.id} goal={goal} />
                    ))}

                    <NewStrategyCard />

                    {/* EMPTY STATE - Styled as a "Blueprint" */}
                    {strategies.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-white/50 py-24 text-center dark:border-stone-800 dark:bg-white/5">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                                <Layout className="h-8 w-8 text-stone-400" />
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-stone-700 dark:text-stone-200">The canvas is empty.</h3>
                            <p className="mt-2 max-w-md text-stone-500">
                                Create a Goal in the sidebar to begin designing your strategy.
                            </p>
                        </div>
                    )}
                </div>

                {/* FOOTER NOTE */}
                {strategies.length > 0 && (
                    <div className="mt-16 border-t border-stone-200 pt-8 text-center dark:border-stone-800">
                        <p className="text-xs font-medium text-stone-400 italic">
                            "A goal without a plan is just a wish."
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}