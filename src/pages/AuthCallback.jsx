import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiLoader } = FiIcons;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get tokens from URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (!accessToken || !refreshToken) {
        throw new Error('Missing authentication tokens');
      }

      // Set the session with the tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) throw error;

      if (type === 'signup') {
        setStatus('success');
        setMessage('Email confirmed successfully! Welcome to MealTracker.');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        // Handle other auth types (password reset, etc.)
        setStatus('success');
        setMessage('Authentication successful!');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Authentication failed. Please try again.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return FiLoader;
      case 'success':
        return FiCheck;
      case 'error':
        return FiX;
      default:
        return FiLoader;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'verifying':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🍽️</span>
          </div>

          {/* Status Icon */}
          <div className={`w-20 h-20 ${getBackgroundColor()} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <SafeIcon 
              icon={getStatusIcon()} 
              className={`w-10 h-10 ${getStatusColor()} ${status === 'verifying' ? 'animate-spin' : ''}`} 
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Progress or Action */}
          {status === 'verifying' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-primary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500"
            >
              Redirecting to dashboard...
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Go to Login
              </button>
              <p className="text-sm text-gray-500">
                Or redirecting automatically in 3 seconds...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;