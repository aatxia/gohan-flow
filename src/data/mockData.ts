// GohanFlow Mock Data - Comprehensive meal, recipe, and health data

export interface Ingredient {
  name: string;
  quantity: string;
  price: number;
  unit?: string;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  price: number;
  ingredients: Ingredient[];
  prepTime: number;
  tags: string[];
  image?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  price: number;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  authorId: string;
  authorName: string;
  likes: number;
  comments: RecipeComment[];
  status: 'published' | 'pending' | 'draft';
  createdAt: string;
}

export interface RecipeComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: 'produce' | 'dairy' | 'meat' | 'grains' | 'pantry' | 'frozen' | 'other';
  checked: boolean;
  owned: boolean;
}

export interface HealthData {
  vitaminD?: number;
  vitaminB12?: number;
  iron?: number;
  bloodSugar?: number;
  cholesterol?: number;
  hemoglobin?: number;
}

export interface Notification {
  id: string;
  type: 'shopping' | 'meal' | 'health' | 'recipe' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  dietaryPreference: string;
  calorieGoal: number;
  budgetDaily: number;
  budgetPeriod: 'daily' | 'weekly' | 'monthly';
  mealsPerDay: number;
  allergies: string[];
  healthData: HealthData;
}

// Comprehensive meal database
export const MEALS: Meal[] = [
  {
    id: 'b1', name: 'Avocado Toast with Eggs', type: 'breakfast',
    calories: 420, protein: 18, carbs: 32, fat: 26, fiber: 8, price: 4.50, prepTime: 15,
    tags: ['vegetarian', 'high-protein'],
    ingredients: [
      { name: 'Whole grain bread', quantity: '2 slices', price: 0.80 },
      { name: 'Avocado', quantity: '1/2', price: 1.50 },
      { name: 'Eggs', quantity: '2', price: 0.60 },
      { name: 'Cherry tomatoes', quantity: '50g', price: 0.80 },
      { name: 'Olive oil', quantity: '1 tbsp', price: 0.30 },
    ],
  },
  {
    id: 'b2', name: 'Greek Yogurt Parfait', type: 'breakfast',
    calories: 350, protein: 20, carbs: 45, fat: 10, fiber: 5, price: 3.80, prepTime: 5,
    tags: ['vegetarian', 'quick', 'high-protein'],
    ingredients: [
      { name: 'Greek yogurt', quantity: '200g', price: 1.50 },
      { name: 'Granola', quantity: '50g', price: 0.80 },
      { name: 'Mixed berries', quantity: '100g', price: 1.20 },
      { name: 'Honey', quantity: '1 tbsp', price: 0.30 },
    ],
  },
  {
    id: 'b3', name: 'Overnight Oats', type: 'breakfast',
    calories: 380, protein: 14, carbs: 58, fat: 12, fiber: 10, price: 2.50, prepTime: 5,
    tags: ['vegetarian', 'vegan', 'meal-prep'],
    ingredients: [
      { name: 'Rolled oats', quantity: '80g', price: 0.40 },
      { name: 'Almond milk', quantity: '200ml', price: 0.60 },
      { name: 'Chia seeds', quantity: '1 tbsp', price: 0.40 },
      { name: 'Banana', quantity: '1', price: 0.30 },
      { name: 'Almond butter', quantity: '1 tbsp', price: 0.80 },
    ],
  },
  {
    id: 'b4', name: 'Japanese Rice Bowl', type: 'breakfast',
    calories: 450, protein: 22, carbs: 55, fat: 15, fiber: 4, price: 5.20, prepTime: 20,
    tags: ['high-protein', 'asian'],
    ingredients: [
      { name: 'Japanese rice', quantity: '150g', price: 0.80 },
      { name: 'Natto', quantity: '50g', price: 1.50 },
      { name: 'Egg', quantity: '1', price: 0.30 },
      { name: 'Nori', quantity: '1 sheet', price: 0.40 },
      { name: 'Soy sauce', quantity: '1 tbsp', price: 0.20 },
    ],
  },
  {
    id: 'l1', name: 'Mediterranean Quinoa Bowl', type: 'lunch',
    calories: 520, protein: 22, carbs: 58, fat: 22, fiber: 12, price: 6.50, prepTime: 25,
    tags: ['vegetarian', 'high-fiber'],
    ingredients: [
      { name: 'Quinoa', quantity: '100g', price: 1.20 },
      { name: 'Chickpeas', quantity: '100g', price: 0.80 },
      { name: 'Cucumber', quantity: '100g', price: 0.50 },
      { name: 'Feta cheese', quantity: '50g', price: 1.50 },
      { name: 'Olives', quantity: '30g', price: 0.80 },
      { name: 'Hummus', quantity: '50g', price: 1.00 },
    ],
  },
  {
    id: 'l2', name: 'Grilled Chicken Salad', type: 'lunch',
    calories: 450, protein: 42, carbs: 18, fat: 24, fiber: 6, price: 7.80, prepTime: 20,
    tags: ['high-protein', 'low-carb', 'gluten-free'],
    ingredients: [
      { name: 'Chicken breast', quantity: '200g', price: 3.50 },
      { name: 'Mixed greens', quantity: '100g', price: 1.20 },
      { name: 'Cherry tomatoes', quantity: '80g', price: 0.80 },
      { name: 'Avocado', quantity: '1/2', price: 1.50 },
      { name: 'Olive oil dressing', quantity: '2 tbsp', price: 0.80 },
    ],
  },
  {
    id: 'l3', name: 'Miso Ramen Bowl', type: 'lunch',
    calories: 580, protein: 28, carbs: 65, fat: 22, fiber: 6, price: 8.50, prepTime: 30,
    tags: ['asian', 'comfort-food'],
    ingredients: [
      { name: 'Ramen noodles', quantity: '200g', price: 1.50 },
      { name: 'Miso paste', quantity: '2 tbsp', price: 1.00 },
      { name: 'Pork belly', quantity: '100g', price: 3.00 },
      { name: 'Soft boiled egg', quantity: '1', price: 0.40 },
      { name: 'Green onions', quantity: '30g', price: 0.30 },
    ],
  },
  {
    id: 'l4', name: 'Lentil Soup with Bread', type: 'lunch',
    calories: 420, protein: 18, carbs: 62, fat: 10, fiber: 15, price: 4.20, prepTime: 30,
    tags: ['vegan', 'high-fiber', 'budget-friendly'],
    ingredients: [
      { name: 'Red lentils', quantity: '100g', price: 0.80 },
      { name: 'Carrots', quantity: '100g', price: 0.40 },
      { name: 'Onion', quantity: '1', price: 0.30 },
      { name: 'Vegetable broth', quantity: '500ml', price: 0.80 },
      { name: 'Whole grain bread', quantity: '2 slices', price: 0.80 },
    ],
  },
  {
    id: 'd1', name: 'Salmon with Roasted Vegetables', type: 'dinner',
    calories: 580, protein: 45, carbs: 28, fat: 32, fiber: 8, price: 12.50, prepTime: 35,
    tags: ['high-protein', 'omega-3', 'gluten-free'],
    ingredients: [
      { name: 'Salmon fillet', quantity: '200g', price: 7.00 },
      { name: 'Sweet potato', quantity: '150g', price: 0.80 },
      { name: 'Broccoli', quantity: '150g', price: 1.20 },
      { name: 'Lemon', quantity: '1', price: 0.50 },
      { name: 'Herbs & spices', quantity: 'mix', price: 0.50 },
    ],
  },
  {
    id: 'd2', name: 'Chicken Teriyaki Rice', type: 'dinner',
    calories: 650, protein: 40, carbs: 70, fat: 20, fiber: 4, price: 9.00, prepTime: 30,
    tags: ['high-protein', 'asian'],
    ingredients: [
      { name: 'Chicken thigh', quantity: '200g', price: 3.00 },
      { name: 'Japanese rice', quantity: '150g', price: 0.80 },
      { name: 'Teriyaki sauce', quantity: '3 tbsp', price: 1.20 },
      { name: 'Broccoli', quantity: '100g', price: 0.80 },
      { name: 'Sesame seeds', quantity: '1 tbsp', price: 0.30 },
    ],
  },
  {
    id: 'd3', name: 'Buddha Bowl', type: 'dinner',
    calories: 480, protein: 20, carbs: 55, fat: 20, fiber: 14, price: 6.80, prepTime: 30,
    tags: ['vegan', 'balanced', 'colorful'],
    ingredients: [
      { name: 'Brown rice', quantity: '100g', price: 0.60 },
      { name: 'Edamame', quantity: '80g', price: 1.20 },
      { name: 'Roasted chickpeas', quantity: '80g', price: 0.80 },
      { name: 'Kale', quantity: '100g', price: 1.00 },
      { name: 'Tahini dressing', quantity: '2 tbsp', price: 0.80 },
    ],
  },
  {
    id: 'd4', name: 'Beef Stir Fry', type: 'dinner',
    calories: 550, protein: 38, carbs: 45, fat: 25, fiber: 6, price: 10.50, prepTime: 25,
    tags: ['high-protein', 'asian', 'quick'],
    ingredients: [
      { name: 'Beef sirloin', quantity: '200g', price: 5.50 },
      { name: 'Mixed vegetables', quantity: '200g', price: 1.50 },
      { name: 'Jasmine rice', quantity: '100g', price: 0.60 },
      { name: 'Soy sauce', quantity: '2 tbsp', price: 0.40 },
      { name: 'Ginger & garlic', quantity: 'mix', price: 0.50 },
    ],
  },
  {
    id: 's1', name: 'Trail Mix', type: 'snack',
    calories: 180, protein: 6, carbs: 15, fat: 12, fiber: 3, price: 2.00, prepTime: 0,
    tags: ['vegan', 'portable', 'energy'],
    ingredients: [
      { name: 'Mixed nuts', quantity: '30g', price: 1.20 },
      { name: 'Dried fruits', quantity: '20g', price: 0.60 },
      { name: 'Dark chocolate chips', quantity: '10g', price: 0.20 },
    ],
  },
  {
    id: 's2', name: 'Apple with Almond Butter', type: 'snack',
    calories: 220, protein: 5, carbs: 28, fat: 12, fiber: 5, price: 1.80, prepTime: 2,
    tags: ['vegan', 'quick', 'satisfying'],
    ingredients: [
      { name: 'Apple', quantity: '1 medium', price: 0.60 },
      { name: 'Almond butter', quantity: '2 tbsp', price: 1.20 },
    ],
  },
  {
    id: 's3', name: 'Edamame', type: 'snack',
    calories: 120, protein: 11, carbs: 10, fat: 5, fiber: 5, price: 2.50, prepTime: 5,
    tags: ['vegan', 'high-protein', 'asian'],
    ingredients: [
      { name: 'Edamame pods', quantity: '150g', price: 2.00 },
      { name: 'Sea salt', quantity: '1 tsp', price: 0.10 },
    ],
  },
];

