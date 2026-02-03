'use client'

import { useState } from 'react'
import {
  Copy,
  Plus,
  Trash2,
  X,
  Clock,
  LayoutTemplate,
  Repeat,
  BatteryMedium,
  Settings2,
} from 'lucide-react'
import { addBlueprintItem, deleteBlueprintItem, applyBlueprintToWeek } from '@/features/planning/actions'
import { useFormStatus } from 'react-dom'

export default function BlueprintModal({
  items,
  currentDateStr,
}: {
  items: any[]
  currentDateStr: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [weeklyCapacity, setWeeklyCapacity] = useState(40)

  // --- 1. CALCULATE WEEKLY LOAD ---
  const TOTAL_CAPACITY_MINS = weeklyCapacity * 60

  const calculateWeeklyLoad = (blueprintItems: any[]) => {
    return blueprintItems.reduce((acc, item) => {
      const duration = item.duration || 0
      const freq = item.day_of_week
      let multiplier = 1
      if (freq === 7) multiplier = 7 // Everyday
      else if (freq === 8) multiplier = 5 // Weekdays
      else if (freq === 9) multiplier = 2 // Weekends
      return acc + duration * multiplier
    }, 0)
  }

  const committedMins = calculateWeeklyLoad(items)
  const committedHours = Math.round((committedMins / 60) * 10) / 10
  const percentageUsed = Math.min((committedMins / TOTAL_CAPACITY_MINS) * 100, 100)
  const remainingHours = Math.max(weeklyCapacity - committedHours, 0).toFixed(1)

  // --- HELPERS ---
  const getDayLabel = (val: number | null) => {
    if (val === null) return 'Inbox / Floating'
    if (val === 7) return 'Every Single Day'
    if (val === 8) return 'Weekdays (Mon-Fri)'
    if (val === 9) return 'Weekends (Sat-Sun)'
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][val]
  }

  const displayOrder = [7, 8, 9, 1, 2, 3, 4, 5, 6, 0, null]

  // ✅ NEW: "Porsche" Style Trigger (Icon Only)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 shadow-sm transition-all duration-200 hover:bg-stone-100 hover:text-stone-600 dark:border-stone-800 dark:bg-[#1C1917] dark:hover:bg-stone-800"
      >
        <LayoutTemplate className="h-4 w-4 stroke-[2.5]" />

        {/* Ghost Tooltip */}
        <span className="absolute top-full mt-2 z-50 w-auto whitespace-nowrap pointer-events-none scale-0 rounded-md bg-stone-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100 dark:bg-white dark:text-black">
          Edit Blueprint
        </span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 p-0 backdrop-blur-sm md:p-4 animate-in fade-in duration-200">
      <div className="flex h-full w-full flex-col overflow-hidden border border-stone-200 bg-[#FAFAF9] shadow-2xl duration-200 md:h-auto md:max-h-[90vh] md:max-w-5xl md:rounded-3xl dark:border-stone-800 dark:bg-[#1C1917] animate-in zoom-in-95">

        {/* HEADER */}
        <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4 md:p-8 md:pb-6 dark:border-stone-800 dark:bg-[#262626]">
          <div className="mb-4 flex items-start justify-between md:mb-6">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-stone-900 md:gap-3 md:text-3xl dark:text-white">
                <LayoutTemplate className="h-6 w-6 text-orange-500 md:h-8 md:w-8" />
                The Blueprint
              </h2>
              <p className="text-xs text-stone-500 md:text-base dark:text-stone-400">
                Design your default rituals and routines.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* TIME BUDGET BAR */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 md:p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-2 flex items-center justify-between text-xs font-medium md:text-sm">

              {/* Usage */}
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <BatteryMedium className="h-3 w-3 text-orange-500 md:h-4 md:w-4" />
                <span>
                  <span className="font-bold text-stone-900 dark:text-white">
                    {committedHours}h
                  </span>{' '}
                  Committed
                </span>
              </div>

              {/* Capacity Setting */}
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <span className="font-bold text-stone-900 dark:text-white">{remainingHours}h</span>{' '}
                Free of
                <div className="group relative flex items-center gap-1 border-b border-stone-300 dark:border-stone-600">
                  <Settings2 className="w-3 h-3 text-stone-400" />
                  <input
                    type="number"
                    value={weeklyCapacity}
                    onChange={(e) => setWeeklyCapacity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-8 bg-transparent text-center font-bold text-stone-900 dark:text-white outline-none p-0 text-xs md:text-sm"
                  />
                  <span className="text-xs">h</span>
                </div>
              </div>
            </div>

            {/* The Bar */}
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-stone-200 md:h-3 dark:bg-stone-800">
              <div
                className={`group relative h-full transition-all duration-500 ${percentageUsed > 100 ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                style={{ width: `${percentageUsed}%` }}
              ></div>
              <div className="flex-1 bg-transparent"></div>
            </div>

            <div className="mt-1 flex justify-between text-[10px] text-stone-400">
              <span>Rituals & Routines</span>
              <span>{percentageUsed > 100 ? 'Over Capacity!' : 'Total Budget'}</span>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex flex-1 flex-col overflow-y-auto md:flex-row">

          {/* LEFT COLUMN: Editor */}
          <div className="flex-shrink-0 border-b border-stone-200 bg-stone-50 p-4 md:w-[350px] md:border-r md:border-b-0 md:p-8 dark:border-stone-800 dark:bg-[#202022]">
            <div className="mb-4 flex items-center justify-between md:mb-6">
              <h3 className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                New Template
              </h3>
            </div>

            <form action={addBlueprintItem} className="space-y-4 md:space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  Task Title
                </label>
                <input
                  name="title"
                  placeholder="e.g. Morning Run"
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all outline-none focus:border-orange-500 md:py-3 dark:border-stone-700 dark:bg-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:block md:space-y-5">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-600 dark:text-stone-300">
                    <Repeat className="h-3 w-3" /> Freq
                  </label>
                  <div className="relative">
                    <select
                      name="day_of_week"
                      className="w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all outline-none focus:border-orange-500 md:py-3 dark:border-stone-700 dark:bg-stone-900"
                    >
                      <optgroup label="Recurring">
                        <option value="8">Weekdays (Mon-Fri)</option>
                        <option value="7">Everyday (Mon-Sun)</option>
                        <option value="9">Weekend (Sat-Sun)</option>
                      </optgroup>
                      <optgroup label="Specific Day">
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="0">Sunday</option>
                      </optgroup>
                      <optgroup label="Unscheduled">
                        <option value="">Inbox</option>
                      </optgroup>
                    </select>
                    <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-stone-400">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-600 dark:text-stone-300">
                    <Clock className="h-3 w-3" /> Mins
                  </label>
                  <input
                    type="number"
                    name="duration"
                    placeholder="60"
                    defaultValue={60}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all outline-none focus:border-orange-500 md:py-3 dark:border-stone-700 dark:bg-stone-900"
                  />
                </div>
              </div>

              <div className="pt-2 md:pt-4">
                <SubmitButton />
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Visual List */}
          <div className="flex-1 bg-[#FAFAF9] p-4 md:p-8 dark:bg-[#1C1917]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40 md:h-full">
                <LayoutTemplate className="mb-4 h-12 w-12 text-stone-300 md:h-16 md:w-16" />
                <p className="font-serif text-base font-bold text-stone-400 md:text-lg">
                  Your blueprint is empty.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 md:gap-8 md:pb-0">
                {displayOrder.map((dayCode) => {
                  const dayItems = items.filter((i) => i.day_of_week === dayCode)
                  if (dayItems.length === 0) return null
                  const isRecurrent = [7, 8, 9].includes(dayCode as number)

                  return (
                    <div key={String(dayCode)} className="break-inside-avoid">
                      <div className="mb-2 flex items-center gap-3 border-b border-stone-200 pb-2 dark:border-stone-800">
                        <span className={`text-xs font-bold tracking-widest uppercase ${isRecurrent ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-500'}`}>
                          {getDayLabel(dayCode as number)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {dayItems.map((item) => (
                          <div key={item.id} className="group relative flex items-center justify-between rounded-xl border border-stone-100 bg-white p-3 transition-all duration-200 hover:border-orange-300 hover:shadow-md dark:border-stone-800 dark:bg-[#262626] dark:hover:border-orange-700">
                            <div>
                              <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">{item.title}</div>
                              <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-stone-400">
                                <Clock className="h-3 w-3" /> {item.duration}m
                              </div>
                            </div>
                            <button onClick={() => deleteBlueprintItem(item.id)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-2 text-stone-300 transition-all hover:bg-red-50 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 dark:hover:bg-red-900/20">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 flex-col items-center justify-between gap-4 border-t border-stone-200 bg-white p-4 md:flex-row md:p-6 dark:border-stone-800 dark:bg-[#202022]">
          <div className="hidden text-xs font-medium text-stone-400 md:block">
            {items.length} templates
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <button onClick={() => setIsOpen(false)} className="flex-1 rounded-xl px-6 py-2.5 text-sm font-bold text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 md:flex-none dark:hover:bg-stone-800">
              Cancel
            </button>
            <form action={async () => { await applyBlueprintToWeek(currentDateStr); setIsOpen(false) }} className="flex-1 md:flex-none">
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-stone-900/10 transition-all hover:scale-105 hover:shadow-xl md:px-8 dark:bg-white dark:text-black">
                <Copy className="h-4 w-4" />
                Apply
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 md:py-3">
      {pending ? 'Adding...' : <><Plus className="h-4 w-4" /> Add Template</>}
    </button>
  )
}