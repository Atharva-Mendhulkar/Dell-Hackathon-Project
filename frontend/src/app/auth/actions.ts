'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // To prevent errors when Supabase is not configured yet:
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing login for demo")
    return redirect('/participant/dashboard')
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/auth/participant?mode=signin&error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/participant/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing signup for demo")
    return redirect('/onboarding/participant')
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    // If they already exist, try to log them in automatically to keep the flow smooth
    if (error.message.includes("User already registered") || error.message.includes("already registered")) {
      const { error: loginError } = await supabase.auth.signInWithPassword(data);
      if (!loginError) {
        revalidatePath('/', 'layout');
        return redirect('/onboarding/participant');
      }
    }
    return redirect('/auth/participant?mode=signup&error=' + encodeURIComponent(error.message))
  }

  // Pass email in URL to onboarding so it can be picked up even if session is delayed
  revalidatePath('/', 'layout')
  redirect(`/onboarding/participant?email=${encodeURIComponent(data.email)}`)
}

export async function loginOrganizer(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing login for demo")
    return redirect('/organizer/dashboard')
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/auth/organizer?mode=signin&error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/organizer/dashboard')
}

export async function signupOrganizer(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing signup for demo")
    return redirect('/organizer/dashboard')
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        organization_name: formData.get('organization_name'),
        role: 'organizer',
      }
    }
  })

  if (error) {
    if (error.message.includes("User already registered") || error.message.includes("already registered")) {
      const { error: loginError } = await supabase.auth.signInWithPassword(data);
      if (!loginError) {
        revalidatePath('/', 'layout');
        return redirect('/organizer/dashboard');
      }
    }
    return redirect('/auth/organizer?mode=signup&error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/organizer/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return redirect('/')
  }
  
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