// Recipe database with community features
export const RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: 'Green Power Smoothie',
    description: 'A nutrient-packed smoothie perfect for starting your day with energy and vitality.',
    type: 'breakfast',
    calories: 280, protein: 8, carbs: 45, fat: 8, fiber: 7, price: 3.50, prepTime: 5, cookTime: 0, servings: 1,
    tags: ['vegan', 'gluten-free', 'quick'],
    ingredients: [
      { name: 'Spinach', quantity: '50g', price: 0.50 },
      { name: 'Banana', quantity: '1', price: 0.30 },
      { name: 'Mango', quantity: '100g', price: 1.00 },
      { name: 'Almond milk', quantity: '250ml', price: 0.80 },
      { name: 'Chia seeds', quantity: '1 tbsp', price: 0.40 },
    ],
    instructions: [
      'Add spinach and almond milk to blender',
      'Add frozen banana and mango chunks',
      'Blend until smooth',
      'Top with chia seeds and serve',
    ],
    authorId: 'system', authorName: 'GohanFlow Team', likes: 234, status: 'published', createdAt: '2024-01-15',
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Sarah M.', content: 'Love this! Perfect for busy mornings.', createdAt: '2024-02-10' },
    ],
  },
  {
    id: 'r2',
    name: 'Teriyaki Salmon Bowl',
    description: 'A delicious Japanese-inspired bowl with glazed salmon and fresh vegetables.',
    type: 'dinner',
    calories: 620, protein: 42, carbs: 55, fat: 25, fiber: 6, price: 14.00, prepTime: 15, cookTime: 20, servings: 2,
    tags: ['high-protein', 'asian', 'omega-3'],
    ingredients: [
      { name: 'Salmon fillet', quantity: '300g', price: 10.00 },
      { name: 'Japanese rice', quantity: '200g', price: 1.00 },
      { name: 'Teriyaki sauce', quantity: '4 tbsp', price: 1.50 },
      { name: 'Edamame', quantity: '100g', price: 1.50 },
      { name: 'Avocado', quantity: '1', price: 2.00 },
    ],
    instructions: [
      'Cook rice according to package instructions',
      'Marinate salmon in teriyaki sauce for 10 minutes',
      'Pan-sear salmon for 4-5 minutes each side',
      'Arrange rice, salmon, edamame, and sliced avocado in bowls',
      'Drizzle with extra teriyaki sauce',
    ],
    authorId: 'system', authorName: 'GohanFlow Team', likes: 456, status: 'published', createdAt: '2024-01-20',
    comments: [],
  },
  {
    id: 'r3',
    name: 'Mediterranean Chickpea Salad',
    description: 'Fresh and filling salad packed with plant-based protein and Mediterranean flavors.',
    type: 'lunch',
    calories: 420, protein: 18, carbs: 48, fat: 18, fiber: 14, price: 5.50, prepTime: 15, cookTime: 0, servings: 2,
    tags: ['vegan', 'high-fiber', 'budget-friendly'],
    ingredients: [
      { name: 'Chickpeas', quantity: '400g can', price: 1.20 },
      { name: 'Cucumber', quantity: '1', price: 0.60 },
      { name: 'Cherry tomatoes', quantity: '200g', price: 1.50 },
      { name: 'Red onion', quantity: '1/2', price: 0.30 },
      { name: 'Olive oil & lemon', quantity: '3 tbsp', price: 1.00 },
    ],
    instructions: [
      'Drain and rinse chickpeas',
      'Dice cucumber, halve tomatoes, slice onion',
      'Combine all vegetables in a large bowl',
      'Dress with olive oil and lemon juice',
      'Season with salt, pepper, and oregano',
    ],
    authorId: 'u2', authorName: 'Maria G.', likes: 189, status: 'published', createdAt: '2024-02-05',
    comments: [],
  },
];

