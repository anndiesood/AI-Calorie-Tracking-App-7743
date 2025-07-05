import { createClient } from '@supabase/supabase-js'

// Your Supabase configuration - LIVE MODE
const SUPABASE_URL = 'https://wkukbxeavoykystwjnwd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdWtieGVhdm95a3lzdHdqbndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzQzOTYsImV4cCI6MjA2NzI1MDM5Nn0.Rdjke6epb8tBhEj0aj71t-cTdMBtNSC1I0huBfhHplg'

// Validate that Supabase is properly configured
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase not configured. Using localStorage fallback.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

// Enhanced connection test with retry logic
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test 1: Check if we can access the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Supabase table access failed:', error.message)
      
      // Test 2: Try to access system_settings table (fallback)
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('count')
        .limit(1)
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.warn('⚠️ Supabase system_settings access failed:', settingsError.message)
        throw settingsError
      }
    }
    
    console.log('✅ Supabase connected successfully - LIVE MODE ACTIVE')
    return true
  } catch (error) {
    console.warn('⚠️ Supabase connection failed, using localStorage fallback:', error.message)
    return false
  }
}

// Initialize system settings if they don't exist
export const initializeSystemSettings = async () => {
  try {
    const settings = [
      { key: 'superadmin_exists', value: 'false', description: 'Whether a superadmin account has been created' },
      { key: 'demo_accounts_enabled', value: 'true', description: 'Whether demo accounts are enabled for testing' },
      { key: 'app_version', value: '1.0.0', description: 'Current application version' },
      { key: 'maintenance_mode', value: 'false', description: 'Whether the app is in maintenance mode' }
    ]

    for (const setting of settings) {
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', setting.key)
        .single()

      if (!existing) {
        await supabase
          .from('system_settings')
          .insert([setting])
      }
    }

    console.log('✅ System settings initialized')
  } catch (error) {
    console.warn('⚠️ Could not initialize system settings:', error.message)
  }
}

// Helper function to handle auth errors
export const handleAuthError = (error) => {
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