import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage (Server Components, Server Actions, Route Handlers).
 * 
 * This client automatically handles cookie management for authentication.
 * 
 * @returns A configured Supabase client instance
 * @throws {Error} If required environment variables are missing
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
        throw new Error(
            'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
        )
    }

    if (!supabaseAnonKey) {
        throw new Error(
            'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY'
        )
    }

    const cookieStore = cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.then((store) => store.getAll())
            },
            setAll(cookiesToSet) {
                cookieStore
                    .then((store) => {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            store.set(name, value, options)
                        )
                    })
                    .catch((error) => {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                        if (process.env.NODE_ENV === 'development') {
                            console.warn(
                                'Failed to set cookies in Server Component:',
                                error
                            )
                        }
                    })
            },
        },
    })
}