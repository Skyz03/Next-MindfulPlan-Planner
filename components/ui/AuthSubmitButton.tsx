'use client'

import { useFormStatus } from 'react-dom'
import { type ComponentProps, useState, useEffect } from 'react'

type Props = ComponentProps<'button'> & {
  pendingText?: string
}

export function AuthSubmitButton({ children, pendingText = 'Submitting...', ...props }: Props) {
  const { pending } = useFormStatus()
  const [isClicked, setIsClicked] = useState(false)

  // Reset the clicked state when the form submission finishes
  useEffect(() => {
    if (!pending) {
      setIsClicked(false)
    }
  }, [pending])

  return (
    <button
      {...props}
      // 1. Remove manual 'name' or 'value' props to prevent Next.js conflicts
      // 2. Track click locally
      onClick={(e) => {
        setIsClicked(true)
        if (props.onClick) props.onClick(e)
      }}
      disabled={pending}
      className={`relative flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-70 ${props.className}`}
    >
      {/* Only show spinner if the form is pending AND this specific button was clicked */}
      {pending && isClicked ? (
        <>
          <svg
            className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
