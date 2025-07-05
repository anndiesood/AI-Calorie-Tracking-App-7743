import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const MealContext = createContext();

const initialState = {
  meals: [],
  loading: false,
  error: null
};

function mealReducer(state, action) {
  switch (action.type) {
    case 'SET_MEALS':
      return {
        ...state,
        meals: action.payload
      };
    case 'ADD_MEAL':
      return {
        ...state,
        meals: [action.payload, ...state.meals]
      };
    case 'DELETE_MEAL':
      return {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload)
      };
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(meal =>
          meal.id === action.payload.id
            ? { ...meal, ...action.payload.updates }
            : meal
        )
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function MealProvider({ children }) {
  const [state, dispatch] = useReducer(mealReducer, initialState);
  const { user, useSupabase } = useAuth();

  useEffect(() => {
    if (user) {
      loadMeals();
    }
  }, [user, useSupabase]);

  const loadMeals = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (useSupabase) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        dispatch({ type: 'SET_MEALS', payload: data || [] });
      } else {
        // Load from localStorage
        const savedData = localStorage.getItem(`mealTracker_${user.id}`);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            dispatch({ type: 'SET_MEALS', payload: parsedData.meals || [] });
          } catch (error) {
            console.error('Error loading saved data:', error);
            dispatch({ type: 'SET_MEALS', payload: [] });
          }
        } else {
          dispatch({ type: 'SET_MEALS', payload: [] });
        }
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_MEALS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveMealsToStorage = (meals) => {
    if (!user) return;
    try {
      localStorage.setItem(`mealTracker_${user.id}`, JSON.stringify({ meals }));
    } catch (error) {
      console.error('Error saving meals to localStorage:', error);
    }
  };

  const addMeal = async (meal) => {
    if (!user) return;

    try {
      const newMeal = {
        ...meal,
        id: uuidv4(),
        user_id: user.id,
        timestamp: new Date().toISOString()
      };

      if (useSupabase) {
        // Save to Supabase
        const { data, error } = await supabase
          .from('meals')
          .insert([newMeal])
          .select()
          .single();

        if (error) throw error;

        dispatch({ type: 'ADD_MEAL', payload: data });
      } else {
        // Save to localStorage
        dispatch({ type: 'ADD_MEAL', payload: newMeal });
        saveMealsToStorage([newMeal, ...state.meals]);
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add meal' });
    }
  };

  const deleteMeal = async (id) => {
    if (!user) return;

    try {
      if (useSupabase) {
        // Delete from Supabase
        const { error } = await supabase
          .from('meals')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      dispatch({ type: 'DELETE_MEAL', payload: id });

      if (!useSupabase) {
        const updatedMeals = state.meals.filter(meal => meal.id !== id);
        saveMealsToStorage(updatedMeals);
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete meal' });
    }
  };

  const updateMeal = async (id, updates) => {
    if (!user) return;

    try {
      if (useSupabase) {
        // Update in Supabase
        const { error } = await supabase
          .from('meals')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      dispatch({ type: 'UPDATE_MEAL', payload: { id, updates } });

      if (!useSupabase) {
        const updatedMeals = state.meals.map(meal =>
          meal.id === id ? { ...meal, ...updates } : meal
        );
        saveMealsToStorage(updatedMeals);
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update meal' });
    }
  };

  const value = {
    ...state,
    dailyGoal: user?.daily_goal || user?.dailyGoal || 2000,
    userProfile: user ? {
      name: user.name,
      age: user.age,
      weight: user.weight,
      height: user.height,
      activityLevel: user.activity_level || user.activityLevel,
      goal: user.goal
    } : null,
    addMeal,
    deleteMeal,
    updateMeal,
    loadMeals
  };

  return (
    <MealContext.Provider value={value}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeal() {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeal must be used within a MealProvider');
  }
  return context;
}