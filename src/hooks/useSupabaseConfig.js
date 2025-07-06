import { useState, useEffect } from 'react';
import { getSupabaseConfig, SUPABASE_CONFIG } from '../utils/supabaseConfig';

export const useSupabaseConfig = () => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const currentConfig = getSupabaseConfig();
      setConfig(currentConfig);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateConfig = (newConfig) => {
    const errors = [];

    if (!SUPABASE_CONFIG.validateUrl(newConfig.url)) {
      errors.push('Invalid Supabase URL format');
    }

    if (!SUPABASE_CONFIG.validateAnonKey(newConfig.anonKey)) {
      errors.push('Invalid anonymous key format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const updateConfig = (newConfig) => {
    const validation = validateConfig(newConfig);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // In a real application, this would make an API call to update the configuration
    // For now, we'll just update the local state and provide instructions
    setConfig({ ...newConfig, source: 'updated' });

    return {
      success: true,
      message: 'Configuration updated locally. Manual file update required for persistence.',
      instructions: {
        file: 'src/lib/supabase.js',
        changes: [
          `SUPABASE_URL = '${newConfig.url}'`,
          `SUPABASE_ANON_KEY = '${newConfig.anonKey}'`
        ]
      }
    };
  };

  return {
    config,
    isLoading,
    error,
    validateConfig,
    updateConfig,
    refreshConfig: () => {
      setIsLoading(true);
      const refreshedConfig = getSupabaseConfig();
      setConfig(refreshedConfig);
      setIsLoading(false);
    }
  };
};

export default useSupabaseConfig;