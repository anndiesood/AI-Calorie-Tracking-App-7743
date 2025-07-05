import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiShield } = FiIcons;

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError, useSupabase, checkSuperadminExists, systemSettings } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [superadminExists, setSuperadminExists] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      setChecking(true);
      const exists = await checkSuperadminExists();
      setSuperadminExists(exists);
      setChecking(false);
    };

    checkSetup();
  }, [checkSuperadminExists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const demoAccounts = [
    {
      email: 'admin@mealtracker.com',
      password: 'admin123',
      role: 'Admin',
      description: 'Full access to all features including user management'
    },
    {
      email: 'demo@mealtracker.com',
      password: 'demo123',
      role: 'User',
      description: 'Standard user with meal tracking features'
    },
    {
      email: 'mod@mealtracker.com',
      password: 'mod123',
      role: 'Moderator',
      description: 'Content management and analytics access'
    }
  ];

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password });
  };

  // Show superadmin setup if no superadmin exists
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking system setup...</p>
        </div>
      </div>
    );
  }

  if (!superadminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <SafeIcon icon={FiShield} className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">System Setup Required</h1>
            <p className="text-gray-600 mb-6">
              No superadmin account exists. You need to create one to manage the system.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/superadmin-setup')}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiShield} className="w-5 h-5" />
              <span>Create Superadmin Account</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const demoAccountsEnabled = !useSupabase && (!systemSettings?.demo_accounts_enabled || systemSettings.demo_accounts_enabled !== 'false');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your MealTracker account</p>
          </div>

          {/* Storage Status */}
          <div className="mb-6 p-3 rounded-lg bg-gray-50 border">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {useSupabase ? 'Connected to Supabase' : 'Development mode (localStorage)'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <SafeIcon icon={FiLogIn} className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Accounts - Only show if enabled */}
          {demoAccountsEnabled && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Demo Accounts:</p>
              <div className="space-y-2">
                {demoAccounts.map((account, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">{account.role}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            account.role === 'Admin' 
                              ? 'bg-red-100 text-red-800' 
                              : account.role === 'Moderator' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {account.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{account.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {account.email} / {account.password}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin(account.email, account.password)}
                        className="px-3 py-1 text-xs bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sign Up Link - Only show if superadmin exists */}
          {superadminExists && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-500 font-medium hover:text-primary-600">
                  Sign up here
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;