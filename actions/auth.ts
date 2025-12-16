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
    // Redirect with error param
    return redirect('/login?error=Invalid credentials. Please try again.')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // 1. Check if user already exists (Optional but helpful for UX)
  // Note: Supabase security settings might hide this, but it's worth a try

  // 2. Perform Signup
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // If you need to redirect to a callback after email confirmation:
      // emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup Error:', error)
    // Handle "User already exists" explicitly
    if (error.status === 400 || error.message.includes('already registered')) {
      return redirect('/login?message=Account already exists. Please log in.')
    }
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // 3. Handle Success State
  // Case A: Email confirmation is required (Session is null)
  if (data?.user && !data.session) {
    return redirect('/login?success=Signup successful! Please check your email to confirm your account, then log in with your credentials.')
  }

  // Case B: Auto-confirm is enabled (Session exists)
  // We STILL redirect to login with a success message to force the "pop up" interaction you requested
  return redirect('/login?success=Account created successfully! Please log in.')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}