'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <>
      {/* TRIGGER BUTTON (Visible only on Mobile) */}
      <button
        onClick={toggle}
        className="-ml-2 rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 md:hidden dark:hover:bg-stone-800"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* BACKDROP & PANEL */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="animate-in fade-in absolute inset-0 bg-stone-900/60 backdrop-blur-sm duration-200"
              onClick={toggle}
            />

            {/* Sidebar Drawer */}
            <div className="animate-in slide-in-from-left absolute top-0 bottom-0 left-0 flex w-[85%] max-w-sm flex-col bg-[#F5F5F4] shadow-2xl duration-300 dark:bg-[#18181b]">
              {/* Close Button Header */}
              <div className="flex justify-end border-b border-stone-200 p-4 dark:border-stone-800">
                <button onClick={toggle} className="p-2 text-stone-400 hover:text-stone-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content passed from parent (The original sidebar) */}
              <div className="relative flex-1 overflow-hidden">{children}</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
