'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=Invalid credentials. Please try again.')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Important: Sign out any current session before signing up
  await supabase.auth.signOut()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    // Handle "User already exists" specifically if Supabase exposes it
    // (Note: Supabase sometimes hides this for security, but if it returns an error:)
    if (error.message.includes('already registered') || error.status === 400) {
      return redirect('/login?message=User already exists. Please log in.')
    }
    return redirect('/login?error=Could not create user. Try again.')
  }

  // ✅ CHANGE: Instead of dashboard, send them back to login with a success popup
  // If email confirmation is required by your Supabase settings:
  if (data?.session === null) {
    return redirect('/login?success=Account created! Please check your email to confirm.')
  }

  // If auto-confirm is on, just ask them to login
  return redirect('/login?success=Signup complete! Please log in.')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}