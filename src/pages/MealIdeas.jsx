import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiUser, FiZap, FiPlus, FiSearch, FiFilter, FiHeart, FiStar, FiChevronDown, FiChevronUp } = FiIcons;

const MealIdeas = () => {
  const { user, useSupabase } = useAuth();
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [activeTab, setActiveTab] = useState('ideas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { value: 'lunch', label: 'Lunch', emoji: '☀️' },
    { value: 'dinner', label: 'Dinner', emoji: '🌙' },
    { value: 'snack', label: 'Snack', emoji: '🍎' }
  ];

  const allMealIdeas = {
    breakfast: [
      {
        id: 1,
        name: 'Greek Yogurt Berry Bowl',
        calories: 180,
        protein: 15,
        carbs: 25,
        fat: 3,
        time: '5 min',
        servings: 1,
        image: '🥣',
        description: 'Creamy Greek yogurt topped with mixed berries and a sprinkle of granola',
        ingredients: ['1 cup Greek yogurt', '1/2 cup mixed berries', '1 tbsp granola', '1 tsp honey'],
        instructions: ['Add yogurt to bowl', 'Top with berries', 'Sprinkle granola', 'Drizzle honey']
      },
      {
        id: 2,
        name: 'Veggie Egg White Scramble',
        calories: 150,
        protein: 20,
        carbs: 8,
        fat: 2,
        time: '8 min',
        servings: 1,
        image: '🍳',
        description: 'Fluffy egg whites with colorful vegetables',
        ingredients: ['4 egg whites', '1/2 cup spinach', '1/4 cup mushrooms', '1/4 cup bell peppers', 'Salt & pepper'],
        instructions: ['Sauté vegetables', 'Add egg whites', 'Scramble gently', 'Season to taste']
      },
      {
        id: 3,
        name: 'Overnight Oats',
        calories: 200,
        protein: 8,
        carbs: 35,
        fat: 4,
        time: '2 min prep',
        servings: 1,
        image: '🥄',
        description: 'Creamy oats soaked overnight with fruits and nuts',
        ingredients: ['1/2 cup oats', '1/2 cup almond milk', '1 tbsp chia seeds', '1/2 banana', '1 tsp almond butter'],
        instructions: ['Mix oats and milk', 'Add chia seeds', 'Refrigerate overnight', 'Top with banana and almond butter']
      },
      {
        id: 4,
        name: 'Avocado Toast',
        calories: 220,
        protein: 6,
        carbs: 24,
        fat: 12,
        time: '5 min',
        servings: 1,
        image: '🥑',
        description: 'Whole grain toast topped with creamy avocado',
        ingredients: ['1 slice whole grain bread', '1/2 avocado', 'Lime juice', 'Salt & pepper', 'Red pepper flakes'],
        instructions: ['Toast bread', 'Mash avocado', 'Spread on toast', 'Season and garnish']
      },
      {
        id: 5,
        name: 'Protein Pancakes',
        calories: 250,
        protein: 22,
        carbs: 20,
        fat: 8,
        time: '10 min',
        servings: 1,
        image: '🥞',
        description: 'Fluffy pancakes packed with protein',
        ingredients: ['1 scoop protein powder', '1 banana', '2 eggs', '1/4 cup oats', '1 tsp vanilla'],
        instructions: ['Blend all ingredients', 'Heat pan', 'Cook pancakes', 'Serve hot']
      },
      {
        id: 6,
        name: 'Chia Pudding',
        calories: 180,
        protein: 6,
        carbs: 18,
        fat: 10,
        time: '5 min prep',
        servings: 1,
        image: '🍮',
        description: 'Creamy chia seed pudding with vanilla',
        ingredients: ['3 tbsp chia seeds', '1 cup almond milk', '1 tsp vanilla', '1 tbsp maple syrup', 'Fresh fruit'],
        instructions: ['Mix chia and milk', 'Add vanilla and syrup', 'Refrigerate 4 hours', 'Top with fruit']
      }
    ],
    lunch: [
      {
        id: 7,
        name: 'Grilled Chicken Salad',
        calories: 280,
        protein: 35,
        carbs: 12,
        fat: 8,
        time: '15 min',
        servings: 1,
        image: '🥗',
        description: 'Fresh mixed greens with lean grilled chicken',
        ingredients: ['4oz grilled chicken', '2 cups mixed greens', '1/2 cucumber', '1/2 cup cherry tomatoes', '2 tbsp balsamic vinaigrette'],
        instructions: ['Grill chicken breast', 'Chop vegetables', 'Arrange on greens', 'Drizzle with dressing']
      },
      {
        id: 8,
        name: 'Quinoa Buddha Bowl',
        calories: 320,
        protein: 12,
        carbs: 45,
        fat: 10,
        time: '20 min',
        servings: 1,
        image: '🍲',
        description: 'Nutritious quinoa bowl with roasted vegetables',
        ingredients: ['3/4 cup cooked quinoa', '1/2 cup roasted sweet potato', '1/2 cup broccoli', '1/4 avocado', '2 tbsp tahini dressing'],
        instructions: ['Cook quinoa', 'Roast vegetables', 'Arrange in bowl', 'Top with avocado and dressing']
      },
      {
        id: 9,
        name: 'Turkey Wrap',
        calories: 250,
        protein: 25,
        carbs: 20,
        fat: 8,
        time: '5 min',
        servings: 1,
        image: '🌯',
        description: 'Lean turkey wrapped in whole wheat tortilla',
        ingredients: ['1 whole wheat tortilla', '4oz sliced turkey', '1/4 cup lettuce', '2 tbsp hummus', '1/4 cup cucumber'],
        instructions: ['Spread hummus on tortilla', 'Add turkey and vegetables', 'Roll tightly', 'Slice in half']
      },
      {
        id: 10,
        name: 'Mediterranean Bowl',
        calories: 340,
        protein: 15,
        carbs: 42,
        fat: 14,
        time: '15 min',
        servings: 1,
        image: '🫒',
        description: 'Mediterranean flavors in a healthy bowl',
        ingredients: ['1/2 cup cooked rice', '1/4 cup chickpeas', '1/4 cup feta cheese', '1/4 cup olives', 'Cucumber', 'Tzatziki'],
        instructions: ['Cook rice', 'Prepare vegetables', 'Arrange in bowl', 'Top with tzatziki']
      },
      {
        id: 11,
        name: 'Tuna Salad Sandwich',
        calories: 290,
        protein: 28,
        carbs: 22,
        fat: 12,
        time: '8 min',
        servings: 1,
        image: '🥪',
        description: 'Classic tuna salad on whole grain bread',
        ingredients: ['1 can tuna', '2 slices whole grain bread', '1 tbsp mayo', 'Celery', 'Red onion', 'Lettuce'],
        instructions: ['Mix tuna with mayo', 'Add diced vegetables', 'Assemble sandwich', 'Slice and serve']
      },
      {
        id: 12,
        name: 'Asian Lettuce Wraps',
        calories: 200,
        protein: 18,
        carbs: 15,
        fat: 8,
        time: '12 min',
        servings: 1,
        image: '🥬',
        description: 'Light and fresh lettuce wraps with Asian flavors',
        ingredients: ['4oz ground chicken', 'Butter lettuce', 'Carrots', 'Bell peppers', 'Soy sauce', 'Sesame oil'],
        instructions: ['Cook ground chicken', 'Sauté vegetables', 'Season with sauces', 'Serve in lettuce cups']
      }
    ],
    dinner: [
      {
        id: 13,
        name: 'Baked Salmon & Asparagus',
        calories: 350,
        protein: 40,
        carbs: 8,
        fat: 18,
        time: '25 min',
        servings: 1,
        image: '🐟',
        description: 'Omega-3 rich salmon with tender asparagus',
        ingredients: ['5oz salmon fillet', '1 cup asparagus', '1 tbsp olive oil', '1 lemon', 'Herbs & spices'],
        instructions: ['Preheat oven to 400°F', 'Season salmon and asparagus', 'Bake for 15-20 minutes', 'Serve with lemon']
      },
      {
        id: 14,
        name: 'Zucchini Noodles with Chicken',
        calories: 220,
        protein: 30,
        carbs: 10,
        fat: 6,
        time: '15 min',
        servings: 1,
        image: '🍝',
        description: 'Low-carb zucchini noodles with seasoned chicken',
        ingredients: ['2 medium zucchini', '4oz chicken breast', '1/2 cup cherry tomatoes', '2 tbsp pesto', 'Parmesan cheese'],
        instructions: ['Spiralize zucchini', 'Cook chicken', 'Sauté tomatoes', 'Toss with pesto and cheese']
      },
      {
        id: 15,
        name: 'Cauliflower Rice Stir-Fry',
        calories: 180,
        protein: 8,
        carbs: 15,
        fat: 8,
        time: '12 min',
        servings: 1,
        image: '🍚',
        description: 'Colorful vegetable stir-fry with cauliflower rice',
        ingredients: ['1 cup cauliflower rice', '1/2 cup mixed vegetables', '1 egg', '1 tbsp soy sauce', '1 tsp sesame oil'],
        instructions: ['Heat oil in pan', 'Stir-fry vegetables', 'Add cauliflower rice', 'Scramble egg and mix']
      },
      {
        id: 16,
        name: 'Beef and Broccoli',
        calories: 320,
        protein: 35,
        carbs: 12,
        fat: 15,
        time: '18 min',
        servings: 1,
        image: '🥩',
        description: 'Classic beef and broccoli stir-fry',
        ingredients: ['4oz lean beef', '1 cup broccoli', 'Garlic', 'Ginger', 'Soy sauce', 'Cornstarch'],
        instructions: ['Marinate beef', 'Stir-fry beef', 'Add broccoli', 'Toss with sauce']
      },
      {
        id: 17,
        name: 'Stuffed Bell Peppers',
        calories: 280,
        protein: 22,
        carbs: 20,
        fat: 12,
        time: '35 min',
        servings: 1,
        image: '🫑',
        description: 'Bell peppers stuffed with lean ground turkey',
        ingredients: ['2 bell peppers', '3oz ground turkey', '1/4 cup quinoa', 'Onion', 'Tomato sauce', 'Cheese'],
        instructions: ['Hollow out peppers', 'Cook turkey and quinoa', 'Stuff peppers', 'Bake until tender']
      },
      {
        id: 18,
        name: 'Lemon Herb Chicken',
        calories: 300,
        protein: 38,
        carbs: 5,
        fat: 14,
        time: '20 min',
        servings: 1,
        image: '🍗',
        description: 'Juicy chicken breast with fresh herbs and lemon',
        ingredients: ['5oz chicken breast', 'Fresh herbs', 'Lemon', 'Olive oil', 'Garlic', 'Green beans'],
        instructions: ['Season chicken', 'Sear in pan', 'Add herbs and lemon', 'Serve with green beans']
      }
    ],
    snack: [
      {
        id: 19,
        name: 'Apple with Almond Butter',
        calories: 160,
        protein: 4,
        carbs: 20,
        fat: 8,
        time: '1 min',
        servings: 1,
        image: '🍎',
        description: 'Crisp apple slices with creamy almond butter',
        ingredients: ['1 medium apple', '1 tbsp almond butter'],
        instructions: ['Slice apple', 'Serve with almond butter for dipping']
      },
      {
        id: 20,
        name: 'Cucumber Hummus Bites',
        calories: 80,
        protein: 3,
        carbs: 8,
        fat: 4,
        time: '3 min',
        servings: 1,
        image: '🥒',
        description: 'Refreshing cucumber rounds topped with hummus',
        ingredients: ['1 cucumber', '3 tbsp hummus', 'Paprika for garnish'],
        instructions: ['Slice cucumber into rounds', 'Top with hummus', 'Sprinkle with paprika']
      },
      {
        id: 21,
        name: 'Protein Smoothie',
        calories: 140,
        protein: 20,
        carbs: 12,
        fat: 2,
        time: '3 min',
        servings: 1,
        image: '🥤',
        description: 'Creamy protein-packed smoothie',
        ingredients: ['1 scoop protein powder', '1 cup unsweetened almond milk', '1/2 frozen banana', '1 cup spinach', 'Ice cubes'],
        instructions: ['Add all ingredients to blender', 'Blend until smooth', 'Pour into glass', 'Enjoy immediately']
      },
      {
        id: 22,
        name: 'Mixed Nuts',
        calories: 170,
        protein: 6,
        carbs: 6,
        fat: 15,
        time: '0 min',
        servings: 1,
        image: '🥜',
        description: 'Healthy mix of almonds, walnuts, and cashews',
        ingredients: ['1oz mixed nuts (almonds, walnuts, cashews)'],
        instructions: ['Portion out nuts', 'Enjoy as is']
      },
      {
        id: 23,
        name: 'Greek Yogurt Parfait',
        calories: 150,
        protein: 12,
        carbs: 18,
        fat: 4,
        time: '5 min',
        servings: 1,
        image: '🥄',
        description: 'Layered yogurt with berries and granola',
        ingredients: ['1/2 cup Greek yogurt', '1/4 cup berries', '1 tbsp granola', '1 tsp honey'],
        instructions: ['Layer yogurt in glass', 'Add berries', 'Top with granola', 'Drizzle honey']
      },
      {
        id: 24,
        name: 'Hard-Boiled Eggs',
        calories: 140,
        protein: 12,
        carbs: 1,
        fat: 10,
        time: '12 min',
        servings: 1,
        image: '🥚',
        description: 'Perfect protein-rich snack',
        ingredients: ['2 large eggs', 'Salt', 'Pepper'],
        instructions: ['Boil water', 'Cook eggs 10-12 minutes', 'Cool in ice water', 'Season and enjoy']
      }
    ]
  };

  useEffect(() => {
    loadFavorites();
  }, [user, useSupabase]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      if (useSupabase) {
        const { data, error } = await supabase
          .from('favorited_meals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFavorites(data || []);
      } else {
        const savedFavorites = localStorage.getItem(`mealTracker_favorites_${user.id}`);
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const addToFavorites = async (meal) => {
    if (!user) return;

    setLoading(true);
    try {
      const favoriteData = {
        user_id: user.id,
        meal_name: meal.name,
        meal_description: meal.description,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        time: meal.time,
        servings: meal.servings,
        image: meal.image,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
        meal_type: selectedMeal,
        created_at: new Date().toISOString()
      };

      if (useSupabase) {
        const { data, error } = await supabase
          .from('favorited_meals')
          .insert([favoriteData])
          .select()
          .single();

        if (error) throw error;
        setFavorites([data, ...favorites]);
      } else {
        const newFavorite = { ...favoriteData, id: Date.now().toString() };
        const updatedFavorites = [newFavorite, ...favorites];
        setFavorites(updatedFavorites);
        localStorage.setItem(`mealTracker_favorites_${user.id}`, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (favoriteId) => {
    if (!user) return;

    try {
      if (useSupabase) {
        const { error } = await supabase
          .from('favorited_meals')
          .delete()
          .eq('id', favoriteId)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
      setFavorites(updatedFavorites);

      if (!useSupabase) {
        localStorage.setItem(`mealTracker_favorites_${user.id}`, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorited = (mealName) => {
    return favorites.some(fav => fav.meal_name === mealName);
  };

  const currentMeals = allMealIdeas[selectedMeal] || [];
  const displayedMeals = showMore ? currentMeals : currentMeals.slice(0, 3);

  const filteredMeals = displayedMeals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFavorites = favorites.filter(fav =>
    fav.meal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.meal_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'ideas', label: 'Ideas', icon: FiZap },
    { id: 'favorites', label: 'Favorites', icon: FiHeart }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Meal Ideas</h2>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'favorites' && favorites.length > 0 && (
                <span className="bg-white text-primary-500 text-xs px-2 py-1 rounded-full">
                  {favorites.length}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'ideas' ? 'meal ideas' : 'favorites'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <>
            {/* Meal Type Filter */}
            <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
              {mealTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMeal(type.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedMeal === type.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{type.emoji}</span>
                  {type.label}
                </motion.button>
              ))}
            </div>

            {/* Meal Ideas List */}
            <div className="space-y-4">
              {filteredMeals.map((meal) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {meal.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{meal.name}</h3>
                        <div className="flex space-x-2">
                          <Link
                            to="/add-meal"
                            state={{ mealIdea: meal }}
                            className="text-primary-500 hover:text-primary-600"
                          >
                            <SafeIcon icon={FiPlus} className="w-5 h-5" />
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToFavorites(meal)}
                            disabled={loading || isFavorited(meal.name)}
                            className={`${
                              isFavorited(meal.name)
                                ? 'text-red-500'
                                : 'text-gray-400 hover:text-red-500'
                            } transition-colors disabled:opacity-50`}
                          >
                            <SafeIcon icon={FiHeart} className={`w-5 h-5 ${isFavorited(meal.name) ? 'fill-current' : ''}`} />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{meal.description}</p>

                      {/* Nutrition Info */}
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-2">
                        <div>
                          <span className="font-medium text-primary-600">{meal.calories}</span>
                          <br />cal
                        </div>
                        <div>
                          <span className="font-medium text-success-600">{meal.protein}g</span>
                          <br />protein
                        </div>
                        <div>
                          <span className="font-medium text-warning-600">{meal.carbs}g</span>
                          <br />carbs
                        </div>
                        <div>
                          <span className="font-medium text-red-600">{meal.fat}g</span>
                          <br />fat
                        </div>
                      </div>

                      {/* Time and Servings */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiClock} className="w-3 h-3" />
                          <span>{meal.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiUser} className="w-3 h-3" />
                          <span>{meal.servings} serving</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Recipe Details */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Ingredients:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {meal.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                        <ol className="text-sm text-gray-600 space-y-1">
                          {meal.instructions.map((step, index) => (
                            <li key={index} className="flex space-x-2">
                              <span className="text-primary-500 font-medium">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Show More Button */}
            {!showMore && currentMeals.length > 3 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMore(true)}
                className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
              >
                <span>Show More Options</span>
                <SafeIcon icon={FiChevronDown} className="w-4 h-4" />
              </motion.button>
            )}

            {/* Show Less Button */}
            {showMore && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMore(false)}
                className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
              >
                <span>Show Less</span>
                <SafeIcon icon={FiChevronUp} className="w-4 h-4" />
              </motion.button>
            )}

            {filteredMeals.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiSearch} className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No meal ideas found</h3>
                <p className="text-gray-600">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {filteredFavorites.length > 0 ? (
              filteredFavorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {favorite.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{favorite.meal_name}</h3>
                        <div className="flex space-x-2">
                          <Link
                            to="/add-meal"
                            state={{ mealIdea: {
                              name: favorite.meal_name,
                              description: favorite.meal_description,
                              calories: favorite.calories,
                              protein: favorite.protein,
                              carbs: favorite.carbs,
                              fat: favorite.fat
                            }}}
                            className="text-primary-500 hover:text-primary-600"
                          >
                            <SafeIcon icon={FiPlus} className="w-5 h-5" />
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromFavorites(favorite.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <SafeIcon icon={FiHeart} className="w-5 h-5 fill-current" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{favorite.meal_description}</p>

                      {/* Nutrition Info */}
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-2">
                        <div>
                          <span className="font-medium text-primary-600">{favorite.calories}</span>
                          <br />cal
                        </div>
                        <div>
                          <span className="font-medium text-success-600">{favorite.protein}g</span>
                          <br />protein
                        </div>
                        <div>
                          <span className="font-medium text-warning-600">{favorite.carbs}g</span>
                          <br />carbs
                        </div>
                        <div>
                          <span className="font-medium text-red-600">{favorite.fat}g</span>
                          <br />fat
                        </div>
                      </div>

                      {/* Time and Servings */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiClock} className="w-3 h-3" />
                          <span>{favorite.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiUser} className="w-3 h-3" />
                          <span>{favorite.servings} serving</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Added {new Date(favorite.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Details for Favorites */}
                  {favorite.ingredients && favorite.instructions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Ingredients:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {favorite.ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                          <ol className="text-sm text-gray-600 space-y-1">
                            {favorite.instructions.map((step, index) => (
                              <li key={index} className="flex space-x-2">
                                <span className="text-primary-500 font-medium">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiHeart} className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No favorites yet</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No favorites match your search' : 'Start adding meal ideas to your favorites'}
                </p>
                {!searchTerm && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('ideas')}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium"
                  >
                    Browse Ideas
                  </motion.button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MealIdeas;