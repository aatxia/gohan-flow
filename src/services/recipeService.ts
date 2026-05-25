import { collection, getDocs, addDoc, doc, updateDoc, getDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { type Recipe } from '@/data/mockData';

const RECIPES_COLLECTION = 'recipes';
export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    if (!db) {
      throw new Error("Firestore не ініціалізовано! Перевірте firebaseConfig.ts");
    }

    const recipesCollection = collection(db, RECIPES_COLLECTION);
    const querySnapshot = await getDocs(recipesCollection);
    
    const recipes: Recipe[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const mealType = data.type as Recipe['type'];
      const validTypes: Recipe['type'][] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
      const status = data.status as Recipe['status'];
      const validStatuses: Recipe['status'][] = ['published', 'pending', 'draft'];

      return {
        id: docSnap.id,
        name: data.name || data.title || 'Рецепт без назви',
        description: data.description || '',
        type: validTypes.includes(mealType) ? mealType : 'dinner',
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        fiber: data.fiber || 0,
        price: data.price || data.budgetPrice || 0,
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        prepTime: data.prepTime || 0,
        cookTime: data.cookTime || data.cookingTime || 0,
        servings: data.servings || 1,
        tags: data.tags || [],
        authorId: data.authorId || '',
        authorName: data.authorName || 'Невідомий автор',
        likes: data.likes || 0,
        comments: data.comments || [],
        status: validStatuses.includes(status) ? status : 'published',
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });

    return recipes;

  } catch (error) {
    console.error("❌ Помилка при завантаженні рецептів:", error);
    return [];
  }
};

export const getRecipeById = async (recipeId: string): Promise<Recipe | null> => {
  try {
    if (!db) return null;

    const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
    const docSnap = await getDoc(recipeRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const validTypes: Recipe['type'][] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
    const validStatuses: Recipe['status'][] = ['published', 'pending', 'draft'];
    const mealType = data.type as Recipe['type'];
    const status = data.status as Recipe['status'];

    return {
      id: docSnap.id,
      name: data.name || data.title || '',
      description: data.description || '',
      type: validTypes.includes(mealType) ? mealType : 'dinner',
      calories: data.calories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
      fiber: data.fiber || 0,
      price: data.price || data.budgetPrice || 0,
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      prepTime: data.prepTime || 0,
      cookTime: data.cookTime || data.cookingTime || 0,
      servings: data.servings || 1,
      tags: data.tags || [],
      authorId: data.authorId || '',
      authorName: data.authorName || '',
      likes: data.likes || 0,
      comments: data.comments || [],
      status: validStatuses.includes(status) ? status : 'published',
      createdAt: data.createdAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to get recipe:", error);
    return null;
  }
};

export const addRecipe = async (recipeData: {
  name: string;
  description: string;
  type: Recipe['type'];
  prepTime: number;
  cookTime: number;
  ingredients: Array<{ name: string; quantity: string; price: number }>;
  instructions: string[];
  authorId: string;
  authorName: string;
  status?: Recipe['status'];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  price?: number;
  servings?: number;
  tags?: string[];
  likes?: number;
  comments?: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
  }>;
}): Promise<Recipe | null> => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return null;
    }

    const recipesCollection = collection(db, RECIPES_COLLECTION);
    const createdAt = new Date().toISOString();
    const status = recipeData.status || 'pending';

    const firestoreData = {
      ...recipeData,
      title: recipeData.name,
      likes: recipeData.likes || 0,
      views: 0,
      comments: recipeData.comments || [],
      createdAt,
      cookingTime: recipeData.prepTime + recipeData.cookTime,
      budgetPrice: recipeData.price || 0,
      isPublic: true,
      likedBy: [],
      commentsCount: 0,
      status,
    };

    const docRef = await addDoc(recipesCollection, firestoreData);
    
    
    return {
      id: docRef.id,
      name: recipeData.name,
      description: recipeData.description,
      type: recipeData.type,
      calories: recipeData.calories || 0,
      protein: recipeData.protein || 0,
      carbs: recipeData.carbs || 0,
      fat: recipeData.fat || 0,
      fiber: recipeData.fiber || 0,
      price: recipeData.price || 0,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      servings: recipeData.servings || 1,
      tags: recipeData.tags || [],
      authorId: recipeData.authorId,
      authorName: recipeData.authorName,
      likes: recipeData.likes || 0,
      comments: recipeData.comments || [],
      status,
      createdAt,
    };
  } catch (error) {
    console.error("❌ Помилка при додаванні рецепту:", error);
    return null;
  }
};

