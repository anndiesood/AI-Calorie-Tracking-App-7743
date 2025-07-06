// Food Recognition API Utility
// This simulates an AI food recognition service like Google Vision API, Clarifai, or custom models

export class FoodRecognitionAPI {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.foodrecognition.com/v1'; // Example API
  }

  // Main food recognition function
  async recognizeFood(imageData, options = {}) {
    try {
      // For demo purposes, we simulate the API response
      // In production, you would replace this with actual API calls
      return await this.simulateAPICall(imageData, options);
      
      // Real API implementation would look like:
      /*
      const response = await fetch(`${this.baseURL}/recognize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageData,
          include_nutrition: true,
          confidence_threshold: options.minConfidence || 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Food recognition failed:', error);
      throw new Error('Unable to recognize food. Please try manual entry.');
    }
  }

  // Simulate AI food recognition (for demo)
  async simulateAPICall(imageData, options = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Mock food database with realistic nutrition data
    const foodDatabase = [
      {
        name: 'Grilled Chicken Breast',
        category: 'protein',
        description: 'Lean grilled chicken breast with herbs',
        nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        portion: '100g serving',
        confidence: 0.92,
        alternatives: ['Baked Chicken', 'Chicken Fillet', 'Roasted Chicken']
      },
      {
        name: 'Caesar Salad',
        category: 'salad',
        description: 'Mixed greens with Caesar dressing, croutons, and parmesan',
        nutrition: { calories: 320, protein: 8, carbs: 15, fat: 28 },
        portion: '1 medium bowl (200g)',
        confidence: 0.88,
        alternatives: ['Garden Salad', 'Mixed Green Salad', 'Chicken Caesar']
      },
      {
        name: 'Avocado Toast',
        category: 'breakfast',
        description: 'Whole grain bread topped with mashed avocado',
        nutrition: { calories: 220, protein: 6, carbs: 24, fat: 12 },
        portion: '1 slice with 1/2 avocado',
        confidence: 0.95,
        alternatives: ['Avocado on Sourdough', 'Guacamole Toast', 'Avocado Sandwich']
      },
      {
        name: 'Salmon Fillet',
        category: 'fish',
        description: 'Pan-seared Atlantic salmon with lemon',
        nutrition: { calories: 206, protein: 28, carbs: 0, fat: 9 },
        portion: '120g fillet',
        confidence: 0.89,
        alternatives: ['Grilled Salmon', 'Baked Salmon', 'Salmon Steak']
      },
      {
        name: 'Greek Yogurt with Berries',
        category: 'dairy',
        description: 'Plain Greek yogurt topped with mixed berries',
        nutrition: { calories: 150, protein: 15, carbs: 18, fat: 4 },
        portion: '150g yogurt + 50g berries',
        confidence: 0.91,
        alternatives: ['Yogurt Parfait', 'Berry Yogurt Bowl', 'Protein Yogurt']
      },
      {
        name: 'Quinoa Bowl',
        category: 'grain',
        description: 'Quinoa with roasted vegetables and tahini dressing',
        nutrition: { calories: 340, protein: 12, carbs: 45, fat: 12 },
        portion: '1 cup quinoa + vegetables',
        confidence: 0.84,
        alternatives: ['Buddha Bowl', 'Grain Bowl', 'Veggie Quinoa']
      },
      {
        name: 'Spaghetti Bolognese',
        category: 'pasta',
        description: 'Pasta with meat sauce and parmesan cheese',
        nutrition: { calories: 450, protein: 20, carbs: 55, fat: 15 },
        portion: '1 cup pasta + sauce',
        confidence: 0.87,
        alternatives: ['Pasta with Meat Sauce', 'Italian Pasta', 'Spaghetti']
      },
      {
        name: 'Banana Smoothie',
        category: 'beverage',
        description: 'Banana smoothie with milk and protein powder',
        nutrition: { calories: 280, protein: 25, carbs: 35, fat: 5 },
        portion: '300ml smoothie',
        confidence: 0.83,
        alternatives: ['Protein Smoothie', 'Banana Shake', 'Fruit Smoothie']
      },
      {
        name: 'Chocolate Chip Cookie',
        category: 'dessert',
        description: 'Homemade chocolate chip cookie',
        nutrition: { calories: 150, protein: 2, carbs: 20, fat: 7 },
        portion: '1 medium cookie (30g)',
        confidence: 0.94,
        alternatives: ['Chocolate Cookie', 'Chip Cookie', 'Sweet Cookie']
      },
      {
        name: 'Green Smoothie',
        category: 'beverage',
        description: 'Spinach, banana, and fruit smoothie',
        nutrition: { calories: 180, protein: 8, carbs: 35, fat: 2 },
        portion: '250ml smoothie',
        confidence: 0.86,
        alternatives: ['Vegetable Smoothie', 'Spinach Smoothie', 'Health Smoothie']
      }
    ];

    // Simulate image analysis by returning a random food item
    // In real implementation, this would be based on actual AI analysis
    const randomFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
    
    // Add some realistic variation
    const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
    
    return {
      success: true,
      food: {
        name: randomFood.name,
        category: randomFood.category,
        description: randomFood.description,
        calories: Math.round(randomFood.nutrition.calories * variation),
        protein: Math.round(randomFood.nutrition.protein * variation),
        carbs: Math.round(randomFood.nutrition.carbs * variation),
        fat: Math.round(randomFood.nutrition.fat * variation * 10) / 10, // Keep one decimal
        portion: randomFood.portion,
        confidence: randomFood.confidence + (Math.random() - 0.5) * 0.1, // Small confidence variation
        alternatives: randomFood.alternatives,
        detectedIngredients: this.generateIngredients(randomFood.category),
        nutritionSource: 'USDA Food Database',
        imageAnalysis: {
          dominantColors: ['#8B4513', '#228B22', '#FF6347'], // Example colors
          estimatedWeight: Math.round(100 + Math.random() * 200) + 'g',
          plateDetected: Math.random() > 0.3,
          multipleItems: Math.random() > 0.7
        }
      },
      processingTime: Math.round(1000 + Math.random() * 2000), // ms
      apiVersion: '2.1.0'
    };
  }

  // Generate realistic ingredients based on food category
  generateIngredients(category) {
    const ingredientsByCategory = {
      protein: ['chicken breast', 'olive oil', 'salt', 'pepper', 'herbs'],
      salad: ['lettuce', 'tomatoes', 'cucumber', 'dressing', 'croutons'],
      breakfast: ['bread', 'avocado', 'salt', 'lime juice', 'black pepper'],
      fish: ['salmon', 'lemon', 'olive oil', 'herbs', 'garlic'],
      dairy: ['greek yogurt', 'berries', 'honey', 'granola'],
      grain: ['quinoa', 'vegetables', 'tahini', 'olive oil', 'herbs'],
      pasta: ['pasta', 'ground beef', 'tomato sauce', 'onion', 'garlic'],
      beverage: ['banana', 'milk', 'protein powder', 'honey'],
      dessert: ['flour', 'chocolate chips', 'butter', 'sugar', 'eggs']
    };

    return ingredientsByCategory[category] || ['unknown ingredients'];
  }

  // Analyze food from text description
  async analyzeTextDescription(description) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const keywordMap = {
      'chicken': { name: 'Chicken Dish', calories: 250, protein: 30, carbs: 5, fat: 8 },
      'salad': { name: 'Mixed Salad', calories: 150, protein: 5, carbs: 12, fat: 10 },
      'pasta': { name: 'Pasta Dish', calories: 400, protein: 12, carbs: 65, fat: 8 },
      'sandwich': { name: 'Sandwich', calories: 350, protein: 18, carbs: 35, fat: 15 },
      'pizza': { name: 'Pizza Slice', calories: 285, protein: 12, carbs: 36, fat: 10 },
      'burger': { name: 'Hamburger', calories: 540, protein: 25, carbs: 40, fat: 31 },
      'fish': { name: 'Fish Dish', calories: 200, protein: 25, carbs: 0, fat: 8 },
      'rice': { name: 'Rice Bowl', calories: 300, protein: 8, carbs: 60, fat: 2 },
      'soup': { name: 'Soup Bowl', calories: 120, protein: 6, carbs: 15, fat: 4 },
      'smoothie': { name: 'Fruit Smoothie', calories: 200, protein: 10, carbs: 35, fat: 3 }
    };

    const lowerDesc = description.toLowerCase();
    for (const [keyword, nutrition] of Object.entries(keywordMap)) {
      if (lowerDesc.includes(keyword)) {
        return {
          success: true,
          food: {
            ...nutrition,
            description: `${nutrition.name} based on description analysis`,
            confidence: 0.75,
            portion: 'Estimated serving',
            alternatives: [`Different ${nutrition.name}`, `Homemade ${nutrition.name}`],
            source: 'text_analysis'
          }
        };
      }
    }

    // Fallback for unrecognized descriptions
    return {
      success: true,
      food: {
        name: 'Unknown Food',
        description: 'Could not identify from description',
        calories: 200,
        protein: 10,
        carbs: 25,
        fat: 8,
        confidence: 0.50,
        portion: 'Please verify portion size',
        alternatives: ['Mixed Dish', 'Custom Meal'],
        source: 'fallback'
      }
    };
  }

  // Get nutrition facts for known foods
  async getNutritionFacts(foodName) {
    // This would connect to nutrition databases like USDA, Nutritionix, etc.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      nutrition: {
        detailed: true,
        vitamins: { A: 15, C: 25, D: 5, E: 10 }, // % daily value
        minerals: { iron: 8, calcium: 12, potassium: 18 },
        fiber: 3.5,
        sugar: 8.2,
        sodium: 145, // mg
        cholesterol: 25 // mg
      }
    };
  }
}

// Create singleton instance
export const foodRecognitionAPI = new FoodRecognitionAPI();

// Helper functions for integration
export const recognizeFood = (imageData, options) => {
  return foodRecognitionAPI.recognizeFood(imageData, options);
};

export const analyzeDescription = (description) => {
  return foodRecognitionAPI.analyzeTextDescription(description);
};

export const getNutritionFacts = (foodName) => {
  return foodRecognitionAPI.getNutritionFacts(foodName);
};

export default FoodRecognitionAPI;