// Dietary preferences
export const DIETARY_PREFERENCES = [
  { id: 'none', label: 'No restrictions', description: 'Include all meal types' },
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'gluten-free', label: 'Gluten-free', description: 'No gluten-containing ingredients' },
  { id: 'dairy-free', label: 'Dairy-free', description: 'No dairy products' },
  { id: 'low-carb', label: 'Low-carb', description: 'Reduced carbohydrate meals' },
  { id: 'high-protein', label: 'High-protein', description: 'Protein-focused meals' },
  { id: 'keto', label: 'Keto', description: 'Very low carb, high fat' },
];

// Calorie goal presets
export const CALORIE_GOALS = [
  { id: 'lose', label: 'Weight Loss', calories: 1500, description: '1,500 cal/day' },
  { id: 'maintain', label: 'Maintenance', calories: 2000, description: '2,000 cal/day' },
  { id: 'gain', label: 'Muscle Gain', calories: 2500, description: '2,500 cal/day' },
  { id: 'custom', label: 'Custom', calories: 0, description: 'Set your own goal' },
];

// WHO-inspired health recommendations
export const HEALTH_RECOMMENDATIONS = {
  vitaminD: {
    low: { threshold: 20, message: 'Consider foods rich in Vitamin D like fatty fish, egg yolks, and fortified foods. Sun exposure also helps.' },
    normal: { threshold: 50, message: 'Your Vitamin D levels are within healthy range. Maintain with regular sun exposure and dietary sources.' },
  },
  vitaminB12: {
    low: { threshold: 200, message: 'Include more B12-rich foods like meat, fish, eggs, or fortified plant milks if vegan.' },
    normal: { threshold: 900, message: 'B12 levels are healthy. Continue with your current diet.' },
  },
  iron: {
    low: { threshold: 12, message: 'Increase iron intake with lean meats, beans, spinach, and vitamin C to aid absorption.' },
    normal: { threshold: 150, message: 'Iron levels are optimal. Maintain balanced intake.' },
  },
  bloodSugar: {
    low: { threshold: 70, message: 'Blood sugar may be low. Consider regular, balanced meals with complex carbohydrates.' },
    high: { threshold: 100, message: 'Monitor blood sugar levels. Focus on whole grains, fiber, and limit refined sugars.' },
  },
};

// Sample notifications
export const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'meal', title: 'Lunch Reminder', message: 'Time for your Mediterranean Quinoa Bowl!', read: false, createdAt: new Date().toISOString() },
  { id: 'n2', type: 'shopping', title: 'Shopping List Ready', message: 'Your weekly shopping list has been generated.', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n3', type: 'health', title: 'Health Tip', message: 'Consider adding more leafy greens for iron intake.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

// Helper functions
export const filterMealsByPreference = (meals: Meal[], preference: string): Meal[] => {
  if (preference === 'none') return meals;
  return meals.filter(meal => meal.tags.includes(preference));
};

export const getMealsByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal[] => {
  return MEALS.filter(meal => meal.type === type);
};

export const calculateDailyNutrition = (meals: Meal[]) => {
  return meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
    fiber: acc.fiber + meal.fiber,
    cost: acc.cost + meal.price,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, cost: 0 });
};
