import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase, testSupabaseConnection, handleAuthError, initializeSystemSettings } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  useSupabase: false,
  systemSettings: {}
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SUPABASE_STATUS':
      return { ...state, useSupabase: action.payload };
    case 'SET_SYSTEM_SETTINGS':
      return { ...state, systemSettings: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log('🚀 Initializing MealTracker authentication...')
    
    // Test Supabase connection with enhanced retry logic
    let supabaseConnected = false;
    let retries = 3;
    
    while (retries > 0 && !supabaseConnected) {
      supabaseConnected = await testSupabaseConnection();
      if (!supabaseConnected) {
        console.log(`⚠️ Supabase connection failed. Retries left: ${retries - 1}`);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    dispatch({ type: 'SET_SUPABASE_STATUS', payload: supabaseConnected });

    if (supabaseConnected) {
      console.log('✅ LIVE MODE: Using Supabase backend')
      try {
        // Initialize system settings
        await initializeSystemSettings();
        
        // Load system settings
        await loadSystemSettings();
        
        // Initialize Supabase auth session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            dispatch({ type: 'LOGOUT' });
          }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Fall back to localStorage if Supabase fails after connection
        dispatch({ type: 'SET_SUPABASE_STATUS', payload: false });
        initializeLocalStorage();
      }
    } else {
      console.log('⚠️ DEV MODE: Using localStorage fallback')
      initializeLocalStorage();
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const initializeLocalStorage = () => {
    // Fallback to localStorage
    const savedUser = localStorage.getItem('mealTracker_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const userExists = users.find(u => u.id === user.id);
        
        if (userExists) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          localStorage.removeItem('mealTracker_user');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('mealTracker_user');
      }
    }
  };

  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');

      if (error) throw error;

      const settings = {};
      data?.forEach(setting => {
        settings[setting.key] = setting.value;
      });

      dispatch({ type: 'SET_SYSTEM_SETTINGS', payload: settings });
      console.log('✅ System settings loaded:', settings);
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        if (profile.status === 'inactive') {
          await supabase.auth.signOut();
          dispatch({ type: 'SET_ERROR', payload: 'Account is inactive. Please contact administrator.' });
          return;
        }

        if (profile.subscription_status === 'suspended') {
          await supabase.auth.signOut();
          dispatch({ type: 'SET_ERROR', payload: 'Account suspended due to payment issues. Please contact support.' });
          return;
        }

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);

        dispatch({ type: 'LOGIN_SUCCESS', payload: profile });
        console.log('✅ User profile loaded successfully');
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      if (state.useSupabase) {
        console.log('🔐 LIVE MODE: Authenticating with Supabase...')
        // Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        console.log('✅ Supabase authentication successful')
        // Profile will be loaded via onAuthStateChange
        return { success: true };
      } else {
        console.log('🔐 DEV MODE: Authenticating with localStorage...')
        // localStorage fallback - only if no superadmin exists
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        if (user.status === 'inactive') {
          throw new Error('Account is inactive. Please contact administrator.');
        }

        if (user.subscription_status === 'suspended') {
          throw new Error('Account suspended due to payment issues. Please contact support.');
        }
        
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('mealTracker_user', JSON.stringify(userWithoutPassword));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        console.log('✅ localStorage authentication successful')
        return { success: true };
      }
    } catch (error) {
      const errorMessage = handleAuthError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      if (state.useSupabase) {
        console.log('📝 LIVE MODE: Creating account with Supabase...')
        // Supabase signup
        const { data, error } = await supabase.auth.signUp({
          email: userData.email.trim(),
          password: userData.password,
          options: {
            data: {
              name: userData.name
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create user profile
          const newUser = {
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            age: userData.age,
            weight: userData.weight,
            height: userData.height,
            activity_level: userData.activityLevel,
            goal: userData.goal,
            target_weight: userData.targetWeight || userData.weight,
            target_date: userData.targetDate || null,
            daily_goal: userData.dailyGoal,
            role: 'user',
            status: 'active',
            subscription_status: 'free',
            payment_status: 'none',
            subscription_type: 'monthly',
            profile_photo: null,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          };

          const { error: profileError } = await supabase
            .from('users')
            .upsert([newUser]);

          if (profileError) throw profileError;

          dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
          console.log('✅ Supabase account created successfully')
        }

        return { success: true };
      } else {
        console.log('📝 DEV MODE: Creating account with localStorage...')
        // localStorage fallback - only if no superadmin exists
        const superadminExists = await checkSuperadminExists();
        if (superadminExists) {
          throw new Error('Registration is disabled. Please contact administrator.');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        
        if (users.find(u => u.email === userData.email)) {
          throw new Error('Email already exists');
        }
        
        const newUser = {
          id: uuidv4(),
          ...userData,
          role: 'user',
          status: 'active',
          subscription_status: 'free',
          payment_status: 'none',
          subscription_type: 'monthly',
          profilePhoto: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('mealTracker_users', JSON.stringify(users));
        
        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem('mealTracker_user', JSON.stringify(userWithoutPassword));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        console.log('✅ localStorage account created successfully')
        return { success: true };
      }
    } catch (error) {
      const errorMessage = handleAuthError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const createSuperadmin = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      if (state.useSupabase) {
        console.log('👑 LIVE MODE: Creating superadmin with Supabase...')
        // Check if superadmin already exists
        const { data: existingSuperadmin } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'superadmin')
          .limit(1);

        if (existingSuperadmin && existingSuperadmin.length > 0) {
          throw new Error('Superadmin already exists');
        }

        // Create superadmin account
        const { data, error } = await supabase.auth.signUp({
          email: userData.email.trim(),
          password: userData.password,
          options: {
            data: {
              name: userData.name
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create superadmin profile
          const superadminUser = {
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            age: userData.age || 30,
            weight: userData.weight || 70,
            height: userData.height || 175,
            activity_level: 'moderate',
            goal: 'maintain',
            target_weight: userData.weight || 70,
            daily_goal: 2000,
            role: 'superadmin',
            status: 'active',
            subscription_status: 'premium',
            payment_status: 'paid',
            subscription_type: 'lifetime',
            profile_photo: null,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          };

          const { error: profileError } = await supabase
            .from('users')
            .upsert([superadminUser]);

          if (profileError) throw profileError;

          // Update system settings to indicate superadmin exists
          await supabase
            .from('system_settings')
            .update({ value: 'true' })
            .eq('key', 'superadmin_exists');

          await supabase
            .from('system_settings')
            .update({ value: 'false' })
            .eq('key', 'demo_accounts_enabled');

          await loadSystemSettings();
          dispatch({ type: 'LOGIN_SUCCESS', payload: superadminUser });
          console.log('✅ Supabase superadmin created successfully')
        }

        return { success: true };
      } else {
        console.log('👑 DEV MODE: Creating superadmin with localStorage...')
        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        
        // Check if superadmin already exists
        if (users.find(u => u.role === 'superadmin')) {
          throw new Error('Superadmin already exists');
        }

        if (users.find(u => u.email === userData.email)) {
          throw new Error('Email already exists');
        }
        
        const superadminUser = {
          id: uuidv4(),
          ...userData,
          role: 'superadmin',
          status: 'active',
          subscription_status: 'premium',
          payment_status: 'paid',
          subscription_type: 'lifetime',
          profilePhoto: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        users.push(superadminUser);
        localStorage.setItem('mealTracker_users', JSON.stringify(users));
        localStorage.setItem('superadmin_exists', 'true');
        localStorage.setItem('demo_accounts_enabled', 'false');
        
        const { password: _, ...userWithoutPassword } = superadminUser;
        localStorage.setItem('mealTracker_user', JSON.stringify(userWithoutPassword));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        console.log('✅ localStorage superadmin created successfully')
        return { success: true };
      }
    } catch (error) {
      const errorMessage = handleAuthError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const checkSuperadminExists = async () => {
    try {
      if (state.useSupabase) {
        const exists = state.systemSettings?.superadmin_exists === 'true';
        console.log('🔍 Checking superadmin (Supabase):', exists);
        return exists;
      } else {
        const exists = localStorage.getItem('superadmin_exists') === 'true';
        console.log('🔍 Checking superadmin (localStorage):', exists);
        return exists;
      }
    } catch (error) {
      console.error('Error checking superadmin:', error);
      return false;
    }
  };

  const updateUser = async (updates) => {
    try {
      if (state.useSupabase) {
        // Update in Supabase
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', state.user.id);

        if (error) throw error;

        dispatch({ type: 'UPDATE_USER', payload: updates });
      } else {
        // localStorage fallback
        const updatedUser = { ...state.user, ...updates };
        localStorage.setItem('mealTracker_user', JSON.stringify(updatedUser));
        
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const userIndex = users.findIndex(u => u.id === state.user.id);
        
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          localStorage.setItem('mealTracker_users', JSON.stringify(users));
        }
        
        dispatch({ type: 'UPDATE_USER', payload: updates });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
    }
  };

  const suspendUser = async (userId, reason = 'Payment overdue') => {
    if (!hasRole('superadmin')) {
      throw new Error('Only superadmin can suspend users');
    }

    try {
      if (state.useSupabase) {
        const { error } = await supabase.rpc('suspend_user_subscription', {
          target_user_id: userId,
          reason: reason
        });

        if (error) throw error;
      } else {
        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
          users[userIndex].subscription_status = 'suspended';
          users[userIndex].payment_status = 'overdue';
          localStorage.setItem('mealTracker_users', JSON.stringify(users));
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (state.useSupabase) {
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('mealTracker_user');
        if (state.user?.id) {
          localStorage.removeItem(`mealTracker_${state.user.id}`);
        }
      }
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Role-based access control
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasPermission = (permission) => {
    const rolePermissions = {
      superadmin: ['*'], // All permissions
      admin: ['manage_users', 'view_analytics', 'manage_content', 'system_settings'],
      moderator: ['manage_content', 'view_analytics'],
      user: ['view_own_data', 'manage_own_profile']
    };
    
    // Superadmin has all permissions
    if (state.user?.role === 'superadmin') {
      return true;
    }
    
    return rolePermissions[state.user?.role]?.includes(permission) || false;
  };

  const canAccessPremiumFeatures = () => {
    if (!state.user) return false;
    
    // Superadmin and admin always have access
    if (['superadmin', 'admin'].includes(state.user.role)) {
      return true;
    }
    
    // Check subscription status
    if (state.user.subscription_status === 'premium' || state.user.subscription_status === 'free') {
      if (!state.user.subscription_end_date) return true;
      return new Date(state.user.subscription_end_date) > new Date();
    }
    
    return false;
  };

  const value = {
    ...state,
    login,
    signup,
    createSuperadmin,
    checkSuperadminExists,
    updateUser,
    suspendUser,
    logout,
    clearError,
    hasRole,
    hasPermission,
    canAccessPremiumFeatures,
    loadSystemSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}