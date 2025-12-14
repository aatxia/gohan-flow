import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BudgetForm, { type MealPlanPreferences, RecipeSelector } from '@/components/BudgetForm';
import MealCard from '@/components/MealCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MEALS, filterMealsByPreference, type Meal } from '@/data/mockData';
import { type Recipe } from '@/data/mockData';
import { 
  RefreshCw, 
  Download, 
  DollarSign, 
  Flame, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  ChefHat,
  Plus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentMealPlan, saveMealPlan } from '@/services/mealPlanService';
import { createNotification } from '@/services/notificationService';
import { getAllRecipes } from '@/services/recipeService';

// Types for generated meal plan
interface DayPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
  totalCost: number;
}

interface GeneratedPlan {
  weeklyPlan: DayPlan[];
  totalWeeklyCost: number;
  totalWeeklyCalories: number;
  preferences: MealPlanPreferences;
}

// Meal planner page with form and generated plan display
const MealPlanner = () => {
  const { user } = useAuth();
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Завантажити поточний план при завантаженні сторінки
  useEffect(() => {
    const loadCurrentPlan = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const plan = await getCurrentMealPlan(user.id);
        if (plan) {
          setGeneratedPlan(plan);
        }
      } catch (error) {
        console.error('Помилка завантаження плану:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentPlan();
    
    // Завантажити рецепти для вибору
    const loadRecipes = async () => {
      try {
        const recipes = await getAllRecipes();
        console.log('Завантажено рецептів з БД:', recipes.length);
        setAvailableRecipes(recipes);
      } catch (error) {
        console.error('Помилка завантаження рецептів:', error);
        setAvailableRecipes([]);
      }
    };
    
    loadRecipes();
  }, [user]);

  // Конвертувати рецепт в Meal формат
  const recipeToMeal = (recipe: Recipe): Meal => {
    return {
      id: recipe.id,
      name: recipe.name,
      type: recipe.type === 'dessert' ? 'snack' : recipe.type,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fiber: recipe.fiber,
      price: recipe.price,
      prepTime: recipe.prepTime,
      ingredients: recipe.ingredients,
      tags: recipe.tags,
    };
  };

  // Generate a meal plan based on user preferences
  const generateMealPlan = async (preferences: MealPlanPreferences) => {
    setIsGenerating(true);

    // Завантажити рецепти з БД, якщо ще не завантажені
    let recipesToUse = availableRecipes;
    if (recipesToUse.length === 0) {
      try {
        recipesToUse = await getAllRecipes();
        setAvailableRecipes(recipesToUse);
        console.log('Завантажено рецептів з БД для генерації плану:', recipesToUse.length);
      } catch (error) {
        console.error('Помилка завантаження рецептів:', error);
        recipesToUse = [];
      }
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Отримати ВСІ рецепти з БД та конвертувати в Meal
    const allRecipeMeals: Meal[] = recipesToUse
      .filter(r => r.status === 'published')
      .map(recipeToMeal);

    console.log('Рецепти з БД конвертовано в Meal:', allRecipeMeals.length);

    // Отримати вибрані рецепти (якщо є)
    const selectedRecipeMeals: Meal[] = [];
    if (preferences.selectedRecipes && preferences.selectedRecipes.length > 0) {
      selectedRecipeMeals.push(...allRecipeMeals
        .filter(m => preferences.selectedRecipes!.includes(m.id)));
      console.log('Вибрані рецепти:', selectedRecipeMeals.length);
    }

    // Filter meals by dietary preference
    const filteredMeals = filterMealsByPreference(MEALS, preferences.dietaryPreference);
    
    // Об'єднати ВСІ рецепти з БД з доступними стравами (рецепти мають пріоритет)
    const allAvailableMeals = [...allRecipeMeals, ...filteredMeals];
    
    console.log('Всього доступних страв:', allAvailableMeals.length, '(рецепти:', allRecipeMeals.length, ', mock:', filteredMeals.length, ')');
    
    // Calculate daily budget
    const dailyBudget = preferences.budgetPeriod === 'weekly' 
      ? preferences.budget / 7 
      : preferences.budget;

    // Розподілити вибрані рецепти по днях
    const selectedMealsPool = [...selectedRecipeMeals];
    const selectedMealsUsed = new Set<string>();

    // Generate weekly plan
    const weeklyPlan: DayPlan[] = daysOfWeek.map((day, dayIndex) => {
      const dayMeals: Meal[] = [];
      let remainingBudget = dailyBudget;
      let totalCalories = 0;

      // Select meals based on preferences - ВАЖЛИВО: генеруємо РІВНО стільки прийомів, скільки вказав користувач
      const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = [];
      
      // Генеруємо масив типів прийомів їжі відповідно до preferences.mealsPerDay
      if (preferences.mealsPerDay >= 5) {
        mealTypes.push('breakfast', 'snack', 'lunch', 'snack', 'dinner');
      } else if (preferences.mealsPerDay === 4) {
        mealTypes.push('breakfast', 'snack', 'lunch', 'dinner');
      } else if (preferences.mealsPerDay === 3) {
        mealTypes.push('breakfast', 'lunch', 'dinner');
      } else if (preferences.mealsPerDay === 2) {
        mealTypes.push('breakfast', 'dinner');
      } else {
        // Якщо менше 2, все одно додаємо мінімум 2
        mealTypes.push('breakfast', 'dinner');
      }

      // Генеруємо прийоми їжі для кожного типу
      for (let i = 0; i < mealTypes.length; i++) {
        const type = mealTypes[i];
        
        // Спочатку перевіряємо чи є вибрані рецепти цього типу, які ще не використані
        const availableSelectedRecipes = selectedMealsPool.filter(m => 
          m.type === type && 
          m.price <= remainingBudget &&
          !selectedMealsUsed.has(m.id) // Не використовували ще
        );

        if (availableSelectedRecipes.length > 0) {
          // Використовуємо вибраний рецепт (пріоритет вибраним)
          const selectedRecipe = availableSelectedRecipes[0];
          dayMeals.push(selectedRecipe);
          remainingBudget -= selectedRecipe.price;
          totalCalories += selectedRecipe.calories;
          selectedMealsUsed.add(selectedRecipe.id);
        } else {
          // Якщо немає вибраного рецепту, використовуємо оптимізацію
          const availableMeals = allAvailableMeals.filter(m => 
            m.type === type && 
            m.price <= remainingBudget &&
            !dayMeals.some(dm => dm.id === m.id) // Уникаємо дублікатів в один день
          );
          
          if (availableMeals.length > 0) {
            // Оптимізація: вибираємо страви з найкращим співвідношенням калорій до ціни
            const dailyCalorieGoal = preferences.calorieGoal;
            const remainingCalories = dailyCalorieGoal - totalCalories;
            const remainingMeals = mealTypes.length - dayMeals.length;
            const caloriesPerMeal = remainingMeals > 0 ? remainingCalories / remainingMeals : remainingCalories;
            
            const scoredMeals = availableMeals.map(meal => {
              const calorieRatio = meal.calories / (meal.price || 0.01);
              const calorieScore = remainingMeals > 0 
                ? 1 - Math.abs(meal.calories - caloriesPerMeal) / (caloriesPerMeal || 1)
                : 0.5;
              const budgetScore = meal.price <= remainingBudget ? 1 : 0;
              return {
                meal,
                score: calorieRatio * 0.4 + calorieScore * 0.4 + budgetScore * 0.2,
              };
            });
            
            scoredMeals.sort((a, b) => b.score - a.score);
            const topMeals = scoredMeals.slice(0, Math.min(3, scoredMeals.length));
            const selectedMeal = topMeals.length > 0 
              ? topMeals[Math.floor(Math.random() * topMeals.length)].meal
              : availableMeals[0]; // Якщо немає оцінених, беремо першу доступну
            
            dayMeals.push(selectedMeal);
            remainingBudget -= selectedMeal.price;
            totalCalories += selectedMeal.calories;
          } else {
            // Якщо немає доступних страв для цього типу, все одно додаємо будь-яку доступну страву
            // щоб забезпечити правильну кількість прийомів їжі
            const anyAvailableMeal = allAvailableMeals.find(m => 
              m.price <= remainingBudget &&
              !dayMeals.some(dm => dm.id === m.id)
            );
            
            if (anyAvailableMeal) {
              dayMeals.push(anyAvailableMeal);
              remainingBudget -= anyAvailableMeal.price;
              totalCalories += anyAvailableMeal.calories;
            }
          }
        }
      }
      
      console.log(`День ${day}: згенеровано ${dayMeals.length} прийомів їжі (очікувалось: ${mealTypes.length})`);

      return {
        day,
        meals: dayMeals,
        totalCalories,
        totalCost: dayMeals.reduce((sum, m) => sum + m.price, 0),
      };
    });

    const plan: GeneratedPlan = {
      weeklyPlan,
      totalWeeklyCost: weeklyPlan.reduce((sum, d) => sum + d.totalCost, 0),
      totalWeeklyCalories: weeklyPlan.reduce((sum, d) => sum + d.totalCalories, 0),
      preferences,
    };

    setGeneratedPlan(plan);
    setIsGenerating(false);

    // Зберегти в Firebase через API
    if (user?.id) {
      try {
        const savedPlan = await saveMealPlan({
          userId: user.id,
          ...plan,
        });
        
        if (savedPlan) {
          setGeneratedPlan(plan);
          
          // Створити нотифікацію про створення плану
          if (user?.id) {
            await createNotification({
              userId: user.id,
              type: 'meal',
              title: 'Meal Plan Generated',
              message: `Your personalized weekly meal plan is ready! Total cost: $${plan.totalWeeklyCost.toFixed(2)}`,
            });
          }
          
          toast({
            title: 'Meal plan generated!',
            description: 'Your personalized weekly meal plan is ready.',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to save meal plan. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Помилка збереження плану:', error);
        toast({
          title: 'Error',
          description: 'Failed to save meal plan. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Meal plan generated!',
        description: 'Your personalized weekly meal plan is ready.',
      });
    }
  };

  // Regenerate plan with same preferences
  const regeneratePlan = () => {
    if (generatedPlan?.preferences) {
      generateMealPlan(generatedPlan.preferences);
    }
  };

  // Export plan (mock implementation)
  const exportPlan = () => {
    toast({
      title: 'Plan exported',
      description: 'Your meal plan has been saved.',
    });
  };

  const currentDayPlan = generatedPlan?.weeklyPlan[selectedDay];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading meal plan...</p>
          </div>
        ) : !generatedPlan ? (
          // Show form when no plan generated
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
                Plan Your Meals
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Tell us your preferences and we'll create a personalized meal plan that fits your budget and goals
              </p>
            </div>
            
            {/* Recipe Selector */}
            {availableRecipes.length > 0 && (
              <div className="mb-6 max-w-2xl mx-auto">
                <RecipeSelector
                  recipes={availableRecipes}
                  selectedRecipes={selectedRecipes}
                  onToggleRecipe={(recipeId) => {
                    setSelectedRecipes(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(recipeId)) {
                        newSet.delete(recipeId);
                      } else {
                        newSet.add(recipeId);
                      }
                      return newSet;
                    });
                  }}
                  open={showRecipeSelector}
                  onOpenChange={setShowRecipeSelector}
                />
              </div>
            )}
            
            <BudgetForm 
              onSubmit={(prefs) => {
                generateMealPlan({
                  ...prefs,
                  selectedRecipes: Array.from(selectedRecipes),
                });
              }} 
              isLoading={isGenerating} 
            />
          </div>
        ) : (
          // Show generated plan
          <div className="space-y-6 animate-fade-in">
            {/* Header with actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-semibold text-foreground mb-1">
                  Your Weekly Meal Plan
                </h1>
                <p className="text-muted-foreground">
                  {generatedPlan.preferences.dietaryPreference !== 'none' && (
                    <Badge variant="secondary" className="mr-2">
                      {generatedPlan.preferences.dietaryPreference}
                    </Badge>
                  )}
                  {generatedPlan.preferences.mealsPerDay} meals/day • ${generatedPlan.preferences.budget} {generatedPlan.preferences.budgetPeriod}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={regeneratePlan}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={async () => {
                    // Підтвердження плану - зберігаємо план
                    if (user?.id) {
                      try {
                        const savedPlan = await saveMealPlan({
                          userId: user.id,
                          ...generatedPlan,
                          isCurrent: true,
                        });
                        
                        if (savedPlan) {
                          toast({
                            title: 'Plan confirmed!',
                            description: 'Your meal plan has been saved. Shopping list will be updated automatically.',
                          });
                          
                          // Створити нотифікацію про нагадування списку покупок
                          await createNotification({
                            userId: user.id,
                            type: 'shopping',
                            title: 'Shopping List Updated',
                            message: 'Your shopping list has been updated based on your new meal plan. Check it out!',
                          });
                        }
                      } catch (error) {
                        console.error('Помилка підтвердження плану:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to confirm plan. Please try again.',
                          variant: 'destructive',
                        });
                      }
                    }
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Plan
                </Button>
                <Button variant="soft" size="sm" onClick={exportPlan}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setGeneratedPlan(null)}
                >
                  New Plan
                </Button>
              </div>
            </div>

            {/* Weekly overview stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      ${generatedPlan.totalWeeklyCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Weekly Cost</div>
                  </div>
                </div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-secondary" />
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {Math.round(generatedPlan.totalWeeklyCalories / 7)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg cal/day</div>
                  </div>
                </div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-chart-4" />
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {generatedPlan.weeklyPlan.reduce((sum, d) => sum + d.meals.length, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Meals</div>
                  </div>
                </div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {generatedPlan.totalWeeklyCost <= generatedPlan.preferences.budget ? 'Yes' : 'No'}
                    </div>
                    <div className="text-xs text-muted-foreground">Within Budget</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Day selector */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDay(prev => Math.max(0, prev - 1))}
                disabled={selectedDay === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex gap-2 overflow-x-auto py-2">
                {daysOfWeek.map((day, idx) => (
                  <Button
                    key={day}
                    variant={selectedDay === idx ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedDay(idx)}
                    className="whitespace-nowrap"
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDay(prev => Math.min(6, prev + 1))}
                disabled={selectedDay === 6}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Day details */}
            {currentDayPlan && (
              <Card variant="elevated" className="animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{currentDayPlan.day}</CardTitle>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Flame className="w-4 h-4 text-secondary" />
                        {currentDayPlan.totalCalories} cal
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="w-4 h-4 text-primary" />
                        ${currentDayPlan.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentDayPlan.meals.map((meal) => (
                      <div key={meal.id} onClick={() => setExpandedMeal(
                        expandedMeal === meal.id ? null : meal.id
                      )}>
                        <MealCard 
                          meal={meal} 
                          showDetails={expandedMeal === meal.id}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MealPlanner;
