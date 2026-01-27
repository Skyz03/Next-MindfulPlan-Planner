'use client'

import { useEffect, useState } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { completeOnboarding } from '@/features/user/actions'
import { useRouter } from 'next/navigation'

export default function OnboardingTour({ hasSeenTour }: { hasSeenTour: boolean }) {
  const router = useRouter()

  // We need to wait for mount to check window size
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (hasSeenTour || !isMounted) return

    const isMobile = window.innerWidth < 768

    // Define steps
    const allSteps = [
      // 1. Welcome (Safe)
      {
        element: '#tour-welcome',
        popover: {
          title: 'Welcome to the Studio',
          description: 'This is your operating system for high-performance work.',
          side: 'bottom',
          align: 'center',
        },
      },
      // 2. Plan Mode (Safe - Header)
      {
        element: '#view-toggle-plan',
        popover: {
          title: 'The Strategy Phase',
          description: 'Switch to **Plan Mode** to see the big picture.',
          side: 'bottom',
          align: 'center',
        },
        onHighlightStarted: () => {
          const btn = document.getElementById('view-toggle-plan')
          if (btn) btn.click()
        },
      },
      // 3. Goals (⚠️ DANGER: HIDDEN ON MOBILE)
      // Only show this step if NOT mobile
      !isMobile
        ? {
            element: '#tour-goals',
            popover: {
              title: '1. Define Rituals',
              description: 'Your strategic goals live here in the sidebar.',
              side: 'right',
              align: 'start',
            },
          }
        : null,

      // 4. Inbox (⚠️ DANGER: HIDDEN ON MOBILE)
      !isMobile
        ? {
            element: '#tour-inbox',
            popover: {
              title: '2. The Inbox',
              description: 'Capture loose thoughts here.',
              side: 'right',
              align: 'start',
            },
          }
        : null,

      // 5. Reflection (Safe - Header/Sidebar top is usually visible or accessible)
      // If reflection link is in sidebar and sidebar is closed, this might fail on mobile too.
      // Let's assume on mobile we skip straight to Focus mode.

      // 6. Focus Mode (Safe - Header)
      {
        element: '#view-toggle-focus',
        popover: {
          title: 'The Execution Phase',
          description: 'Switch to **Focus Mode** to execute.',
          side: 'bottom',
          align: 'center',
        },
        onHighlightStarted: () => {
          const btn = document.getElementById('view-toggle-focus')
          if (btn) btn.click()
        },
      },
      // 7. Time Grid (Safe - Visible in Focus Mode)
      {
        element: '#tour-focus',
        popover: {
          title: '3. Deep Work',
          description: 'This is your daily view. Tasks appear here.',
          side: 'left',
          align: 'start',
        },
      },
    ].filter(Boolean) // Remove nulls

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      popoverClass: 'driver-popover-theme',
      // @ts-ignore - driver.js types might not perfectly match the filter boolean result
      steps: allSteps,
      onDestroyStarted: () => {
        completeOnboarding()
        driverObj.destroy()
      },
    })

    const timer = setTimeout(() => {
      driverObj.drive()
    }, 1500)

    return () => clearTimeout(timer)
  }, [hasSeenTour, isMounted])

  return null
}
