'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Clock } from 'lucide-react'

interface Props {
  defaultMinutes?: number
  onChange?: (newDuration: number) => void
}

export default function DurationInput({ defaultMinutes = 60, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const [hours, setHours] = useState<string | number>(Math.floor(defaultMinutes / 60))
  const [minutes, setMinutes] = useState<string | number>(defaultMinutes % 60)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const lastSavedValue = useRef(defaultMinutes)

  const hVal = typeof hours === 'string' ? parseInt(hours) || 0 : hours
  const mVal = typeof minutes === 'string' ? parseInt(minutes) || 0 : minutes
  const totalMinutes = hVal * 60 + mVal

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
  }

  const handleSave = (newTotal: number) => {
    if (onChange && newTotal !== lastSavedValue.current) {
      onChange(newTotal)
      lastSavedValue.current = newTotal
    }
  }

  const toggleOpen = () => {
    if (!isOpen) {
      updatePosition()
      setIsOpen(true)
    } else {
      handleSave(totalMinutes)
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return
      const target = event.target as Node
      const clickedButton = buttonRef.current?.contains(target)
      const clickedPopup = popupRef.current?.contains(target)

      if (!clickedButton && !clickedPopup) {
        handleSave(totalMinutes)
        setIsOpen(false)
      }
    }
    const handleScroll = () => {
      if (isOpen) setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, { capture: true })
      window.addEventListener('resize', handleScroll)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen, totalMinutes])

  const handlePresetClick = (m: number) => {
    setHours(Math.floor(m / 60))
    setMinutes(m % 60)
    handleSave(m)
    setIsOpen(false)
  }

  const renderPopup = () => {
    if (typeof document === 'undefined') return null

    return createPortal(
      <div
        ref={popupRef}
        style={{ top: coords.top, left: coords.left }}
        // ✅ RESPONSIVE: max-w-[90vw] ensures it doesn't clip on small screens
        className="animate-in fade-in zoom-in-95 fixed z-[9999] w-36 max-w-[90vw] rounded-xl border border-stone-200 bg-white p-3 shadow-xl shadow-stone-200/50 duration-200 dark:border-stone-800 dark:bg-[#1C1917] dark:shadow-black/50"
      >
        {/* Inputs Row */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-center text-[9px] font-bold text-stone-400 uppercase">
              Hr
            </label>
            <input
              type="number"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              // ✅ RESPONSIVE: text-base on mobile prevents iOS auto-zoom
              className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 text-center text-base font-bold transition-all outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:text-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            />
          </div>
          <div className="pt-4 font-bold text-stone-300">:</div>
          <div className="flex-1">
            <label className="mb-1 block text-center text-[9px] font-bold text-stone-400 uppercase">
              Min
            </label>
            <input
              type="number"
              min="0"
              step="15"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 text-center text-base font-bold transition-all outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:text-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-1.5">
          {[15, 30, 45, 60, 90, 120].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handlePresetClick(m)}
              // ✅ RESPONSIVE: larger padding for touch targets
              className="rounded-md bg-stone-100 px-1 py-2 text-[10px] font-medium text-stone-500 transition-colors hover:bg-orange-100 hover:text-orange-600 md:py-1.5 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-400"
            >
              {m < 60 ? `${m}m` : `${m / 60}h`}
            </button>
          ))}
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <>
      <input type="hidden" name="duration" value={totalMinutes} />
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        // ✅ RESPONSIVE: Increased padding (py-1 px-2.5) for touch targets
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium transition-all md:py-0.5 ${
          isOpen
            ? 'bg-orange-100 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-800'
            : 'border border-stone-100 bg-stone-50 text-stone-400 hover:border-orange-200 hover:text-orange-500 dark:border-stone-800 dark:bg-stone-800/50'
        }`}
        title="Edit Duration"
      >
        <Clock className="h-3.5 w-3.5 md:h-3 md:w-3" />
        <span>
          {hVal > 0 ? `${hVal}h` : ''}
          {mVal > 0 ? ` ${mVal}m` : ''}
          {hVal === 0 && mVal === 0 && 'Set time'}
        </span>
      </button>
      {isOpen && renderPopup()}
    </>
  )
}
