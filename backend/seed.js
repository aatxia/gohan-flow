// backend/seed.js
// Скрипт для заповнення бази даних реальними рецептами GohanFlow

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// "Справжні" дані для GohanFlow (японська/азіатська кухня + здорова їжа)
const realRecipes = [
  {
    title: "Teriyaki Chicken Bowl",
    name: "Teriyaki Chicken Bowl",
    description: "A delicious Japanese-inspired bowl with glazed chicken and fresh vegetables.",
    type: "dinner",
    calories: 450,
    protein: 35,
    carbs: 55,
    fat: 12,
    fiber: 4,
    price: 9.50,
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    ingredients: [
      { name: "Chicken breast", quantity: "200g", price: 3.50 },
      { name: "Soy sauce", quantity: "3 tbsp", price: 0.50 },
      { name: "Japanese rice", quantity: "150g", price: 0.80 },
      { name: "Broccoli", quantity: "100g", price: 0.80 },
      { name: "Sesame seeds", quantity: "1 tbsp", price: 0.30 }
    ],
    instructions: [
      "Marinate chicken in teriyaki sauce for 10 minutes",
      "Cook rice according to package instructions",
      "Pan-sear chicken for 4-5 minutes each side",
      "Steam broccoli until tender",
      "Arrange rice, chicken, and broccoli in bowls",
      "Drizzle with extra teriyaki sauce and sprinkle sesame seeds"
    ],
    tags: ["high-protein", "asian", "gluten-free"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Miso Soup with Tofu",
    name: "Miso Soup with Tofu",
    description: "Traditional Japanese soup with fermented soybean paste, tofu, and seaweed.",
    type: "lunch",
    calories: 120,
    protein: 8,
    carbs: 12,
    fat: 4,
    fiber: 2,
    price: 4.20,
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    ingredients: [
      { name: "Miso paste", quantity: "2 tbsp", price: 1.00 },
      { name: "Tofu", quantity: "100g", price: 1.50 },
      { name: "Green onions", quantity: "30g", price: 0.30 },
      { name: "Dashi stock", quantity: "500ml", price: 0.80 },
      { name: "Seaweed (wakame)", quantity: "10g", price: 0.60 }
    ],
    instructions: [
      "Heat dashi stock in a pot (do not boil)",
      "Dissolve miso paste in a small amount of warm stock",
      "Add miso mixture to the pot (still not boiling)",
      "Add cubed tofu and seaweed",
      "Simmer for 2-3 minutes",
      "Garnish with green onions and serve"
    ],
    tags: ["vegan", "vegetarian", "gluten-free", "low-calorie"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Salmon Poke Bowl",
    name: "Salmon Poke Bowl",
    description: "Fresh Hawaiian-style bowl with raw salmon, avocado, and colorful vegetables.",
    type: "dinner",
    calories: 550,
    protein: 40,
    carbs: 45,
    fat: 22,
    fiber: 6,
    price: 14.00,
    prepTime: 20,
    cookTime: 0,
    servings: 2,
    ingredients: [
      { name: "Raw Salmon (sashimi grade)", quantity: "200g", price: 8.00 },
      { name: "Avocado", quantity: "1", price: 2.00 },
      { name: "Japanese rice", quantity: "150g", price: 0.80 },
      { name: "Edamame", quantity: "80g", price: 1.20 },
      { name: "Cucumber", quantity: "100g", price: 0.50 },
      { name: "Soy sauce", quantity: "2 tbsp", price: 0.40 }
    ],
    instructions: [
      "Cook rice and let it cool to room temperature",
      "Cube salmon into bite-sized pieces",
      "Slice avocado and cucumber",
      "Arrange rice in bowls",
      "Top with salmon, avocado, edamame, and cucumber",
      "Drizzle with soy sauce and serve immediately"
    ],
    tags: ["high-protein", "raw", "omega-3", "gluten-free"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Vegetable Stir Fry",
    name: "Vegetable Stir Fry",
    description: "Quick and healthy stir-fried vegetables with Asian flavors.",
    type: "lunch",
    calories: 300,
    protein: 10,
    carbs: 45,
    fat: 8,
    fiber: 8,
    price: 5.50,
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    ingredients: [
      { name: "Bell peppers", quantity: "200g", price: 1.50 },
      { name: "Carrots", quantity: "100g", price: 0.40 },
      { name: "Soy sauce", quantity: "2 tbsp", price: 0.40 },
      { name: "Ginger", quantity: "1 tbsp", price: 0.30 },
      { name: "Garlic", quantity: "2 cloves", price: 0.20 },
      { name: "Sesame oil", quantity: "1 tbsp", price: 0.50 }
    ],
    instructions: [
      "Heat sesame oil in a wok or large pan",
      "Add minced garlic and ginger, stir for 30 seconds",
      "Add sliced bell peppers and carrots",
      "Stir-fry for 5-7 minutes until crisp-tender",
      "Add soy sauce and toss to combine",
      "Serve hot over rice or noodles"
    ],
    tags: ["vegan", "vegetarian", "quick", "high-fiber"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Matcha Oatmeal",
    name: "Matcha Oatmeal",
    description: "Creamy oatmeal infused with matcha green tea, topped with fresh fruits.",
    type: "breakfast",
    calories: 250,
    protein: 12,
    carbs: 45,
    fat: 6,
    fiber: 8,
    price: 4.80,
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    ingredients: [
      { name: "Rolled oats", quantity: "80g", price: 0.40 },
      { name: "Almond milk", quantity: "200ml", price: 0.60 },
      { name: "Matcha powder", quantity: "1 tsp", price: 1.50 },
      { name: "Honey", quantity: "1 tbsp", price: 0.30 },
      { name: "Banana", quantity: "1", price: 0.30 },
      { name: "Berries", quantity: "50g", price: 0.70 }
    ],
    instructions: [
      "Cook oats in almond milk according to package instructions",
      "Whisk matcha powder with a small amount of warm water",
      "Stir matcha mixture into cooked oatmeal",
      "Sweeten with honey",
      "Top with sliced banana and fresh berries",
      "Serve warm"
    ],
    tags: ["vegan", "vegetarian", "antioxidants", "gluten-free"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Ramen Bowl",
    name: "Miso Ramen Bowl",
    description: "Comforting Japanese ramen with miso broth, soft-boiled egg, and pork belly.",
    type: "dinner",
    calories: 580,
    protein: 28,
    carbs: 65,
    fat: 22,
    fiber: 6,
    price: 12.50,
    prepTime: 20,
    cookTime: 25,
    servings: 2,
    ingredients: [
      { name: "Ramen noodles", quantity: "200g", price: 1.50 },
      { name: "Miso paste", quantity: "2 tbsp", price: 1.00 },
      { name: "Pork belly", quantity: "100g", price: 3.00 },
      { name: "Soft boiled egg", quantity: "1", price: 0.40 },
      { name: "Green onions", quantity: "30g", price: 0.30 },
      { name: "Nori", quantity: "1 sheet", price: 0.40 }
    ],
    instructions: [
      "Cook ramen noodles according to package instructions",
      "Prepare miso broth by dissolving miso in hot dashi",
      "Cook pork belly until crispy",
      "Soft-boil egg (6-7 minutes)",
      "Arrange noodles in bowls, pour hot broth",
      "Top with pork belly, egg, green onions, and nori"
    ],
    tags: ["comfort-food", "asian", "high-protein"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Sushi Rolls",
    name: "Vegetable Sushi Rolls",
    description: "Fresh vegetable sushi rolls with avocado, cucumber, and pickled vegetables.",
    type: "lunch",
    calories: 320,
    protein: 8,
    carbs: 55,
    fat: 8,
    fiber: 4,
    price: 8.00,
    prepTime: 30,
    cookTime: 20,
    servings: 4,
    ingredients: [
      { name: "Sushi rice", quantity: "200g", price: 1.20 },
      { name: "Nori sheets", quantity: "4", price: 1.60 },
      { name: "Avocado", quantity: "1", price: 2.00 },
      { name: "Cucumber", quantity: "1", price: 0.50 },
      { name: "Rice vinegar", quantity: "2 tbsp", price: 0.40 },
      { name: "Soy sauce", quantity: "for serving", price: 0.20 }
    ],
    instructions: [
      "Cook sushi rice and season with rice vinegar",
      "Let rice cool to room temperature",
      "Place nori sheet on bamboo mat",
      "Spread rice evenly on nori",
      "Add avocado and cucumber strips",
      "Roll tightly using bamboo mat",
      "Slice into pieces and serve with soy sauce"
    ],
    tags: ["vegan", "vegetarian", "gluten-free"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Chicken Katsu",
    name: "Chicken Katsu",
    description: "Crispy breaded chicken cutlet served with rice and tonkatsu sauce.",
    type: "dinner",
    calories: 520,
    protein: 38,
    carbs: 48,
    fat: 20,
    fiber: 3,
    price: 10.50,
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: "Chicken breast", quantity: "300g", price: 5.25 },
      { name: "Panko breadcrumbs", quantity: "100g", price: 0.80 },
      { name: "Eggs", quantity: "2", price: 0.60 },
      { name: "Flour", quantity: "50g", price: 0.30 },
      { name: "Japanese rice", quantity: "150g", price: 0.80 },
      { name: "Tonkatsu sauce", quantity: "3 tbsp", price: 1.20 }
    ],
    instructions: [
      "Pound chicken breast to even thickness",
      "Dredge in flour, then egg, then panko",
      "Fry in oil until golden and crispy",
      "Cook rice according to package instructions",
      "Slice chicken and serve over rice",
      "Drizzle with tonkatsu sauce"
    ],
    tags: ["high-protein", "asian", "comfort-food"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Onigiri (Rice Balls)",
    name: "Onigiri with Tuna",
    description: "Traditional Japanese rice balls filled with tuna and wrapped in nori.",
    type: "snack",
    calories: 180,
    protein: 8,
    carbs: 35,
    fat: 2,
    fiber: 1,
    price: 3.50,
    prepTime: 15,
    cookTime: 20,
    servings: 3,
    ingredients: [
      { name: "Japanese rice", quantity: "200g", price: 1.00 },
      { name: "Canned tuna", quantity: "100g", price: 1.50 },
      { name: "Nori sheets", quantity: "3", price: 1.20 },
      { name: "Sesame seeds", quantity: "1 tbsp", price: 0.30 }
    ],
    instructions: [
      "Cook rice and let it cool slightly",
      "Mix tuna with a little soy sauce",
      "Wet hands and shape rice into triangles",
      "Make a small indentation and fill with tuna",
      "Wrap with nori sheet",
      "Sprinkle with sesame seeds"
    ],
    tags: ["portable", "asian", "gluten-free"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Bibimbap",
    name: "Korean Bibimbap",
    description: "Colorful Korean rice bowl with vegetables, egg, and gochujang sauce.",
    type: "dinner",
    calories: 480,
    protein: 20,
    carbs: 65,
    fat: 15,
    fiber: 8,
    price: 11.00,
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: "Japanese rice", quantity: "200g", price: 1.00 },
      { name: "Spinach", quantity: "100g", price: 0.80 },
      { name: "Carrots", quantity: "100g", price: 0.40 },
      { name: "Bean sprouts", quantity: "100g", price: 0.60 },
      { name: "Eggs", quantity: "2", price: 0.60 },
      { name: "Gochujang", quantity: "2 tbsp", price: 1.20 },
      { name: "Sesame oil", quantity: "1 tbsp", price: 0.50 }
    ],
    instructions: [
      "Cook rice and set aside",
      "Blanch spinach and season with sesame oil",
      "Julienne carrots and sauté",
      "Cook bean sprouts",
      "Fry eggs sunny-side up",
      "Arrange vegetables over rice",
      "Top with egg and gochujang sauce",
      "Mix before eating"
    ],
    tags: ["korean", "high-fiber", "balanced"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Tofu Scramble",
    name: "Tofu Scramble Breakfast",
    description: "Protein-rich vegan scramble with turmeric, vegetables, and spices.",
    type: "breakfast",
    calories: 220,
    protein: 18,
    carbs: 12,
    fat: 12,
    fiber: 4,
    price: 5.20,
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    ingredients: [
      { name: "Firm tofu", quantity: "300g", price: 2.50 },
      { name: "Turmeric", quantity: "1 tsp", price: 0.30 },
      { name: "Onion", quantity: "50g", price: 0.20 },
      { name: "Bell pepper", quantity: "100g", price: 0.75 },
      { name: "Nutritional yeast", quantity: "1 tbsp", price: 0.40 },
      { name: "Olive oil", quantity: "1 tbsp", price: 0.30 }
    ],
    instructions: [
      "Crumble tofu with hands",
      "Heat oil in pan and sauté onions",
      "Add bell peppers and cook 2 minutes",
      "Add crumbled tofu and turmeric",
      "Cook until golden, stirring frequently",
      "Season with nutritional yeast and spices",
      "Serve hot with toast"
    ],
    tags: ["vegan", "vegetarian", "high-protein", "gluten-free"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Chicken Yakitori",
    name: "Chicken Yakitori Skewers",
    description: "Grilled chicken skewers with sweet and savory teriyaki glaze.",
    type: "dinner",
    calories: 320,
    protein: 32,
    carbs: 18,
    fat: 12,
    fiber: 1,
    price: 8.50,
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: "Chicken thigh", quantity: "300g", price: 4.50 },
      { name: "Soy sauce", quantity: "3 tbsp", price: 0.50 },
      { name: "Mirin", quantity: "2 tbsp", price: 0.60 },
      { name: "Sugar", quantity: "1 tbsp", price: 0.20 },
      { name: "Green onions", quantity: "50g", price: 0.50 },
      { name: "Sesame seeds", quantity: "1 tbsp", price: 0.30 }
    ],
    instructions: [
      "Cut chicken into bite-sized pieces",
      "Thread onto skewers",
      "Mix soy sauce, mirin, and sugar for glaze",
      "Grill skewers, turning frequently",
      "Brush with glaze in last 2 minutes",
      "Garnish with green onions and sesame seeds"
    ],
    tags: ["high-protein", "asian", "grilled"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Seaweed Salad",
    name: "Wakame Seaweed Salad",
    description: "Refreshing Japanese seaweed salad with sesame dressing.",
    type: "snack",
    calories: 45,
    protein: 2,
    carbs: 5,
    fat: 2,
    fiber: 2,
    price: 3.80,
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    ingredients: [
      { name: "Dried wakame", quantity: "20g", price: 1.20 },
      { name: "Rice vinegar", quantity: "2 tbsp", price: 0.40 },
      { name: "Soy sauce", quantity: "1 tbsp", price: 0.20 },
      { name: "Sesame oil", quantity: "1 tsp", price: 0.30 },
      { name: "Sesame seeds", quantity: "1 tbsp", price: 0.30 },
      { name: "Sugar", quantity: "1 tsp", price: 0.10 }
    ],
    instructions: [
      "Soak dried wakame in water for 10 minutes",
      "Drain and squeeze out excess water",
      "Mix vinegar, soy sauce, sesame oil, and sugar",
      "Toss wakame with dressing",
      "Garnish with sesame seeds",
      "Chill before serving"
    ],
    tags: ["vegan", "vegetarian", "low-calorie", "gluten-free"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Tamagoyaki",
    name: "Japanese Rolled Omelette",
    description: "Sweet Japanese rolled omelette, perfect for breakfast or bento.",
    type: "breakfast",
    calories: 180,
    protein: 12,
    carbs: 8,
    fat: 10,
    fiber: 0,
    price: 3.20,
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    ingredients: [
      { name: "Eggs", quantity: "4", price: 1.20 },
      { name: "Sugar", quantity: "1 tbsp", price: 0.20 },
      { name: "Soy sauce", quantity: "1 tsp", price: 0.15 },
      { name: "Mirin", quantity: "1 tsp", price: 0.30 },
      { name: "Oil", quantity: "1 tbsp", price: 0.30 }
    ],
    instructions: [
      "Beat eggs with sugar, soy sauce, and mirin",
      "Heat oil in tamagoyaki pan",
      "Pour thin layer of egg mixture",
      "When set, roll to one side",
      "Add more mixture and roll again",
      "Repeat until all mixture is used",
      "Slice and serve"
    ],
    tags: ["high-protein", "asian", "quick"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Beef Bulgogi",
    name: "Korean Beef Bulgogi",
    description: "Marinated grilled beef with sweet and savory Korean flavors.",
    type: "dinner",
    calories: 420,
    protein: 35,
    carbs: 25,
    fat: 18,
    fiber: 2,
    price: 13.50,
    prepTime: 30,
    cookTime: 10,
    servings: 2,
    ingredients: [
      { name: "Beef sirloin", quantity: "300g", price: 9.00 },
      { name: "Soy sauce", quantity: "3 tbsp", price: 0.50 },
      { name: "Pear", quantity: "50g", price: 0.60 },
      { name: "Garlic", quantity: "3 cloves", price: 0.30 },
      { name: "Ginger", quantity: "1 tbsp", price: 0.30 },
      { name: "Sesame oil", quantity: "1 tbsp", price: 0.50 },
      { name: "Green onions", quantity: "50g", price: 0.50 }
    ],
    instructions: [
      "Slice beef very thinly",
      "Grate pear and mix with soy sauce, garlic, ginger",
      "Marinate beef for at least 30 minutes",
      "Grill or pan-fry until caramelized",
      "Garnish with green onions",
      "Serve with rice and vegetables"
    ],
    tags: ["high-protein", "korean", "marinated"],
    authorId: "system",
    authorName: "GohanFlow Team",
    likes: 0,
    comments: [],
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Поради ВООЗ для бази даних
const whoAdviceData = [
  {
    title: 'Eat Plenty of Vegetables',
    description: 'Aim for at least 400g of fruits and vegetables daily',
    message: 'Include a variety of colorful fruits and vegetables in your daily meals to ensure adequate intake of vitamins, minerals, and fiber.',
    icon: '🥗',
    status: 'active',
    priority: 10,
    dietaryRestrictions: [],
  },
  {
    title: 'Limit Sugar Intake',
    description: 'Keep added sugars below 10% of total energy intake',
    message: 'Reduce consumption of sugary drinks, sweets, and processed foods. Choose natural sources of sweetness like fruits.',
    icon: '🍭',
    status: 'active',
    priority: 9,
    dietaryRestrictions: [],
  },
  {
    title: 'Choose Whole Grains',
    description: 'Replace refined grains with whole grain alternatives',
    message: 'Whole grains provide more fiber, vitamins, and minerals. Include brown rice, whole wheat, oats, and quinoa in your diet.',
    icon: '🌾',
    status: 'active',
    priority: 8,
    dietaryRestrictions: ['gluten-free'],
  },
  {
    title: 'Reduce Salt',
    description: 'Keep sodium intake below 5g per day',
    message: 'Use herbs and spices instead of salt for flavoring. Read food labels to monitor sodium content in processed foods.',
    icon: '🧂',
    status: 'active',
    priority: 7,
    dietaryRestrictions: [],
  },
  {
    title: 'Healthy Fats',
    description: 'Replace saturated fats with unsaturated fats',
    message: 'Choose sources of healthy fats like avocados, nuts, seeds, and olive oil. Limit intake of saturated and trans fats.',
    icon: '🥑',
    status: 'active',
    priority: 8,
    dietaryRestrictions: [],
  },
  {
    title: 'Stay Hydrated',
    description: 'Drink 2-3 liters of water daily',
    message: 'Water is essential for all bodily functions. Aim to drink water throughout the day, especially before and after meals.',
    icon: '💧',
    status: 'active',
    priority: 6,
    dietaryRestrictions: [],
  },
  {
    title: 'Adequate Protein',
    description: 'Include protein in every meal',
    message: 'Protein helps maintain muscle mass and keeps you feeling full. Include lean meats, fish, legumes, and dairy products.',
    icon: '🥩',
    status: 'active',
    priority: 7,
    dietaryRestrictions: ['vegan', 'vegetarian'],
  },
  {
    title: 'Regular Meal Times',
    description: 'Eat at consistent times throughout the day',
    message: 'Maintaining regular meal times helps regulate metabolism and prevents overeating. Aim for 3-4 balanced meals daily.',
    icon: '⏰',
    status: 'active',
    priority: 5,
    dietaryRestrictions: [],
  },
];

async function seedDatabase() {
  console.log("🧹 Видалення старих рецептів...");
  
  try {
    // Очищення колекції recipes (обережно!)
    const snapshot = await db.collection('recipes').get();
    const batch = db.batch();
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`🗑 Видалено ${snapshot.docs.length} старих рецептів.`);
  } catch (error) {
    console.error("Помилка при видаленні:", error);
  }
  
  console.log("🌱 Додавання нових рецептів GohanFlow...");
  
  try {
    for (const recipe of realRecipes) {
      await db.collection('recipes').add(recipe);
    }
    console.log(`✅ Додано ${realRecipes.length} нових рецептів!`);
    console.log("✅ База даних успішно оновлена GohanFlow рецептами!");
  } catch (error) {
    console.error("Помилка при додаванні рецептів:", error);
  }
  
  // Додати поради ВООЗ
  console.log("🌱 Додавання порад ВООЗ...");
  
  try {
    // Перевірити чи вже є поради
    const existingAdvice = await db.collection('whoAdvice').get();
    if (existingAdvice.empty) {
      for (const advice of whoAdviceData) {
        await db.collection('whoAdvice').add({
          ...advice,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      console.log(`✅ Додано ${whoAdviceData.length} порад ВООЗ!`);
    } else {
      console.log("ℹ️ Поради ВООЗ вже існують в базі даних.");
    }
  } catch (error) {
    console.error("Помилка при додаванні порад ВООЗ:", error);
  }
  
  process.exit(0);
}

seedDatabase();

