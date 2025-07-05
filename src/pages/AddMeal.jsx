import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMeal } from '../context/MealContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiUpload, FiZap, FiCheck, FiX } = FiIcons;

const AddMeal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addMeal } = useMeal();
  const [step, setStep] = useState(1);
  const [mealData, setMealData] = useState({
    name: '',
    description: '',
    image: null,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealType: 'breakfast'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pre-fill data if coming from meal ideas
  useEffect(() => {
    if (location.state?.mealIdea) {
      const idea = location.state.mealIdea;
      setMealData({
        name: idea.name,
        description: idea.description,
        image: null,
        calories: idea.calories,
        protein: idea.protein,
        carbs: idea.carbs,
        fat: idea.fat,
        mealType: 'breakfast'
      });
      setStep(3); // Skip to review step
    }
  }, [location.state]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMealData({ ...mealData, image: e.target.result });
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const estimatedCalories = Math.floor(Math.random() * 500) + 200;
    const estimatedProtein = Math.floor(Math.random() * 30) + 10;
    const estimatedCarbs = Math.floor(Math.random() * 50) + 20;
    const estimatedFat = Math.floor(Math.random() * 25) + 5;
    
    setMealData({
      ...mealData,
      calories: estimatedCalories,
      protein: estimatedProtein,
      carbs: estimatedCarbs,
      fat: estimatedFat
    });
    
    setIsAnalyzing(false);
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMeal(mealData);
    navigate('/');
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { value: 'lunch', label: 'Lunch', emoji: '☀️' },
    { value: 'dinner', label: 'Dinner', emoji: '🌙' },
    { value: 'snack', label: 'Snack', emoji: '🍎' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-4 py-6"
      style={{ paddingTop: '80px' }}
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Add New Meal</h2>
            <span className="text-sm text-gray-500">Step {step} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Add a Photo or Description
              </h3>
              <p className="text-gray-600">
                Upload a photo of your meal or describe it for AI analysis
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <SafeIcon icon={FiCamera} className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Take Photo</p>
                  <p className="text-sm text-gray-500">or upload from gallery</p>
                </motion.div>
              </label>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Meal name (e.g., Grilled Chicken Salad)"
                  value={mealData.name}
                  onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  placeholder="Describe your meal in detail..."
                  value={mealData.description}
                  onChange={(e) => setMealData({ ...mealData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  {mealTypes.map((type) => (
                    <motion.button
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMealData({ ...mealData, mealType: type.value })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        mealData.mealType === type.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.emoji}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  disabled={!mealData.name && !mealData.image}
                  className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Let our AI analyze your meal for nutritional information
              </p>
            </div>

            {mealData.image && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={mealData.image}
                  alt="Meal"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">{mealData.name}</h4>
              {mealData.description && (
                <p className="text-gray-600 text-sm">{mealData.description}</p>
              )}
              <div className="mt-2 inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {mealTypes.find(t => t.value === mealData.mealType)?.emoji}{' '}
                {mealTypes.find(t => t.value === mealData.mealType)?.label}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiZap} className="w-5 h-5" />
                  <span>Analyze with AI</span>
                </>
              )}
            </motion.button>

            <button
              onClick={() => setStep(3)}
              className="w-full text-gray-600 py-2 text-sm"
            >
              Skip and enter manually
            </button>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Review & Confirm
              </h3>
              <p className="text-gray-600">
                Adjust the nutritional information if needed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={mealData.calories}
                  onChange={(e) => setMealData({ ...mealData, calories: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={mealData.protein}
                  onChange={(e) => setMealData({ ...mealData, protein: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={mealData.carbs}
                  onChange={(e) => setMealData({ ...mealData, carbs: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={mealData.fat}
                  onChange={(e) => setMealData({ ...mealData, fat: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
                <span>Back</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiCheck} className="w-5 h-5" />
                <span>Save Meal</span>
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default AddMeal;