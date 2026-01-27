export default function InsightSkeleton() {
  return (
    // ✅ RESPONSIVE: p-5 on mobile, p-8 on desktop
    <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 p-5 md:col-span-3 md:p-8 dark:border-slate-800 dark:bg-slate-900/50">
      {/* ✅ RESPONSIVE: gap-4 on mobile, gap-6 on desktop */}
      <div className="flex animate-pulse items-start gap-4 md:gap-6">
        {/* Icon Placeholder: Smaller on mobile */}
        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-stone-200 md:h-12 md:w-12 dark:bg-slate-800"></div>

        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-stone-200 dark:bg-slate-800"></div>
          <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-slate-800"></div>
          <div className="h-4 w-5/6 rounded bg-stone-200 dark:bg-slate-800"></div>
          <div className="h-4 w-1/2 rounded bg-stone-200 dark:bg-slate-800"></div>
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5"></div>
    </div>
  )
}
