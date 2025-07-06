import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMeal } from '../context/MealContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiUpload, FiZap, FiCheck, FiX, FiEye, FiEdit, FiRefreshCw } = FiIcons;

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
  const [aiResults, setAiResults] = useState(null);
  const [showAiEdit, setShowAiEdit] = useState(false);

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

  // Simulated AI Food Recognition API
  const recognizeFood = async (imageData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock food recognition results based on common foods
    const mockResults = [
      {
        confidence: 0.92,
        name: 'Grilled Chicken Breast',
        description: 'Lean grilled chicken breast with herbs',
        calories: 280,
        protein: 35,
        carbs: 0,
        fat: 12,
        portion: '150g serving',
        alternatives: ['Baked Chicken', 'Chicken Fillet']
      },
      {
        confidence: 0.88,
        name: 'Caesar Salad',
        description: 'Mixed greens with Caesar dressing and croutons',
        calories: 320,
        protein: 8,
        carbs: 15,
        fat: 28,
        portion: '1 medium bowl',
        alternatives: ['Garden Salad', 'Mixed Green Salad']
      },
      {
        confidence: 0.95,
        name: 'Avocado Toast',
        description: 'Whole grain bread topped with mashed avocado',
        calories: 220,
        protein: 6,
        carbs: 24,
        fat: 12,
        portion: '1 slice with 1/2 avocado',
        alternatives: ['Avocado on Sourdough', 'Avocado Sandwich']
      },
      {
        confidence: 0.89,
        name: 'Salmon Fillet',
        description: 'Pan-seared salmon with lemon',
        calories: 350,
        protein: 40,
        carbs: 2,
        fat: 18,
        portion: '150g fillet',
        alternatives: ['Grilled Salmon', 'Baked Salmon']
      },
      {
        confidence: 0.91,
        name: 'Greek Yogurt Bowl',
        description: 'Greek yogurt with berries and granola',
        calories: 180,
        protein: 15,
        carbs: 25,
        fat: 3,
        portion: '1 cup yogurt with toppings',
        alternatives: ['Yogurt Parfait', 'Berry Yogurt']
      }
    ];

    // Return a random result for demo
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    // Add some variation to make it more realistic
    const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
    
    return {
      ...randomResult,
      calories: Math.round(randomResult.calories * variation),
      protein: Math.round(randomResult.protein * variation),
      carbs: Math.round(randomResult.carbs * variation),
      fat: Math.round(randomResult.fat * variation),
      imageData
    };
  };

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
    setAiResults(null);

    try {
      let analysisData;
      
      if (mealData.image) {
        // Use AI image recognition
        analysisData = await recognizeFood(mealData.image);
      } else {
        // Analyze based on description
        analysisData = await analyzeDescription(mealData.description || mealData.name);
      }

      setAiResults(analysisData);
      
      // Auto-fill the meal data with AI results
      setMealData({
        ...mealData,
        name: analysisData.name,
        description: analysisData.description,
        calories: analysisData.calories,
        protein: analysisData.protein,
        carbs: analysisData.carbs,
        fat: analysisData.fat
      });

      setStep(3);
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to manual entry
      setStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDescription = async (description) => {
    // Simulate text-based food analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const textAnalysisResults = {
      'chicken': {
        name: 'Chicken Breast',
        description: 'Lean protein source, likely grilled or baked',
        calories: 250, protein: 30, carbs: 0, fat: 8,
        confidence: 0.85
      },
      'salad': {
        name: 'Mixed Green Salad',
        description: 'Fresh vegetables with dressing',
        calories: 150, protein: 5, carbs: 12, fat: 10,
        confidence: 0.80
      },
      'pasta': {
        name: 'Pasta Dish',
        description: 'Pasta with sauce and toppings',
        calories: 400, protein: 12, carbs: 65, fat: 8,
        confidence: 0.82
      },
      'sandwich': {
        name: 'Sandwich',
        description: 'Bread with filling and condiments',
        calories: 350, protein: 18, carbs: 35, fat: 15,
        confidence: 0.78
      }
    };

    // Find matching food type
    const lowerDesc = description.toLowerCase();
    for (const [key, result] of Object.entries(textAnalysisResults)) {
      if (lowerDesc.includes(key)) {
        return { ...result, portion: 'Estimated serving' };
      }
    }

    // Default fallback
    return {
      name: description || 'Unknown Food',
      description: 'Manual entry required for accurate nutrition',
      calories: 200, protein: 10, carbs: 20, fat: 8,
      confidence: 0.50,
      portion: 'Please verify portion size'
    };
  };

  const retryAnalysis = () => {
    setAiResults(null);
    setShowAiEdit(false);
    analyzeWithAI();
  };

  const selectAlternative = (alternative) => {
    // Simulate selecting an alternative recognition
    const variation = 0.9 + Math.random() * 0.2;
    setMealData({
      ...mealData,
      name: alternative,
      description: `${alternative} - AI recognized`,
      calories: Math.round(aiResults.calories * variation),
      protein: Math.round(aiResults.protein * variation),
      carbs: Math.round(aiResults.carbs * variation),
      fat: Math.round(aiResults.fat * variation)
    });
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
                Upload a photo for AI food recognition or describe your meal
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
                  <p className="text-sm text-gray-500">AI will identify your food automatically</p>
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
                  placeholder="Describe your meal in detail for AI analysis..."
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
                  Continue to AI Analysis
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
                AI Food Recognition
              </h3>
              <p className="text-gray-600">
                {mealData.image ? 'Analyzing your photo...' : 'Analyzing your description...'}
              </p>
            </div>

            {mealData.image && (
              <div className="rounded-lg overflow-hidden">
                <img src={mealData.image} alt="Meal" className="w-full h-48 object-cover" />
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

            {/* AI Analysis Results */}
            {aiResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-green-800">AI Recognition Result</h4>
                    <p className="text-sm text-green-600">
                      Confidence: {Math.round(aiResults.confidence * 100)}%
                    </p>
                  </div>
                  <SafeIcon icon={FiEye} className="w-5 h-5 text-green-600" />
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-gray-800">{aiResults.name}</p>
                  <p className="text-sm text-gray-600">{aiResults.description}</p>
                  <p className="text-sm text-gray-500">Portion: {aiResults.portion}</p>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-primary-600">{aiResults.calories}</div>
                      <div className="text-gray-600">cal</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{aiResults.protein}g</div>
                      <div className="text-gray-600">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-yellow-600">{aiResults.carbs}g</div>
                      <div className="text-gray-600">carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{aiResults.fat}g</div>
                      <div className="text-gray-600">fat</div>
                    </div>
                  </div>
                </div>

                {/* Alternative Suggestions */}
                {aiResults.alternatives && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Other possibilities:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiResults.alternatives.map((alt, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => selectAlternative(alt)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600"
                        >
                          {alt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="space-y-3">
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
                    <span>{mealData.image ? 'Recognizing food...' : 'Analyzing description...'}</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiZap} className="w-5 h-5" />
                    <span>
                      {aiResults ? 'Re-analyze' : (mealData.image ? 'Start AI Recognition' : 'Analyze with AI')}
                    </span>
                  </>
                )}
              </motion.button>

              {aiResults && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={retryAnalysis}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                  <span>Try Different Recognition</span>
                </motion.button>
              )}

              <button
                onClick={() => setStep(3)}
                className="w-full text-gray-600 py-2 text-sm"
              >
                Skip AI and enter manually
              </button>
            </div>
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
                {aiResults ? 'AI analysis complete - adjust if needed' : 'Enter nutritional information'}
              </p>
            </div>

            {/* AI Recognition Badge */}
            {aiResults && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiZap} className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      AI Recognized: {aiResults.name}
                    </span>
                  </div>
                  <span className="text-xs text-green-600">
                    {Math.round(aiResults.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Name
                </label>
                <input
                  type="text"
                  value={mealData.name}
                  onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={mealData.description}
                  onChange={(e) => setMealData({ ...mealData, description: e.target.value })}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
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