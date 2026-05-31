'use client'

interface ToastProps {
  message: string
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[1000] flex justify-center px-4 sm:bottom-8">
      <div className="pointer-events-auto max-w-xl rounded-2xl border border-stone-200 bg-stone-950/95 px-4 py-3 text-sm font-medium text-white shadow-2xl shadow-stone-950/30 backdrop-blur-xl dark:border-stone-700 dark:bg-stone-900/95">
        {message}
      </div>
    </div>
  )
}
