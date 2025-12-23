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

    // Internal state for the inputs
    const [hours, setHours] = useState<string | number>(Math.floor(defaultMinutes / 60))
    const [minutes, setMinutes] = useState<string | number>(defaultMinutes % 60)

    const buttonRef = useRef<HTMLButtonElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)

    // Keep track of the last saved value
    const lastSavedValue = useRef(defaultMinutes)

    const hVal = typeof hours === 'string' ? parseInt(hours) || 0 : hours
    const mVal = typeof minutes === 'string' ? parseInt(minutes) || 0 : minutes
    const totalMinutes = (hVal * 60) + mVal

    // Function to calculate position
    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            // Position the popup 4px below the button
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX
            })
        }
    }

    const handleSave = (newTotal: number) => {
        if (onChange && newTotal !== lastSavedValue.current) {
            onChange(newTotal)
            lastSavedValue.current = newTotal
        }
    }

    // Handle Opening
    const toggleOpen = () => {
        if (!isOpen) {
            updatePosition()
            setIsOpen(true)
        } else {
            handleSave(totalMinutes)
            setIsOpen(false)
        }
    }

    // Handle Click Outside (Must handle separate refs because of Portal)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // If modal isn't open, ignore
            if (!isOpen) return

            const target = event.target as Node
            const clickedButton = buttonRef.current?.contains(target)
            const clickedPopup = popupRef.current?.contains(target)

            // If we clicked outside BOTH the button and the popup, close it
            if (!clickedButton && !clickedPopup) {
                handleSave(totalMinutes)
                setIsOpen(false)
            }
        }

        // Handle Scroll (Close on scroll to prevent floating weirdness)
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

    // -- RENDER POPUP VIA PORTAL --
    const renderPopup = () => {
        if (typeof document === 'undefined') return null

        return createPortal(
            <div
                ref={popupRef}
                style={{ top: coords.top, left: coords.left }}
                className="fixed z-[9999] w-36 rounded-xl border border-stone-200 bg-white p-3 shadow-xl shadow-stone-200/50 animate-in fade-in zoom-in-95 duration-200 dark:border-stone-800 dark:bg-[#1C1917] dark:shadow-black/50"
            >
                {/* Inputs Row */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                        <label className="block text-[9px] font-bold text-stone-400 uppercase text-center mb-1">Hr</label>
                        <input
                            type="number"
                            min="0"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full rounded-lg bg-stone-50 border border-stone-200 text-center text-sm font-bold py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                        />
                    </div>
                    <div className="text-stone-300 pt-4 font-bold">:</div>
                    <div className="flex-1">
                        <label className="block text-[9px] font-bold text-stone-400 uppercase text-center mb-1">Min</label>
                        <input
                            type="number"
                            min="0"
                            step="15"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            className="w-full rounded-lg bg-stone-50 border border-stone-200 text-center text-sm font-bold py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                        />
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-1.5">
                    {[15, 30, 45, 60, 90, 120].map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => handlePresetClick(m)}
                            className="px-1 py-1.5 rounded-md bg-stone-100 text-[10px] font-medium text-stone-500 hover:bg-orange-100 hover:text-orange-600 transition-colors dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-400"
                        >
                            {m < 60 ? `${m}m` : `${m / 60}h`}
                        </button>
                    ))}
                </div>
            </div>,
            document.body // 👈 Renders directly into the body tag
        )
    }

    return (
        <>
            {/* Hidden input for Form-based usage */}
            <input type="hidden" name="duration" value={totalMinutes} />

            {/* Trigger Button */}
            <button
                ref={buttonRef} // 👈 Ref for positioning
                type="button"
                onClick={toggleOpen}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${isOpen
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800'
                        : 'bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-stone-400 hover:text-orange-500 hover:border-orange-200'
                    }`}
                title="Edit Duration"
            >
                <Clock className="w-3 h-3" />
                <span>
                    {hVal > 0 ? `${hVal}h` : ''}{mVal > 0 ? ` ${mVal}m` : ''}
                    {hVal === 0 && mVal === 0 && 'Set time'}
                </span>
            </button>

            {/* Render Portal if Open */}
            {isOpen && renderPopup()}
        </>
    )
}