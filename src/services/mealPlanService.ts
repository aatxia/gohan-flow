import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { type Meal } from '@/data/mockData';
import { type MealPlanPreferences } from '@/components/BudgetForm';

interface Ingredient {
  name?: string;
  item?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
}

interface Recipe {
  id: string;
  title?: string;
  name?: string;
  priceEstimate?: number;
  price?: number;
  budgetPrice?: number;
  calories: number;
  ingredients: Ingredient[];
  image?: string;
}

interface DailyPlan {
  day: number;
  meals: Recipe[];
  dailyCost: number;
  dailyCalories: number;
}

interface MealPlanResult {
  planData: DailyPlan[];
  totalCost: number;
  isWithinBudget: boolean;
}

export interface StoredMealPlan {
  id: string;
  userId: string;
  weeklyPlan?: Array<{
    day: string;
    meals: Meal[];
    totalCalories: number;
    totalCost: number;
  }>;
  totalWeeklyCost?: number;
  totalWeeklyCalories?: number;
  preferences?: MealPlanPreferences;
  isCurrent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const userDocRef = (userId: string) => doc(db!, 'users', userId);

const mapUserDocToMealPlan = (userId: string, data: Record<string, unknown>): StoredMealPlan | null => {
  const currentMealPlan = data.currentMealPlan as StoredMealPlan | undefined;
  if (!currentMealPlan?.weeklyPlan) return null;

  return {
    id: userId,
    userId,
    weeklyPlan: currentMealPlan.weeklyPlan,
    totalWeeklyCost: currentMealPlan.totalWeeklyCost,
    totalWeeklyCalories: currentMealPlan.totalWeeklyCalories,
    preferences: currentMealPlan.preferences,
    isCurrent: true,
    createdAt: (data.currentMealPlanCreatedAt as string) || undefined,
    updatedAt: (data.currentMealPlanUpdatedAt as string) || undefined,
  };
};

export const getCurrentMealPlan = async (userId: string): Promise<StoredMealPlan | null> => {
  try {
    if (!db || !userId) return null;

    const snapshot = await getDoc(userDocRef(userId));
    if (!snapshot.exists()) return null;

    return mapUserDocToMealPlan(userId, snapshot.data());
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllMealPlans = async (userId: string): Promise<StoredMealPlan[]> => {
  const current = await getCurrentMealPlan(userId);
  return current ? [current] : [];
};

export const saveMealPlan = async (planData: Record<string, unknown>) => {
  if (!db) {
    throw new Error('Firestore не ініціалізовано');
  }

  const userId = planData.userId as string;
  if (!userId) {
    throw new Error('userId обовʼязковий');
  }

  const now = new Date().toISOString();
  const currentMealPlan = {
    weeklyPlan: planData.weeklyPlan,
    totalWeeklyCost: planData.totalWeeklyCost,
    totalWeeklyCalories: planData.totalWeeklyCalories,
    preferences: planData.preferences,
  };

  const userRef = userDocRef(userId);
  const existing = await getDoc(userRef);

  const payload: Record<string, unknown> = {
    currentMealPlan,
    currentMealPlanUpdatedAt: now,
    ...(existing.exists() && existing.data()?.currentMealPlanCreatedAt
      ? {}
      : { currentMealPlanCreatedAt: now }),
  };

  if (existing.exists()) {
    await updateDoc(userRef, payload);
  } else {
    await setDoc(userRef, payload, { merge: true });
  }

  try {
    await addDoc(collection(db, 'plans'), {
      userId,
      ...currentMealPlan,
      isCurrent: planData.isCurrent !== false,
      createdAt: now,
      updatedAt: now,
    });
  } catch (archiveError) {
    console.warn('Архів плану не збережено (можливо немає прав на plans):', archiveError);
  }

  return {
    id: userId,
    userId,
    ...currentMealPlan,
    isCurrent: true,
    updatedAt: now,
  };
};

export const updateMealPlan = async (planId: string, planData: Record<string, unknown>) => {
  const userId = (planData.userId as string) || planId;
  return saveMealPlan({ ...planData, userId });
};

export const deleteMealPlan = async (planId: string) => {
  try {
    if (!db) return false;

    const userRef = userDocRef(planId);
    await updateDoc(userRef, {
      currentMealPlan: null,
      currentMealPlanUpdatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const MealPlanService = {
  
  generateBudgetPlan: async (totalBudget: number, days: number = 7): Promise<MealPlanResult> => {
    try {
      if (!db) {
        throw new Error("Firestore не ініціалізовано! Перевірте firebaseConfig.ts");
      }

      const querySnapshot = await getDocs(collection(db, 'recipes'));
      const allRecipes: Recipe[] = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          priceEstimate: Number(data.priceEstimate || data.price || data.budgetPrice || 0),
          title: data.title || data.name || 'Рецепт без назви',
          calories: data.calories || 0,
          ingredients: data.ingredients || []
        };
      }) as Recipe[];

      const validRecipes = allRecipes.filter(r => r.priceEstimate > 0);
      
      if (validRecipes.length < 3) {
        throw new Error("Недостатньо рецептів з ціною для генерації плану! Потрібно мінімум 3 рецепти.");
      }

      validRecipes.sort((a, b) => a.priceEstimate - b.priceEstimate);

      const plan: DailyPlan[] = [];
      let totalSpent = 0;
      const dailyBudgetLimit = totalBudget / days;

      console.log(`💰 Генерація плану: Бюджет ${totalBudget} грн на ${days} днів (${Math.round(dailyBudgetLimit)} грн/день)`);

      for (let i = 1; i <= days; i++) {
        const dayMeals: Recipe[] = [];
        let dayCost = 0;
        let dayCalories = 0;

        for (let meal = 0; meal < 3; meal++) {
          const remainingDailyBudget = dailyBudgetLimit - dayCost;
          
          let affordableRecipes = validRecipes.filter(r => r.priceEstimate <= remainingDailyBudget * 1.2);
          
          if (affordableRecipes.length === 0) {
             affordableRecipes = [validRecipes[0]];
          }

          const usedIds = dayMeals.map(m => m.id);
          const availableRecipes = affordableRecipes.filter(r => !usedIds.includes(r.id));
          
          const recipesToChooseFrom = availableRecipes.length > 0 ? availableRecipes : affordableRecipes;

          const randomIndex = Math.floor(Math.random() * recipesToChooseFrom.length);
          const randomRecipe = recipesToChooseFrom[randomIndex];
          
          dayMeals.push(randomRecipe);
          dayCost += randomRecipe.priceEstimate;
          dayCalories += randomRecipe.calories || 0;
        }

        totalSpent += dayCost;
        plan.push({
          day: i,
          meals: dayMeals,
          dailyCost: Math.round(dayCost * 100) / 100,
          dailyCalories: Math.round(dayCalories)
        });
      }

      const result: MealPlanResult = {
        planData: plan,
        totalCost: Math.round(totalSpent * 100) / 100,
        isWithinBudget: totalSpent <= totalBudget + (totalBudget * 0.05)
      };

      console.log(`✅ План згенеровано: ${result.totalCost} грн (бюджет: ${totalBudget} грн)`);
      return result;

    } catch (error) {
      console.error("❌ Помилка генерації плану:", error);
      throw error;
    }
  },

  saveMealPlan: async (planData: DailyPlan[], totalPrice: number) => {
    if (!db) {
      throw new Error("Firestore не ініціалізовано!");
    }

    if (!auth || !auth.currentUser) {
      throw new Error("Користувач не авторизований");
    }

    try {
      const docRef = await addDoc(collection(db, 'meal_plans'), {
        userId: auth.currentUser.uid,
        startDate: new Date().toISOString(),
        days: planData,
        totalPrice: totalPrice,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      
      console.log("✅ План збережено в Firestore з ID:", docRef.id);
      return { id: docRef.id, success: true };
    } catch (error) {
      console.error("❌ Помилка збереження плану:", error);
      throw error;
    }
  },

  generateShoppingList: (planData: DailyPlan[]) => {
    const shoppingList: Record<string, { amount: number, unit: string }> = {};

    planData.forEach(day => {
      day.meals.forEach(meal => {
        if (meal.ingredients && Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach((ing: Ingredient) => {
            const name = (ing.name || ing.item || '').trim();
            if (!name) return;

            const amount = Number(ing.amount || ing.quantity || 0);
            const unit = ing.unit || 'шт';

            if (shoppingList[name]) {
              shoppingList[name].amount += amount;
            } else {
              shoppingList[name] = { amount, unit };
            }
          });
        }
      });
    });

    return Object.entries(shoppingList)
      .map(([name, data]) => ({
        name,
        ...data
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
};
