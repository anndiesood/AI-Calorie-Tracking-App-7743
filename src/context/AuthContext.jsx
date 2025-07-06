import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase, testSupabaseConnection, handleAuthError } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  useSupabase: false
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SUPABASE_STATUS':
      return { ...state, useSupabase: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Demo accounts using snake_case consistently
const DEMO_ACCOUNTS = [
  {
    id: 'demo-admin-001',
    email: 'admin@mealtracker.com',
    password: 'admin123',
    name: 'Admin Demo',
    age: 30,
    weight: 75,
    height: 175,
    activity_level: 'moderate',
    goal: 'maintain',
    daily_goal: 2200,
    role: 'admin',
    status: 'active',
    subscription_status: 'premium',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'demo-superadmin-001',
    email: 'superadmin@mealtracker.com',
    password: 'super123',
    name: 'Superadmin Demo',
    age: 35,
    weight: 80,
    height: 180,
    activity_level: 'active',
    goal: 'maintain',
    daily_goal: 2400,
    role: 'superadmin',
    status: 'active',
    subscription_status: 'premium',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'demo-mod-001',
    email: 'mod@mealtracker.com',
    password: 'mod123',
    name: 'Moderator Demo',
    age: 28,
    weight: 68,
    height: 168,
    activity_level: 'active',
    goal: 'lose',
    daily_goal: 1800,
    role: 'moderator',
    status: 'active',
    subscription_status: 'free',
    payment_status: 'none',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'demo-user-001',
    email: 'demo@mealtracker.com',
    password: 'demo123',
    name: 'Demo User',
    age: 25,
    weight: 70,
    height: 170,
    activity_level: 'moderate',
    goal: 'maintain',
    daily_goal: 2000,
    role: 'user',
    status: 'active',
    subscription_status: 'free',
    payment_status: 'none',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  }
];

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  // Helper function to get redirect URL based on environment
  const getRedirectURL = () => {
    // Always use the production domain for redirects
    if (window.location.hostname === 'mindmymeals.com' || 
        window.location.hostname === 'www.mindmymeals.com' ||
        window.location.hostname.includes('netlify.app') ||
        window.location.hostname.includes('vercel.app')) {
      return 'https://www.mindmymeals.com';
    }
    // Only use localhost for actual local development
    return 'http://localhost:3000';
  };

  // Helper function to get the correct login URL
  const getLoginURL = () => {
    // Always redirect to production domain unless actually on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/login';
    }
    return 'https://www.mindmymeals.com/login';
  };

  const initializeAuth = async () => {
    console.log('🚀 Initializing MealTracker authentication...');

    // Test Supabase connection
    let supabaseConnected = false;
    try {
      supabaseConnected = await testSupabaseConnection();
    } catch (error) {
      console.warn('⚠️ Supabase connection failed:', error.message);
      supabaseConnected = false;
    }

    dispatch({ type: 'SET_SUPABASE_STATUS', payload: supabaseConnected });

    if (supabaseConnected) {
      console.log('✅ LIVE MODE: Using Supabase backend');
      try {
        // Initialize Supabase auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state change:', event);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('🔄 Auth state change - loading profile...');
            await loadUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            dispatch({ type: 'LOGOUT' });
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refreshed');
          }
        });
      } catch (error) {
        console.error('Supabase init error:', error);
        dispatch({ type: 'SET_SUPABASE_STATUS', payload: false });
        initializeLocalStorage();
      }
    } else {
      console.log('⚠️ DEV MODE: Using localStorage fallback');
      initializeLocalStorage();
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const initializeLocalStorage = () => {
    // Initialize localStorage with demo accounts
    const existingUsers = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
    
    // Add demo accounts if they don't exist
    let updated = false;
    DEMO_ACCOUNTS.forEach(account => {
      if (!existingUsers.find(u => u.email === account.email)) {
        existingUsers.push(account);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('mealTracker_users', JSON.stringify(existingUsers));
      console.log('✅ Demo accounts initialized in localStorage');
    }

    // Check for saved user session
    const savedUser = localStorage.getItem('mealTracker_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const userExists = existingUsers.find(u => u.id === user.id);
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

  const loadUserProfile = async (userId) => {
    try {
      console.log('🔍 Loading user profile for ID:', userId);
      
      // Try demo accounts first
      const demoUser = DEMO_ACCOUNTS.find(u => u.id === userId);
      if (demoUser) {
        const { password: _, ...userWithoutPassword } = demoUser;
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        console.log('✅ Demo user profile loaded');
        return;
      }

      // Try Supabase with simple error handling
      try {
        console.log('🔍 Querying Supabase for user profile...');
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.warn('Supabase query error:', error);
          throw error;
        }

        if (profile) {
          console.log('✅ User profile loaded from database:', profile);
          
          // Check user status
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

          // Use profile data directly (keeping snake_case from database)
          dispatch({ type: 'LOGIN_SUCCESS', payload: profile });
          console.log('✅ User profile loaded successfully');
          return;
        }

        // No profile found, create one
        console.log('📝 No profile found, creating new profile...');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const newProfile = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            age: authUser.user_metadata?.age || 25,
            weight: authUser.user_metadata?.weight || 70,
            height: authUser.user_metadata?.height || 175,
            activity_level: authUser.user_metadata?.activity_level || 'moderate',
            goal: authUser.user_metadata?.goal || 'maintain',
            daily_goal: authUser.user_metadata?.daily_goal || 2000,
            role: 'user',
            status: 'active',
            subscription_status: 'free',
            payment_status: 'none',
            created_at: new Date().toISOString()
          };

          // Try to insert the profile
          const { data: insertedProfile, error: insertError } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .maybeSingle();

          if (insertError) {
            console.warn('Could not create profile in database:', insertError.message);
            dispatch({ type: 'LOGIN_SUCCESS', payload: newProfile });
            console.log('✅ Using fallback profile');
          } else {
            dispatch({ type: 'LOGIN_SUCCESS', payload: insertedProfile });
            console.log('✅ Created and loaded new profile');
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Create a comprehensive fallback profile
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const fallbackProfile = {
          id: userId,
          email: authUser?.email || 'user@example.com',
          name: authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'User',
          age: authUser?.user_metadata?.age || 25,
          weight: authUser?.user_metadata?.weight || 70,
          height: authUser?.user_metadata?.height || 175,
          activity_level: authUser?.user_metadata?.activity_level || 'moderate',
          goal: authUser?.user_metadata?.goal || 'maintain',
          daily_goal: authUser?.user_metadata?.daily_goal || 2000,
          role: 'user',
          status: 'active',
          subscription_status: 'free',
          payment_status: 'none',
          created_at: new Date().toISOString()
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: fallbackProfile });
        console.log('✅ Using comprehensive fallback profile');
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Final fallback
      const fallbackProfile = {
        id: userId,
        email: 'user@example.com',
        name: 'User',
        age: 25,
        weight: 70,
        height: 175,
        activity_level: 'moderate',
        goal: 'maintain',
        daily_goal: 2000,
        role: 'user',
        status: 'active',
        subscription_status: 'free',
        payment_status: 'none',
        created_at: new Date().toISOString()
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: fallbackProfile });
      console.log('✅ Using minimal fallback profile');
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Always check demo accounts first
      const demoUser = DEMO_ACCOUNTS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        console.log('🎭 Using demo account:', email);
        const { password: _, ...userWithoutPassword } = demoUser;
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        return { success: true };
      }

      if (state.useSupabase) {
        console.log('🔐 LIVE MODE: Authenticating with Supabase...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        console.log('✅ Supabase authentication successful');
        console.log('🔄 Auth state change will load profile...');
        // Profile will be loaded by the auth state change handler
        return { success: true };
      } else {
        console.log('🔐 DEV MODE: Authenticating with localStorage...');
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
        console.log('✅ localStorage authentication successful');
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
        console.log('📝 LIVE MODE: Creating account with Supabase...');
        
        // Use snake_case for database
        const dbUserData = {
          name: userData.name,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
          activity_level: userData.activity_level,
          goal: userData.goal,
          target_weight: userData.target_weight || userData.weight,
          target_date: userData.target_date || null,
          daily_goal: userData.daily_goal
        };

        const { data, error } = await supabase.auth.signUp({
          email: userData.email.trim(),
          password: userData.password,
          options: {
            data: dbUserData,
            emailRedirectTo: `${getRedirectURL()}/auth/callback`
          }
        });

        if (error) throw error;

        if (data.user) {
          console.log('✅ Supabase account created successfully');
          
          // Check if email confirmation is disabled (instant login)
          if (data.session) {
            console.log('✅ Auto-login enabled, user signed in immediately');
            return { success: true };
          } else {
            console.log('📧 Email confirmation required');
            dispatch({ type: 'SET_ERROR', payload: 'Please check your email and click the confirmation link to complete your registration.' });
            return { success: true, requiresConfirmation: true };
          }
        }

        return { success: true };
      } else {
        console.log('📝 DEV MODE: Creating account with localStorage...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        if (users.find(u => u.email === userData.email)) {
          throw new Error('Email already exists');
        }

        // Use snake_case consistently
        const newUser = {
          id: uuidv4(),
          email: userData.email,
          name: userData.name,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
          activity_level: userData.activity_level,
          goal: userData.goal,
          target_weight: userData.target_weight || userData.weight,
          target_date: userData.target_date || null,
          daily_goal: userData.daily_goal,
          role: 'user',
          status: 'active',
          subscription_status: 'free',
          payment_status: 'none',
          subscription_type: 'monthly',
          profile_photo: null,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('mealTracker_users', JSON.stringify(users));

        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem('mealTracker_user', JSON.stringify(userWithoutPassword));
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        console.log('✅ localStorage account created successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = handleAuthError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (updates) => {
    try {
      console.log('🔄 Updating user with:', updates);

      if (state.useSupabase) {
        // All updates should already be in snake_case
        const dbUpdates = { ...updates };
        
        console.log('📝 Database updates:', dbUpdates);

        const { error } = await supabase
          .from('users')
          .update(dbUpdates)
          .eq('id', state.user.id);

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }

        console.log('✅ Database updated successfully');
        dispatch({ type: 'UPDATE_USER', payload: updates });
      } else {
        // For localStorage, use snake_case consistently
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

  const deleteAccount = async () => {
    try {
      console.log('🗑️ Deleting user account:', state.user.id);

      // Check if this is a demo account
      const isDemoAccount = DEMO_ACCOUNTS.some(demo => demo.id === state.user.id);
      if (isDemoAccount) {
        throw new Error('Demo accounts cannot be deleted. This is for demonstration purposes only.');
      }

      if (state.useSupabase) {
        console.log('🗑️ LIVE MODE: Deleting account from Supabase...');
        
        // First delete all user data (meals will be deleted automatically due to CASCADE)
        const { error: deleteUserError } = await supabase
          .from('users')
          .delete()
          .eq('id', state.user.id);

        if (deleteUserError) throw deleteUserError;

        // Delete the auth user (this will also sign them out)
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(state.user.id);
        
        if (deleteAuthError) {
          console.warn('Could not delete auth user (may require admin privileges):', deleteAuthError.message);
          // Continue anyway - the user profile is deleted
        }

        // Sign out the user
        await supabase.auth.signOut();
        
        console.log('✅ Account deleted from Supabase');
      } else {
        console.log('🗑️ DEV MODE: Deleting account from localStorage...');
        
        // Remove user from users array
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const updatedUsers = users.filter(u => u.id !== state.user.id);
        localStorage.setItem('mealTracker_users', JSON.stringify(updatedUsers));

        // Remove user session and their meal data
        localStorage.removeItem('mealTracker_user');
        localStorage.removeItem(`mealTracker_${state.user.id}`);
        localStorage.removeItem(`mealTracker_favorites_${state.user.id}`);
        
        console.log('✅ Account deleted from localStorage');
      }

      // Clear user state
      dispatch({ type: 'LOGOUT' });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      
      if (state.useSupabase) {
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('mealTracker_user');
        if (state.user?.id) {
          localStorage.removeItem(`mealTracker_${state.user.id}`);
        }
      }
      
      // Clear user state
      dispatch({ type: 'LOGOUT' });
      
      // Force redirect to correct domain
      const loginURL = getLoginURL();
      console.log('🔄 Redirecting to:', loginURL);
      
      // Use window.location for hard redirect to ensure correct domain
      if (loginURL.startsWith('https://')) {
        window.location.href = loginURL;
      } else {
        // For local development, use router navigation
        window.location.hash = '#/login';
      }
      
    } catch (error) {
      console.error('Error during logout:', error);
      dispatch({ type: 'LOGOUT' });
      
      // Even if logout fails, redirect to login
      const loginURL = getLoginURL();
      if (loginURL.startsWith('https://')) {
        window.location.href = loginURL;
      } else {
        window.location.hash = '#/login';
      }
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
      superadmin: ['manage_users', 'view_analytics', 'manage_content', 'system_settings', 'suspend_users'],
      admin: ['manage_users', 'view_analytics', 'manage_content', 'system_settings'],
      moderator: ['manage_content', 'view_analytics'],
      user: ['view_own_data', 'manage_own_profile']
    };

    return rolePermissions[state.user?.role]?.includes(permission) || false;
  };

  const canAccessPremiumFeatures = () => {
    if (!state.user) return false;

    if (['superadmin', 'admin'].includes(state.user.role)) {
      return true;
    }

    if (state.user.subscription_status === 'premium' || state.user.subscription_status === 'free') {
      if (!state.user.subscription_end_date) return true;
      return new Date(state.user.subscription_end_date) > new Date();
    }

    return false;
  };

  const suspendUser = async (userId, reason = 'Manual suspension') => {
    try {
      if (state.useSupabase) {
        // Update user status
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: 'suspended',
            payment_status: 'overdue',
            status: 'inactive'
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        // Log the action
        const { error: logError } = await supabase
          .from('subscription_history')
          .insert([{
            user_id: userId,
            action: 'suspended',
            old_status: 'active',
            new_status: 'suspended',
            reason: reason,
            performed_by: state.user.id
          }]);

        if (logError) throw logError;
      } else {
        const users = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex].subscription_status = 'suspended';
          users[userIndex].payment_status = 'overdue';
          users[userIndex].status = 'inactive';
          localStorage.setItem('mealTracker_users', JSON.stringify(users));
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    login,
    signup,
    updateUser,
    deleteAccount,
    logout,
    clearError,
    hasRole,
    hasPermission,
    canAccessPremiumFeatures,
    suspendUser,
    demoAccounts: DEMO_ACCOUNTS
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