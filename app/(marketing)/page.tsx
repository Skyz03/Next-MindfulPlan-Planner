import Link from 'next/link'
import { ArrowRight, Calendar, Clock, BarChart3, Target, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-stone-900 selection:bg-orange-500/30 dark:bg-[#0C0A09] dark:text-stone-200">
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-[#FAFAF9]/90 backdrop-blur-xl transition-all duration-300 dark:border-white/5 dark:bg-[#0C0A09]/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-3 font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm ring-1 ring-orange-400/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            Architect Studio
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            <Link
              href="/login"
              className="text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-stone-900 px-5 py-2.5 text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 dark:bg-white dark:text-black"
            >
              Enter Studio
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden px-8 pt-40 pb-32 md:pt-56 md:pb-48">
        {/* Subtle Grid Background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 mx-auto max-w-5xl space-y-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold tracking-widest text-orange-600 uppercase shadow-sm backdrop-blur-sm dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
            </span>
            v2.0 Now Live
          </div>

          <h1 className="font-serif text-6xl leading-[1.05] font-bold tracking-tight text-stone-900 drop-shadow-sm md:text-8xl dark:text-white">
            Design your time. <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Architect your life.
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-2xl leading-relaxed font-light text-stone-500 md:text-3xl dark:text-stone-400">
            The operating system for high-performers. Combine strategic planning, deep focus, and
            AI-powered reflection in one beautiful workspace.
          </p>

          <div className="flex flex-col items-center justify-center gap-5 pt-8 sm:flex-row">
            <Link
              href="/dashboard"
              className="flex h-14 items-center gap-3 rounded-2xl bg-stone-900 px-10 text-lg font-bold text-white shadow-xl shadow-stone-900/10 transition-all hover:scale-105 dark:bg-white dark:text-black dark:shadow-none"
            >
              Start Building
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Background Elements */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2 opacity-30 dark:opacity-20">
          <div className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full bg-orange-200/40 mix-blend-multiply blur-[120px] filter dark:bg-orange-900/20"></div>
          <div className="absolute -right-20 bottom-1/4 h-[600px] w-[600px] rounded-full bg-amber-100/40 mix-blend-multiply blur-[120px] filter dark:bg-purple-900/20"></div>
        </div>
      </section>

      {/* FEATURE 1: WEEKLY PLANNER */}
      <section className="border-y border-stone-100 bg-white px-8 py-32 dark:border-white/5 dark:bg-[#141416]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-16 md:flex-row md:gap-24">
            {/* Text Side */}
            <div className="flex-1 space-y-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100">
                <Calendar className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-4xl font-bold tracking-tight text-stone-900 md:text-5xl dark:text-white">
                The Weekly Strategy
              </h2>
              <p className="max-w-xl text-xl leading-relaxed text-stone-500 dark:text-stone-400">
                Stop reacting. Start designing. Drag your strategic goals into reality. Our weekly
                view is your canvas for a perfect week, ensuring high-level priorities don't get
                lost in the daily noise.
              </p>
              <ul className="space-y-4 font-medium text-stone-700 dark:text-stone-300">
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/50"></div>
                  Goal-oriented planning
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/50"></div>
                  Drag-and-drop scheduling
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/50"></div>
                  Visual workload balancing
                </li>
              </ul>
            </div>

            {/* Visual Side (Planner Mockup) */}
            <div className="group perspective-1000 relative flex-1">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-orange-100 to-stone-100 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100 dark:from-orange-900/20 dark:to-stone-800/20"></div>
              <div className="relative transform overflow-hidden rounded-[2.5rem] border border-stone-200 bg-stone-50 p-3 shadow-2xl shadow-stone-200/50 transition-transform duration-700 group-hover:scale-[1.02] group-hover:rotate-y-2 dark:border-stone-800 dark:bg-[#1C1917] dark:shadow-black/50">
                <div className="overflow-hidden rounded-[2rem] border border-stone-100 bg-white dark:border-stone-800/50 dark:bg-[#262626]">
                  {/* Fake UI header */}
                  <div className="flex h-12 items-center gap-4 border-b border-stone-100 bg-stone-50/50 px-6 dark:border-stone-800 dark:bg-stone-900/50">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-stone-200 dark:bg-stone-700"></div>
                      <div className="h-3 w-3 rounded-full bg-stone-200 dark:bg-stone-700"></div>
                    </div>
                    <div className="flex-1 text-center text-xs font-bold tracking-widest text-stone-400 uppercase">
                      Weekly Strategy
                    </div>
                  </div>
                  {/* Fake Grid */}
                  <div className="grid h-[400px] grid-cols-5 divide-x divide-stone-100 dark:divide-stone-800">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="relative space-y-3 p-4">
                        <div className="mb-6 text-center text-xs font-bold text-stone-400 uppercase">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                        </div>
                        {/* Fake Tasks */}
                        {i === 0 && (
                          <div className="h-16 animate-pulse rounded-xl border border-orange-200 bg-orange-100 dark:border-orange-800/50 dark:bg-orange-900/30"></div>
                        )}
                        {i === 1 && (
                          <div className="h-24 translate-y-4 rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-800"></div>
                        )}
                        {i === 2 && (
                          <div className="h-20 rounded-xl border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50"></div>
                        )}
                        {/* Drag Ghost */}
                        {i === 3 && (
                          <div className="absolute top-24 right-4 left-4 h-20 rotate-3 cursor-grabbing rounded-xl border-2 border-orange-400 bg-white opacity-80 shadow-lg dark:border-orange-500 dark:bg-stone-800">
                            <div className="h-full w-full animate-pulse rounded-lg bg-orange-50 dark:bg-orange-900/20"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 2: FOCUS MODE */}
      <section className="px-8 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col-reverse items-center gap-16 md:flex-row md:gap-24">
            {/* Visual Side (Focus UI Mockup) */}
            <div className="group relative flex-1">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-l from-stone-100 to-orange-50 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100 dark:from-stone-800/20 dark:to-orange-900/10"></div>
              <div className="relative flex transform flex-col items-center rounded-[2.5rem] border border-stone-200 bg-white p-8 text-center shadow-2xl shadow-stone-200/50 transition-transform duration-700 group-hover:scale-[1.02] dark:border-stone-800 dark:bg-[#18181b] dark:shadow-none">
                <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 ring-4 ring-orange-100 dark:bg-orange-900/20 dark:ring-orange-900/10">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                  <span className="font-serif text-3xl font-bold text-orange-600 dark:text-orange-400">
                    25:00
                  </span>
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Deep Work Session
                </h3>
                <p className="mb-8 text-stone-500">Q4 Launch Strategy Document</p>

                <div className="pointer-events-none w-full max-w-md space-y-3 opacity-50 grayscale transition-all duration-700 group-hover:grayscale-0">
                  <div className="flex h-14 items-center gap-4 rounded-xl border border-stone-100 bg-stone-50 px-4 dark:border-stone-700 dark:bg-stone-800">
                    <div className="h-5 w-5 rounded-full border-2 border-stone-300"></div>
                    <div className="h-2 w-32 rounded bg-stone-200 dark:bg-stone-700"></div>
                  </div>
                  <div className="flex h-14 items-center gap-4 rounded-xl border border-stone-100 bg-stone-50 px-4 dark:border-stone-700 dark:bg-stone-800">
                    <div className="h-5 w-5 rounded-full border-2 border-stone-300"></div>
                    <div className="h-2 w-24 rounded bg-stone-200 dark:bg-stone-700"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="flex-1 space-y-8 md:pl-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-4xl font-bold tracking-tight text-stone-900 md:text-5xl dark:text-white">
                Daily Focus Mode
              </h2>
              <p className="max-w-xl text-xl leading-relaxed text-stone-500 dark:text-stone-400">
                When it's time to execute, Architect eliminates the noise. Our single-task Focus
                Mode with built-in timers helps you enter a flow state and crush your most important
                work, one block at a time.
              </p>
              <ul className="space-y-4 font-medium text-stone-700 dark:text-stone-300">
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-stone-900 dark:bg-white"></div>
                  Distraction-free interface
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-stone-900 dark:bg-white"></div>
                  Integrated Pomodoro timer
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-stone-900 dark:bg-white"></div>
                  Next-task queuing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 3: REFLECTION & AI */}
      <section className="relative overflow-hidden bg-[#1C1917] px-8 py-32 text-white">
        {/* Background Accents */}
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-[800px] w-[800px] animate-pulse rounded-full bg-orange-500/10 mix-blend-screen blur-[120px] duration-[8000ms]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-16 md:flex-row md:gap-24">
            {/* Text Side */}
            <div className="flex-1 space-y-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/10 text-orange-400 backdrop-blur-sm">
                <Zap className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
                AI-Powered Reflection
              </h2>
              <p className="max-w-xl text-xl leading-relaxed font-light text-white/70">
                Data without insight is useless. Architect's AI Chief of Staff analyzes your week,
                identifies your patterns (like being a "morning lark"), and helps you course-correct
                for the future.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex cursor-default items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                  <BarChart3 className="h-4 w-4 text-orange-400" /> Velocity Tracking
                </div>
                <div className="flex cursor-default items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                  <Target className="h-4 w-4 text-orange-400" /> Goal Alignment
                </div>
              </div>
            </div>

            {/* Visual Side (Reflection Mockup Collection) */}
            <div className="relative flex-1">
              <div className="grid grid-cols-2 gap-4">
                {/* AI Card */}
                <div className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-800 to-stone-900 p-8 shadow-2xl transition-all duration-500 hover:border-orange-500/30">
                  <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 rounded-full bg-orange-500/20 p-32 blur-3xl transition-all duration-700 group-hover:bg-orange-500/30"></div>
                  <h3 className="relative z-10 mb-4 flex items-center gap-2 font-serif text-lg font-bold text-white">
                    <Zap className="h-5 w-5 text-orange-400" />
                    Chief of Staff Insight
                  </h3>
                  <p className="relative z-10 text-lg leading-relaxed font-light text-white/80">
                    "You are a <strong className="font-medium text-orange-300">morning lark</strong>
                    , but you consistently underestimate task complexity on Thursdays. Let's buffer
                    your Thursday morning blocks."
                  </p>
                </div>

                {/* Sankey/Flow Card */}
                <div className="group relative h-48 overflow-hidden rounded-3xl border border-white/10 bg-stone-800/50 p-6 backdrop-blur-md transition-colors hover:border-orange-500/50">
                  <div className="absolute inset-0 opacity-50 grayscale transition-all duration-500 group-hover:grayscale-0">
                    {/* Fake Sankey SVG */}
                    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                      <path
                        d="M0,20 C50,20 50,40 100,40 L100,60 C50,60 50,80 0,80 Z"
                        fill="url(#grad1)"
                        opacity="0.8"
                      />
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="absolute bottom-6 left-6">
                    <div className="mb-1 text-xs font-bold tracking-widest text-stone-400 uppercase">
                      Flow State
                    </div>
                    <div className="font-serif text-xl font-bold text-white">High Intent</div>
                  </div>
                </div>

                {/* Score Card */}
                <div className="relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-3xl bg-white p-6 text-center text-stone-900 shadow-lg">
                  <div className="relative z-10 mb-2 font-serif text-6xl font-black tracking-tighter text-orange-500">
                    92
                  </div>
                  <div className="relative z-10 text-xs font-bold tracking-widest text-stone-500 uppercase">
                    Productivity Score
                  </div>
                  {/* Background flair */}
                  <div className="absolute bottom-0 left-0 h-2 w-full bg-stone-100">
                    <div className="h-full w-[92%] bg-orange-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="relative overflow-hidden bg-white px-8 py-40 text-center dark:bg-[#0C0A09]">
        {/* Background Grid Accent */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>

        <div className="relative z-10 mx-auto max-w-3xl space-y-8">
          <h2 className="font-serif text-5xl font-bold tracking-tight text-stone-900 md:text-7xl dark:text-white">
            Ready to build?
          </h2>
          <p className="text-2xl leading-relaxed font-light text-stone-500 dark:text-stone-400">
            Join the high-performers who have stopped reacting and started architecting their lives.
          </p>
          <div className="pt-8">
            <Link
              href="/dashboard"
              className="inline-flex h-16 transform items-center gap-3 rounded-2xl bg-orange-500 px-12 text-xl font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-105 hover:bg-orange-600"
            >
              Enter the Studio
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-stone-200 bg-[#FAFAF9] px-8 py-16 dark:border-stone-800 dark:bg-[#0C0A09]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 opacity-60 md:flex-row">
          <div className="flex items-center gap-2 font-serif text-xl font-bold text-stone-900 dark:text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-stone-900 text-white dark:bg-white dark:text-black">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            Architect Studio.
          </div>
          <div className="flex gap-8 text-sm font-medium text-stone-600 dark:text-stone-400">
            <Link href="#" className="transition-colors hover:text-stone-900 dark:hover:text-white">
              Manifesto
            </Link>
            <Link href="#" className="transition-colors hover:text-stone-900 dark:hover:text-white">
              Pricing
            </Link>
            <Link href="#" className="transition-colors hover:text-stone-900 dark:hover:text-white">
              Twitter
            </Link>
          </div>
          <div className="text-sm text-stone-500 dark:text-stone-500">
            © 2025 Architecture Systems Inc.
          </div>
        </div>
      </footer>
    </div>
  )
}
