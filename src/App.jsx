import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { MealProvider } from './context/MealContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import SupabaseStatus from './components/SupabaseStatus';
import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';
import MealIdeas from './pages/MealIdeas';
import MealHistory from './pages/MealHistory';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">MealTracker</h1>
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <MealProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Header />
                  <SupabaseStatus />
                  <main className="pb-20">
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/add-meal" element={<AddMeal />} />
                        <Route path="/meal-ideas" element={<MealIdeas />} />
                        <Route path="/history" element={<MealHistory />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/admin" element={<AdminPanel />} />
                      </Routes>
                    </AnimatePresence>
                  </main>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </MealProvider>
    </AuthProvider>
  );
}

export default App;