import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday, startOfWeek, endOfWeek } from 'date-fns';
import { useMeal } from '../context/MealContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrash2, FiEdit, FiFilter, FiSearch } = FiIcons;

const MealHistory = () => {
  const { meals, deleteMeal } = useMeal();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || meal.mealType === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedMeals = filteredMeals.reduce((groups, meal) => {
    const date = new Date(meal.timestamp);
    let dateKey;
    
    if (isToday(date)) {
      dateKey = 'Today';
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(meal);
    return groups;
  }, {});

  const mealTypes = [
    { value: 'all', label: 'All' },
    { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { value: 'lunch', label: 'Lunch', emoji: '☀️' },
    { value: 'dinner', label: 'Dinner', emoji: '🌙' },
    { value: 'snack', label: 'Snack', emoji: '🍎' }
  ];

  const handleDelete = (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      deleteMeal(mealId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }} // Add padding to account for fixed header
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Meal History</h2>
        
        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {mealTypes.map((type) => (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.emoji && <span className="mr-1">{type.emoji}</span>}
                {type.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Meals List */}
        {Object.keys(groupedMeals).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedMeals).map(([dateKey, dayMeals]) => (
              <div key={dateKey}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 sticky top-0 bg-white py-2">
                  {dateKey}
                </h3>
                <div className="space-y-3">
                  {dayMeals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4 relative group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {meal.image ? (
                            <img 
                              src={meal.image} 
                              alt={meal.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-2xl">🍽️</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-800 truncate">{meal.name}</h4>
                            <span className="text-sm text-primary-600 font-medium">
                              {meal.calories} cal
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500">
                              {format(new Date(meal.timestamp), 'h:mm a')}
                            </span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">
                              {meal.mealType}
                            </span>
                          </div>
                          
                          {meal.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {meal.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fat}g</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(meal.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiFilter} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No meals found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Start tracking your meals to see them here'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MealHistory;