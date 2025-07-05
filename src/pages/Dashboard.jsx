import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useMeal } from '../context/MealContext';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTarget, FiTrendingUp, FiClock } = FiIcons;

const Dashboard = () => {
  const { meals, dailyGoal } = useMeal();
  const { user } = useAuth();

  const today = new Date();
  const todayMeals = meals.filter(meal => 
    format(new Date(meal.timestamp), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = dailyGoal - totalCalories;
  const progressPercentage = Math.min((totalCalories / dailyGoal) * 100, 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    {
      label: 'Consumed Today',
      value: totalCalories,
      unit: 'cal',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50'
    },
    {
      label: 'Remaining',
      value: Math.max(remainingCalories, 0),
      unit: 'cal',
      color: 'text-success-500',
      bgColor: 'bg-success-50'
    },
    {
      label: 'Daily Goal',
      value: dailyGoal,
      unit: 'cal',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }} // Add padding to account for fixed header
    >
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
        </h2>
        <p className="text-gray-600">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Progress Circle */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercentage / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-500">of daily goal</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-lg p-3 text-center`}
            >
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{stat.unit}</div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/add-meal">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-primary-500 rounded-xl p-4 text-white text-center shadow-lg"
          >
            <SafeIcon icon={FiPlus} className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold">Add Meal</div>
            <div className="text-sm opacity-90">Log your food</div>
          </motion.div>
        </Link>

        <Link to="/analytics">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200"
          >
            <SafeIcon icon={FiTrendingUp} className="w-8 h-8 mx-auto mb-2 text-success-500" />
            <div className="font-semibold text-gray-800">Analytics</div>
            <div className="text-sm text-gray-600">View progress</div>
          </motion.div>
        </Link>
      </div>

      {/* Recent Meals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Today's Meals</h3>
          <Link to="/history" className="text-primary-500 text-sm font-medium">
            View All
          </Link>
        </div>

        {todayMeals.length > 0 ? (
          <div className="space-y-3">
            {todayMeals.slice(0, 3).map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  {meal.image ? (
                    <img 
                      src={meal.image} 
                      alt={meal.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-lg">🍽️</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{meal.name}</h4>
                  <p className="text-sm text-gray-600">
                    {meal.calories} cal • {format(new Date(meal.timestamp), 'h:mm a')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiClock} className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No meals logged today</p>
            <Link to="/add-meal" className="text-primary-500 text-sm font-medium mt-2 inline-block">
              Add your first meal
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;