// Supabase Configuration Utility
// This file helps manage Supabase configuration programmatically

export const SUPABASE_CONFIG = {
  // Current configuration
  current: {
    url: 'https://wkukbxeavoykystwjnwd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdWtieGVhdm95a3lzdHdqbndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzQzOTYsImV4cCI6MjA2NzI1MDM5Nn0.Rdjke6epb8tBhEj0aj71t-cTdMBtNSC1I0huBfhHplg',
    organizationId: 'wtrsufkohakzyculfkji',
    projectId: 'wkukbxeavoykystwjnwd'
  },

  // Validation functions
  validateUrl: (url) => {
    const pattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
    return pattern.test(url);
  },

  validateAnonKey: (key) => {
    // Basic JWT structure validation
    const parts = key.split('.');
    return parts.length === 3 && key.startsWith('eyJ');
  },

  validateProjectId: (id) => {
    const pattern = /^[a-z0-9]{20}$/;
    return pattern.test(id);
  },

  // Extract project ID from URL
  extractProjectId: (url) => {
    const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    return match ? match[1] : null;
  },

  // Generate configuration object
  generateConfig: (url, anonKey) => {
    const projectId = SUPABASE_CONFIG.extractProjectId(url);
    return {
      url,
      anonKey,
      projectId,
      isValid: SUPABASE_CONFIG.validateUrl(url) && SUPABASE_CONFIG.validateAnonKey(anonKey)
    };
  }
};

// Environment-based configuration
export const getSupabaseConfig = () => {
  // Try to get from environment variables first
  const envUrl = process.env.REACT_APP_SUPABASE_URL;
  const envKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      projectId: SUPABASE_CONFIG.extractProjectId(envUrl),
      source: 'environment'
    };
  }

  // Fallback to hardcoded values
  return {
    ...SUPABASE_CONFIG.current,
    source: 'hardcoded'
  };
};

// Configuration update helper (for development)
export const updateSupabaseConfig = (newConfig) => {
  console.log('🔧 Supabase Configuration Update Required:');
  console.log('');
  console.log('Update the following in src/lib/supabase.js:');
  console.log('');
  console.log(`const SUPABASE_URL = '${newConfig.url}'`);
  console.log(`const SUPABASE_ANON_KEY = '${newConfig.anonKey}'`);
  console.log('');
  console.log('Or set environment variables:');
  console.log('');
  console.log(`REACT_APP_SUPABASE_URL=${newConfig.url}`);
  console.log(`REACT_APP_SUPABASE_ANON_KEY=${newConfig.anonKey}`);
  console.log('');
  console.log('Then restart your development server.');

  return {
    success: false,
    message: 'Manual update required. Check console for instructions.'
  };
};

export default SUPABASE_CONFIG;