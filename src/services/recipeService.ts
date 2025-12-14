import { collection, getDocs, addDoc, doc, updateDoc, getDoc, arrayUnion, arrayRemove, increment, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

const RECIPES_COLLECTION = 'recipes';
export const getAllRecipes = async () => {
  try {
    if (!db) {
      throw new Error("Firestore не ініціалізовано! Перевірте firebaseConfig.ts");
    }

    const recipesCollection = collection(db, RECIPES_COLLECTION);
    const querySnapshot = await getDocs(recipesCollection);
    
    const recipes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        name: data.name || data.title || 'Рецепт без назви',
        title: data.title || data.name || 'Рецепт без назви',
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        fiber: data.fiber || 0,
        price: data.price || data.budgetPrice || 0,
        image: data.image || 'https://via.placeholder.com/300',
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || [],
        comments: data.comments || [],
        likes: data.likes || 0,
        prepTime: data.prepTime || 0,
        cookTime: data.cookTime || data.cookingTime || 0,
        servings: data.servings || 1,
        description: data.description || '',
        type: data.type || 'dinner',
        status: data.status || 'published',
        authorId: data.authorId || '',
        authorName: data.authorName || 'Невідомий автор',
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });

    console.log(`✅ Завантажено ${recipes.length} рецептів з Firestore:`, recipes);
    return recipes;

  } catch (error) {
    console.error("❌ Помилка при завантаженні рецептів:", error);
    return [];
  }
};
export const addRecipe = async (recipeData: {
  name: string;
  description: string;
  type: string;
  prepTime: number;
  cookTime: number;
  ingredients: Array<{ name: string; quantity: string; price: number }>;
  instructions: string[];
  authorId: string;
  authorName: string;
  status?: string;
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
}) => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return null;
    }

    const recipesCollection = collection(db, RECIPES_COLLECTION);
    
    const firestoreData = {
      ...recipeData,
      title: recipeData.name,
      likes: recipeData.likes || 0,
      views: 0,
      comments: recipeData.comments || [],
      createdAt: new Date().toISOString(),
      cookingTime: recipeData.prepTime + recipeData.cookTime,
      budgetPrice: recipeData.price || 0,
      isPublic: true,
      likedBy: [],
      commentsCount: 0,
    };

    const docRef = await addDoc(recipesCollection, firestoreData);
    
    console.log("✅ Рецепт додано до Firestore з ID:", docRef.id);
    
    return {
      id: docRef.id,
      ...firestoreData,
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
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return null;
    }

    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);
    
    if (!recipeSnap.exists()) {
      throw new Error('Рецепт не знайдено');
    }

    const newComment = {
      id: Date.now().toString(),
      ...commentData,
      createdAt: new Date().toISOString(),
    };

    const currentComments = recipeSnap.data().comments || [];
    await updateDoc(recipeRef, {
      comments: arrayUnion(newComment),
    });

    console.log("✅ Коментар додано до рецепту:", recipeId);
    
    return newComment;
  } catch (error) {
    console.error("❌ Помилка при додаванні коментаря:", error);
    return null;
  }
};

export const toggleLike = async (recipeId: string, userId: string) => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return null;
    }

    if (!userId) {
      throw new Error('Користувач не авторизований');
    }

    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);
    
    if (!recipeSnap.exists()) {
      throw new Error('Рецепт не знайдено');
    }

    const data = recipeSnap.data();
    const hasLiked = data.likedBy?.includes(userId) || false;

    if (hasLiked) {
      await updateDoc(recipeRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId)
      });
      console.log("✅ Лайк видалено:", recipeId);
      return { likes: (data.likes || 0) - 1, isLiked: false };
    } else {
      await updateDoc(recipeRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId)
      });
      console.log("✅ Рецепт лайкнуто:", recipeId);
      return { likes: (data.likes || 0) + 1, isLiked: true };
    }
  } catch (error) {
    console.error("❌ Помилка при лайкуванні:", error);
    return null;
  }
};

export const likeRecipe = async (recipeId: string, userId: string) => {
  const result = await toggleLike(recipeId, userId);
  return result ? { likes: result.likes } : null;
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

    console.log("✅ Рецепт поширено в профілі користувача:", userId);
    
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

