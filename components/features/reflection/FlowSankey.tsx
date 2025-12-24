'use client'

export default function FlowSankey({ data }: { data: any }) {
  const { planned, adHoc, flows } = data
  const total = Math.max(planned + adHoc, 1)

  const viewHeight = 200
  const viewWidth = 100

  const getH = (val: number) => Math.max((val / total) * viewHeight, 2)

  // LEFT SIDE
  const hPlanned = getH(planned)
  const hAdHoc = getH(adHoc)

  // RIGHT SIDE
  const totalCompleted = flows.plannedToCompleted + flows.adHocToCompleted
  const totalRolled = flows.plannedToRolled + flows.adHocToRolled
  const hCompleted = getH(totalCompleted)
  const hRolled = getH(totalRolled)

  const gap = 10

  const contentHeightLeft = hPlanned + hAdHoc + gap
  const offsetLeft = (viewHeight - contentHeightLeft) / 2
  const yPlanned = offsetLeft
  const yAdHoc = yPlanned + hPlanned + gap

  const contentHeightRight = hCompleted + hRolled + gap
  const offsetRight = (viewHeight - contentHeightRight) / 2
  const yCompleted = offsetRight
  const yRolled = yCompleted + hCompleted + gap

  const drawFlow = (
    yStart: number,
    hStart: number,
    yEnd: number,
    hEnd: number,
    color: string,
    opacity: number,
  ) => {
    if (hStart <= 0 || hEnd <= 0) return null
    const c1x = 50
    const c2x = 50
    const path = `
      M 0 ${yStart}
      C ${c1x} ${yStart}, ${c2x} ${yEnd}, 100 ${yEnd}
      L 100 ${yEnd + hEnd}
      C ${c2x} ${yEnd + hEnd}, ${c1x} ${yStart + hStart}, 0 ${yStart + hStart}
      Z
    `
    return (
      <path
        d={path}
        fill={color}
        opacity={opacity}
        className="transition-opacity duration-300 hover:opacity-80"
      />
    )
  }

  const hP_C = getH(flows.plannedToCompleted)
  const hP_R = getH(flows.plannedToRolled)
  const hA_C = getH(flows.adHocToCompleted)
  const hA_R = getH(flows.adHocToRolled)

  return (
    <div className="flex h-full min-h-[300px] flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-5 dark:border-stone-800 dark:bg-[#262626]">
      {/* HEADER: Stack vertically on mobile, row on desktop */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xs font-bold tracking-widest text-stone-500 uppercase">
            Flow Analysis
          </h3>
          <p className="text-[10px] text-stone-400">Intent vs. Reality</p>
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-[9px] text-stone-400 sm:flex-col sm:gap-1">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>Ad-Hoc
          </span>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="relative flex flex-1 items-center gap-2 md:gap-4">
        {/* LEFT LABELS: w-12 on mobile, w-16 on desktop */}
        <div className="flex h-[200px] w-12 flex-none flex-col justify-between py-4 text-right md:w-16">
          <div className="flex flex-col justify-center" style={{ flex: hPlanned }}>
            <span className="truncate text-[10px] font-bold text-emerald-600 md:text-xs dark:text-emerald-400">
              Plan
            </span>
            <span className="text-[9px] text-stone-400">{planned}</span>
          </div>
          <div className="h-4"></div>
          <div className="flex flex-col justify-center" style={{ flex: hAdHoc }}>
            <span className="truncate text-[10px] font-bold text-orange-500 md:text-xs">AdHoc</span>
            <span className="text-[9px] text-stone-400">{adHoc}</span>
          </div>
        </div>

        {/* SVG */}
        <div className="relative h-[200px] flex-1">
          <svg
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            {/* Left Nodes */}
            <rect x="0" y={yPlanned} width="3" height={hPlanned} fill="#10b981" rx="1.5" />
            <rect x="0" y={yAdHoc} width="3" height={hAdHoc} fill="#f97316" rx="1.5" />

            {/* Flows */}
            {drawFlow(yPlanned, hP_C, yCompleted, hP_C, '#10b981', 0.25)}
            {drawFlow(yPlanned + hP_C, hP_R, yRolled, hP_R, '#10b981', 0.1)}
            {drawFlow(yAdHoc, hA_C, yCompleted + hP_C, hA_C, '#f97316', 0.25)}
            {drawFlow(yAdHoc + hA_C, hA_R, yRolled + hP_R, hA_R, '#f97316', 0.1)}

            {/* Right Nodes */}
            <rect x="97" y={yCompleted} width="3" height={hCompleted} fill="#3b82f6" rx="1.5" />
            <rect x="97" y={yRolled} width="3" height={hRolled} fill="#78716c" rx="1.5" />
          </svg>
        </div>

        {/* RIGHT LABELS */}
        <div className="flex h-[200px] w-12 flex-none flex-col justify-between py-4 text-left md:w-16">
          <div className="flex flex-col justify-center" style={{ flex: hCompleted }}>
            <span className="truncate text-[10px] font-bold text-blue-500 md:text-xs">Done</span>
            <span className="text-[9px] text-stone-400">{totalCompleted}</span>
          </div>
          <div className="h-4"></div>
          <div className="flex flex-col justify-center" style={{ flex: hRolled }}>
            <span className="truncate text-[10px] font-bold text-stone-500 md:text-xs">Roll</span>
            <span className="text-[9px] text-stone-400">{totalRolled}</span>
          </div>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-4 flex items-start gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
        <div className="mt-0.5 hidden rounded bg-stone-100 p-1 text-stone-400 sm:block dark:bg-stone-800">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <p className="text-[9px] leading-relaxed text-stone-400 md:text-[10px]">
          <span className="font-bold text-stone-600 dark:text-stone-300">Note:</span> Large{' '}
          <span className="text-orange-500">Orange</span> flows indicate reactive work.
        </p>
      </div>
    </div>
  )
}
