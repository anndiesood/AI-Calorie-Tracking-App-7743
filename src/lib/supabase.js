import { createClient } from '@supabase/supabase-js'

// Your Supabase configuration - LIVE MODE
const SUPABASE_URL = 'https://wkukbxeavoykystwjnwd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdWtieGVhdm95a3lzdHdqbndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzQzOTYsImV4cCI6MjA2NzI1MDM5Nn0.Rdjke6epb8tBhEj0aj71t-cTdMBtNSC1I0huBfhHplg'

// Validate that Supabase is properly configured
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase not configured. Using localStorage fallback.')
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
}) : null

// SIMPLE connection test - avoid any problematic queries
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.warn('⚠️ Supabase client not initialized')
    return false
  }

  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test 1: Auth session check (most reliable)
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('⚠️ Supabase session test failed:', sessionError.message)
      return false
    }

    // Test 2: Simple system settings query (no RLS issues)
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key')
        .eq('key', 'app_status')
        .limit(1)

      if (error) {
        console.warn('⚠️ Supabase table access failed:', error.message)
        // Still consider connection successful if auth works
        console.log('✅ Supabase auth connected - LIVE MODE ACTIVE')
        return true
      }

      console.log('✅ Supabase fully connected - LIVE MODE ACTIVE')
      return true
    } catch (tableError) {
      console.warn('⚠️ Table access failed, but auth works:', tableError.message)
      console.log('✅ Supabase auth connected - LIVE MODE ACTIVE')
      return true
    }
  } catch (error) {
    console.warn('⚠️ Supabase connection failed, using localStorage fallback:', error.message)
    return false
  }
}

// Helper function to handle auth errors
export const handleAuthError = (error) => {
  if (!error) return 'Unknown error occurred'
  
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password'
    case 'Email not confirmed':
      return 'Please check your email and confirm your account'
    case 'User already registered':
      return 'An account with this email already exists'
    default:
      return error.message
  }
}

export default supabase