import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiPlus, FiClock, FiBarChart3, FiUser, FiBookOpen, FiUsers, FiShield } = FiIcons;

const Header = () => {
  const location = useLocation();
  const { hasPermission, hasRole } = useAuth();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/add-meal', icon: FiPlus, label: 'Add Meal' },
    { path: '/meal-ideas', icon: FiBookOpen, label: 'Ideas' },
    { path: '/history', icon: FiClock, label: 'History' },
    { path: '/analytics', icon: FiBarChart3, label: 'Analytics' },
    { path: '/profile', icon: FiUser, label: 'Profile' }
  ];

  // Add admin panel for users with manage_users permission
  if (hasPermission('manage_users')) {
    navItems.push({ path: '/admin', icon: FiUsers, label: 'Admin' });
  }

  // Add superadmin panel for superadmin
  if (hasRole('superadmin')) {
    navItems.push({ path: '/superadmin', icon: FiShield, label: 'Super' });
  }

  return (
    <>
      {/* Top Header - Reduced height */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🍽️</span>
              </div>
              <h1 className="text-lg font-bold text-gray-800">MealTracker</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-2 px-1 rounded-lg transition-colors duration-200"
              >
                <div className="relative">
                  <SafeIcon
                    icon={item.icon}
                    className={`w-5 h-5 ${
                      location.pathname === item.path
                        ? hasRole('superadmin') && item.path === '/superadmin'
                          ? 'text-purple-500'
                          : 'text-primary-500'
                        : 'text-gray-400'
                    }`}
                  />
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                        hasRole('superadmin') && item.path === '/superadmin'
                          ? 'bg-purple-500'
                          : 'bg-primary-500'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    location.pathname === item.path
                      ? hasRole('superadmin') && item.path === '/superadmin'
                        ? 'text-purple-500 font-medium'
                        : 'text-primary-500 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;