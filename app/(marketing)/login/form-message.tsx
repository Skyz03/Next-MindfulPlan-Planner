'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export function FormMessage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get params
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const message = searchParams.get('message') // Neutral/Info messages

  const [isVisible, setIsVisible] = useState(false)

  // Determine type and content
  const type = error ? 'error' : success ? 'success' : message ? 'info' : null
  const content = error || success || message

  useEffect(() => {
    if (content) {
      setIsVisible(true)
      // Optional: Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [content])

  const handleClose = () => {
    setIsVisible(false)
    // Clear URL params without refreshing
    router.replace('/login')
  }

  if (!content || !isVisible) return null

  // Styles based on type
  const styles = {
    error: 'bg-red-500/10 border-red-500/50 text-red-200',
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-200',
  }

  const icons = {
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    info: <AlertCircle className="h-5 w-5 text-blue-400" />,
  }

  return (
    <div
      className={`relative transform overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-500 ease-out ${styles[type!]} ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'} `}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">{icons[type!]}</div>
        <div className="flex-1 text-sm leading-relaxed font-medium">{content}</div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/40 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar animation (optional flair) */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-current opacity-20`}>
        <div className="h-full w-full origin-left animate-[shrink_6s_linear_forwards] bg-current"></div>
      </div>
    </div>
  )
}
