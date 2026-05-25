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
import { getProfile } from '@/services/profileService';

const ALLERGY_KEYWORDS: Record<string, string[]> = {
  'Peanuts': ['peanut', 'peanuts', 'groundnut'],
  'Tree Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'brazil nut', 'pine nut', 'chestnut', 'nuts'],
  'Milk': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'whey', 'casein', 'dairy', 'mozzarella', 'parmesan', 'cheddar', 'feta', 'ricotta', 'ghee'],
  'Eggs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
  'Wheat': ['wheat', 'flour', 'bread', 'pasta', 'noodle', 'noodles', 'couscous', 'tortilla', 'cracker', 'breadcrumb', 'pita', 'baguette', 'croissant'],
  'Soy': ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso', 'soy sauce'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'sardine', 'anchovy', 'bass', 'trout', 'mackerel', 'halibut', 'swordfish', 'catfish'],
  'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'octopus', 'crawfish', 'shellfish'],
  'Sesame': ['sesame', 'tahini'],
};

function mealContainsAllergen(meal: Meal, userAllergies: string[]): boolean {
  if (!userAllergies.length) return false;
  const ingredientText = meal.ingredients.map(i => i.name.toLowerCase()).join(' ');
  const combined = `${meal.name.toLowerCase()} ${ingredientText}`;
  for (const allergy of userAllergies) {
    const keywords = ALLERGY_KEYWORDS[allergy];
    if (keywords && keywords.some(kw => combined.includes(kw))) {
      return true;
    }
  }
  return false;
}


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
  const [userAllergies, setUserAllergies] = useState<string[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  useEffect(() => {
    const loadCurrentPlan = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const plan = await getCurrentMealPlan(user.id);
        if (plan?.weeklyPlan && plan.preferences) {
          setGeneratedPlan(plan as GeneratedPlan);
        }
      } catch (error) {
        console.error('Помилка завантаження плану:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentPlan();
    

    const loadRecipes = async () => {
      try {
        const recipes = await getAllRecipes();
        setAvailableRecipes(recipes);
      } catch (error) {
        console.error('Помилка завантаження рецептів:', error);
        setAvailableRecipes([]);
      }
    };
    
    loadRecipes();

    const loadAllergies = async () => {
      if (!user?.id) return;
      try {
        const profile = await getProfile(user.id);
        if (profile?.allergies && Array.isArray(profile.allergies)) {
          setUserAllergies(profile.allergies);
        }
      } catch (error) {
        console.error('Failed to load allergies:', error);
      }
    };

    loadAllergies();
  }, [user]);


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


  const generateMealPlan = async (preferences: MealPlanPreferences) => {
    setIsGenerating(true);


    let recipesToUse = availableRecipes;
    if (recipesToUse.length === 0) {
      try {
        recipesToUse = await getAllRecipes();
        setAvailableRecipes(recipesToUse);
      } catch (error) {
        console.error('Помилка завантаження рецептів:', error);
        recipesToUse = [];
      }
    }


    await new Promise(resolve => setTimeout(resolve, 1500));


    const allRecipeMeals: Meal[] = recipesToUse
      .filter(r => r.status === 'published')
      .map(recipeToMeal);



    const selectedRecipeMeals: Meal[] = [];
    if (preferences.selectedRecipes && preferences.selectedRecipes.length > 0) {
      selectedRecipeMeals.push(...allRecipeMeals
        .filter(m => preferences.selectedRecipes!.includes(m.id)));
    }


    const filteredMeals = filterMealsByPreference(MEALS, preferences.dietaryPreference);
    

    const allAvailableMeals = [...allRecipeMeals, ...filteredMeals]
      .filter(meal => !mealContainsAllergen(meal, userAllergies));
    
    

    const dailyBudget = preferences.budgetPeriod === 'weekly' 
      ? preferences.budget / 7 
      : preferences.budget;


    const selectedMealsPool = selectedRecipeMeals
      .filter(meal => !mealContainsAllergen(meal, userAllergies));
    const selectedMealsUsed = new Set<string>();


    const weeklyPlan: DayPlan[] = daysOfWeek.map((day, dayIndex) => {
      const dayMeals: Meal[] = [];
      let remainingBudget = dailyBudget;
      let totalCalories = 0;


      const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = [];
      

      if (preferences.mealsPerDay >= 5) {
        mealTypes.push('breakfast', 'snack', 'lunch', 'snack', 'dinner');
      } else if (preferences.mealsPerDay === 4) {
        mealTypes.push('breakfast', 'snack', 'lunch', 'dinner');
      } else if (preferences.mealsPerDay === 3) {
        mealTypes.push('breakfast', 'lunch', 'dinner');
      } else if (preferences.mealsPerDay === 2) {
        mealTypes.push('breakfast', 'dinner');
      } else {

        mealTypes.push('breakfast', 'dinner');
      }


      for (let i = 0; i < mealTypes.length; i++) {
        const type = mealTypes[i];
        

        const availableSelectedRecipes = selectedMealsPool.filter(m => 
          m.type === type && 
          m.price <= remainingBudget &&
          !selectedMealsUsed.has(m.id)
        );

        if (availableSelectedRecipes.length > 0) {

          const selectedRecipe = availableSelectedRecipes[0];
          dayMeals.push(selectedRecipe);
          remainingBudget -= selectedRecipe.price;
          totalCalories += selectedRecipe.calories;
          selectedMealsUsed.add(selectedRecipe.id);
        } else {

          const availableMeals = allAvailableMeals.filter(m => 
            m.type === type && 
            m.price <= remainingBudget &&
            !dayMeals.some(dm => dm.id === m.id)
          );
          
          if (availableMeals.length > 0) {

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
              : availableMeals[0];
            
            dayMeals.push(selectedMeal);
            remainingBudget -= selectedMeal.price;
            totalCalories += selectedMeal.calories;
          } else {

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


    if (user?.id) {
      try {
        const savedPlan = await saveMealPlan({
          userId: user.id,
          ...plan,
        });
        
        if (savedPlan) {
          setGeneratedPlan(plan);
          

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


  const regeneratePlan = () => {
    if (generatedPlan?.preferences) {
      generateMealPlan(generatedPlan.preferences);
    }
  };


  const exportPlan = async () => {
    if (!generatedPlan) return;

    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const doc = new jsPDF();

      const num = (v: unknown) => Number(v) || 0;
      const str = (v: unknown) => String(v ?? '');

      doc.setFontSize(20);
      doc.text('Weekly Meal Plan', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      const dietLabel = generatedPlan.preferences.dietaryPreference !== 'none'
        ? str(generatedPlan.preferences.dietaryPreference)
        : 'No restriction';
      doc.text(
        `${dietLabel} | ${num(generatedPlan.preferences.mealsPerDay)} meals/day | Budget: $${num(generatedPlan.preferences.budget)} ${str(generatedPlan.preferences.budgetPeriod)}`,
        105, 28, { align: 'center' }
      );
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 34, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Weekly Cost: $${num(generatedPlan.totalWeeklyCost).toFixed(2)}`, 14, 44);
      doc.text(`Avg Calories/Day: ${Math.round(num(generatedPlan.totalWeeklyCalories) / 7)}`, 105, 44);
      doc.text(`Total Meals: ${(generatedPlan.weeklyPlan || []).reduce((s: number, d: DayPlan) => s + (d.meals?.length || 0), 0)}`, 170, 44);

      let y = 56;

      for (const dayPlan of (generatedPlan.weeklyPlan || [])) {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(240, 240, 240);
        doc.rect(14, y - 5, 182, 8, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(str(dayPlan.day), 16, y);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${num(dayPlan.totalCalories)} cal | $${num(dayPlan.totalCost).toFixed(2)}`, 180, y, { align: 'right' });
        y += 8;

        doc.setFontSize(10);
        for (const meal of (dayPlan.meals || [])) {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }

          const mealType = str(meal.type);
          doc.setFont('helvetica', 'bold');
          doc.text(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${str(meal.name)}`, 18, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`${num(meal.calories)} cal | $${num(meal.price).toFixed(2)} | ${num(meal.prepTime)} min prep`, 180, y, { align: 'right' });
          doc.setFontSize(10);
          y += 5;

          const ingredients = meal.ingredients || [];
          if (ingredients.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            const ingredientNames = ingredients.map((i: { name: string }) => str(i.name)).join(', ');
            const lines: string[] = doc.splitTextToSize(`Ingredients: ${ingredientNames}`, 170);
            for (const line of lines) {
              if (y > 275) {
                doc.addPage();
                y = 20;
              }
              doc.text(line, 22, y);
              y += 4;
            }
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
          }
          y += 3;
        }
        y += 4;
      }

      doc.save(`meal-plan-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Plan exported!',
        description: 'Your meal plan has been downloaded as PDF.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export failed',
        description: 'Could not generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
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

          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
                Plan Your Meals
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Tell us your preferences and we'll create a personalized meal plan that fits your budget and goals
              </p>
            </div>
            
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

          <div className="space-y-6 animate-fade-in">
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
                          
                          await createNotification({
                            userId: user.id,
                            type: 'shopping',
                            title: 'Shopping List Updated',
                            message: 'Your shopping list has been updated based on your new meal plan. Check it out!',
                          });
                        } else {
                          toast({
                            title: 'Error',
                            description: 'Failed to confirm plan. Please try again.',
                            variant: 'destructive',
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
