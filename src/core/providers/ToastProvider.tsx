'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import Toast from '@/core/ui/Toast'

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 2500)
    return () => window.clearTimeout(timer)
  }, [message])

  const value = useMemo(
    () => ({
      showToast: (text: string) => {
        setMessage(text)
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? <Toast message={message} /> : null}
    </ToastContext.Provider>
  )
}