export const addCommentToRecipe = async (recipeId: string, commentData: {
  userId: string;
  userName: string;
  content: string;
}) => {
  try {
    if (!db) return null;

    const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
    const recipeSnap = await getDoc(recipeRef);
    if (!recipeSnap.exists()) return null;

    const newComment = {
      id: `c${Date.now()}`,
      ...commentData,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(recipeRef, {
      comments: arrayUnion(newComment),
    });

    return newComment;
  } catch (error) {
    console.error("Failed to add comment:", error);
    return null;
  }
};

export const likeRecipe = async (recipeId: string, userId: string): Promise<{ likes: number; isLiked: boolean } | null> => {
  try {
    if (!db || !userId) return null;

    const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
    const recipeSnap = await getDoc(recipeRef);
    if (!recipeSnap.exists()) return null;

    const data = recipeSnap.data();
    const likedBy: string[] = data.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      await updateDoc(recipeRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      });
      return { likes: Math.max((data.likes || 0) - 1, 0), isLiked: false };
    } else {
      await updateDoc(recipeRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });
      return { likes: (data.likes || 0) + 1, isLiked: true };
    }
  } catch (error) {
    console.error("Failed to like recipe:", error);
    return null;
  }
};

export const getUserLikedRecipeIds = async (userId: string): Promise<Set<string>> => {
  try {
    if (!db) return new Set();

    const recipesCollection = collection(db, RECIPES_COLLECTION);
    const querySnapshot = await getDocs(recipesCollection);
    const likedIds = new Set<string>();

    querySnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.likedBy && Array.isArray(data.likedBy) && data.likedBy.includes(userId)) {
        likedIds.add(docSnap.id);
      }
    });

    return likedIds;
  } catch (error) {
    console.error("Failed to get liked recipes:", error);
    return new Set();
  }
};

export const shareRecipe = async (userId: string, recipeId: string) => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return null;
    }

    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);
    
    if (!recipeSnap.exists()) {
      throw new Error('Рецепт не знайдено');
    }

    const userSharedRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userSharedRef);
    
    const sharedRecipes = userSnap.exists() ? (userSnap.data().sharedRecipes || []) : [];
    
    if (!sharedRecipes.includes(recipeId)) {
      await updateDoc(userSharedRef, {
        sharedRecipes: arrayUnion(recipeId),
      });
    }

    
    return { success: true };
  } catch (error) {
    console.error("❌ Помилка при поширенні рецепту:", error);
    return null;
  }
};

export const getSharedRecipes = async (userId: string) => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return [];
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }

    const sharedRecipeIds = userSnap.data().sharedRecipes || [];
    
    const recipesPromises = sharedRecipeIds.map(async (recipeId: string) => {
      const recipeRef = doc(db, 'recipes', recipeId);
      const recipeSnap = await getDoc(recipeRef);
      if (recipeSnap.exists()) {
        return {
          id: recipeSnap.id,
          ...recipeSnap.data(),
        };
      }
      return null;
    });

    const recipes = (await Promise.all(recipesPromises)).filter(Boolean);
    
    return recipes;
  } catch (error) {
    console.error("❌ Помилка при завантаженні поширених рецептів:", error);
    return [];
  }
};

