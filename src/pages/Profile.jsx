import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiCamera, FiSave, FiEdit, FiLogOut, FiTarget, FiShield } = FiIcons;

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    activityLevel: user?.activityLevel || 'moderate',
    goal: user?.goal || 'maintain',
    targetWeight: user?.targetWeight || user?.weight || '',
    targetDate: user?.targetDate || ''
  });

  const calculateDailyGoal = () => {
    const { age, weight, height, activityLevel, goal } = formData;
    
    if (!age || !weight || !height) return user?.dailyGoal || 2000;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    const tdee = bmr * activityMultipliers[activityLevel];
    
    // Goal adjustments
    const goalAdjustments = {
      lose: -500,
      maintain: 0,
      gain: 500
    };
    
    return Math.round(tdee + goalAdjustments[goal]);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateUser({ profilePhoto: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const dailyGoal = calculateDailyGoal();
    updateUser({
      ...formData,
      age: Number(formData.age),
      weight: Number(formData.weight),
      height: Number(formData.height),
      targetWeight: Number(formData.targetWeight),
      dailyGoal
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setIsLoggingOut(true);
      try {
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        logout();
      } catch (error) {
        console.error('Logout error:', error);
        setIsLoggingOut(false);
      }
    }
  };

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Very hard exercise, physical job' }
  ];

  const goals = [
    { value: 'lose', label: 'Lose Weight', emoji: '📉' },
    { value: 'maintain', label: 'Maintain Weight', emoji: '⚖️' },
    { value: 'gain', label: 'Gain Weight', emoji: '📈' }
  ];

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      moderator: { label: 'Moderator', color: 'bg-yellow-100 text-yellow-800' },
      user: { label: 'User', color: 'bg-green-100 text-green-800' }
    };
    return badges[role] || badges.user;
  };

  const calculateBMI = () => {
    const heightInM = formData.height / 100;
    return (formData.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25) return { category: 'Normal', color: 'text-success-500' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-warning-500' };
    return { category: 'Obese', color: 'text-red-500' };
  };

  const getProgressData = () => {
    const currentWeight = Number(formData.weight);
    const targetWeight = Number(formData.targetWeight);
    const startWeight = Number(user?.weight) || currentWeight;
    
    if (formData.goal === 'maintain') return null;
    
    const totalChange = Math.abs(targetWeight - startWeight);
    const currentChange = Math.abs(currentWeight - startWeight);
    const progress = totalChange > 0 ? (currentChange / totalChange) * 100 : 0;
    
    return {
      current: currentWeight,
      target: targetWeight,
      start: startWeight,
      progress: Math.min(progress, 100),
      remaining: Math.abs(targetWeight - currentWeight)
    };
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(bmi);
  const progressData = getProgressData();
  const roleBadge = getRoleBadge(user?.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                isEditing 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SafeIcon icon={isEditing ? FiSave : FiEdit} className="w-4 h-4" />
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <SafeIcon icon={FiLogOut} className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </motion.button>
          </div>
        </div>

        {/* Profile Photo */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mx-auto mb-3">
              {user?.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <SafeIcon icon={FiUser} className="w-12 h-12 text-primary-500" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
              <SafeIcon icon={FiCamera} className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{user?.name}</h3>
          <p className="text-gray-600">{user?.email}</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <p className="text-gray-500 text-sm">{user?.age} years old</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
              <SafeIcon icon={FiShield} className="w-3 h-3 mr-1" />
              {roleBadge.label}
            </span>
          </div>
        </div>

        {/* Weight Progress */}
        {progressData && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-primary-800">Weight Progress</h4>
              <SafeIcon icon={FiTarget} className="w-5 h-5 text-primary-600" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-lg font-bold text-primary-600">{progressData.current}kg</div>
                <div className="text-xs text-primary-700">Current</div>
              </div>
              <div>
                <div className="text-lg font-bold text-success-600">{progressData.target}kg</div>
                <div className="text-xs text-success-700">Target</div>
              </div>
              <div>
                <div className="text-lg font-bold text-warning-600">{progressData.remaining}kg</div>
                <div className="text-xs text-warning-700">Remaining</div>
              </div>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <motion.div
                className="bg-primary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressData.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-primary-600 font-medium">{Math.round(progressData.progress)}% Complete</span>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.name}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.age}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.weight} kg</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.height} cm</div>
            )}
          </div>

          {/* BMI Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">BMI</h4>
                <p className="text-2xl font-bold text-gray-800">{bmi}</p>
              </div>
              <div className="text-right">
                <div className={`font-medium ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </div>
                <div className="text-sm text-gray-600">Body Mass Index</div>
              </div>
            </div>
          </div>

          {/* Goal Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal
            </label>
            {isEditing ? (
              <div className="grid grid-cols-1 gap-2">
                {goals.map((goal) => (
                  <motion.button
                    key={goal.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, goal: goal.value })}
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      formData.goal === goal.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{goal.emoji}</span>
                    {goal.label}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-lg mr-2">
                  {goals.find(g => g.value === formData.goal)?.emoji}
                </span>
                {goals.find(g => g.value === formData.goal)?.label}
              </div>
            )}
          </div>

          {/* Weight Goal Section */}
          {formData.goal !== 'maintain' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Weight (kg)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.targetWeight} kg</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date (Optional)
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    min={getMinDate()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {formData.targetDate ? new Date(formData.targetDate).toLocaleDateString() : 'Not set'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Level
            </label>
            {isEditing ? (
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">
                  {activityLevels.find(l => l.value === formData.activityLevel)?.label}
                </div>
                <div className="text-sm text-gray-600">
                  {activityLevels.find(l => l.value === formData.activityLevel)?.description}
                </div>
              </div>
            )}
          </div>

          {/* Daily Calorie Goal */}
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary-800">Daily Calorie Goal</h4>
                <p className="text-2xl font-bold text-primary-600">
                  {isEditing ? calculateDailyGoal().toLocaleString() : (user?.dailyGoal || 2000).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-primary-600">
                  {isEditing && formData.age && formData.weight && formData.height ? 'Updated based on your changes' : 'Current goal'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;