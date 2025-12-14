import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DIETARY_PREFERENCES, CALORIE_GOALS } from '@/data/mockData';
import { Sparkles, DollarSign, Utensils, Target, Plus } from 'lucide-react';

export interface MealPlanPreferences {
  budget: number;
  budgetPeriod: 'daily' | 'weekly';
  dietaryPreference: string;
  calorieGoal: number;
  mealsPerDay: number;
  selectedRecipes?: string[]; // IDs вибраних рецептів
}

interface BudgetFormProps {
  onSubmit: (preferences: MealPlanPreferences) => void;
  isLoading?: boolean;
}

// BudgetForm component for collecting user meal planning preferences
const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit, isLoading }) => {
  const [preferences, setPreferences] = useState<MealPlanPreferences>({
    budget: 50,
    budgetPeriod: 'weekly',
    dietaryPreference: 'none',
    calorieGoal: 2000,
    mealsPerDay: 3,
  });

  const [customCalories, setCustomCalories] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const handleCalorieGoalChange = (goalId: string) => {
    const goal = CALORIE_GOALS.find(g => g.id === goalId);
    if (goal) {
      if (goalId === 'custom') {
        setCustomCalories(true);
      } else {
        setCustomCalories(false);
        setPreferences(prev => ({ ...prev, calorieGoal: goal.calories }));
      }
    }
  };

  return (
    <Card variant="elevated" className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Create Your Meal Plan
        </CardTitle>
        <CardDescription>
          Tell us your preferences and we'll generate a personalized plan
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Budget Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <DollarSign className="w-5 h-5 text-primary" />
              <span>Budget</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Amount ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="10"
                  max="500"
                  value={preferences.budget}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    budget: parseInt(e.target.value) || 0
                  }))}
                  className="text-lg font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Period</Label>
                <RadioGroup
                  value={preferences.budgetPeriod}
                  onValueChange={(value: 'daily' | 'weekly') => 
                    setPreferences(prev => ({ ...prev, budgetPeriod: value }))
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="cursor-pointer">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="cursor-pointer">Weekly</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Utensils className="w-5 h-5 text-primary" />
              <span>Dietary Preference</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DIETARY_PREFERENCES.map((pref) => (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setPreferences(prev => ({ ...prev, dietaryPreference: pref.id }))}
                  className={`p-3 rounded-xl border text-sm text-left transition-all ${
                    preferences.dietaryPreference === pref.id
                      ? 'border-primary bg-accent shadow-soft'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="font-medium text-foreground">{pref.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{pref.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calorie Goals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Target className="w-5 h-5 text-primary" />
              <span>Calorie Goal</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CALORIE_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => handleCalorieGoalChange(goal.id)}
                  className={`p-3 rounded-xl border text-sm text-left transition-all ${
                    (goal.id !== 'custom' && preferences.calorieGoal === goal.calories && !customCalories) ||
                    (goal.id === 'custom' && customCalories)
                      ? 'border-primary bg-accent shadow-soft'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="font-medium text-foreground">{goal.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{goal.description}</div>
                </button>
              ))}
            </div>

            {customCalories && (
              <div className="space-y-2 animate-fade-in">
                <Label>Custom calories: {preferences.calorieGoal} cal/day</Label>
                <Slider
                  value={[preferences.calorieGoal]}
                  onValueChange={([value]) => setPreferences(prev => ({ ...prev, calorieGoal: value }))}
                  min={1000}
                  max={4000}
                  step={50}
                  className="py-4"
                />
              </div>
            )}
          </div>

          {/* Meals per Day */}
          <div className="space-y-4">
            <Label>Meals per day: {preferences.mealsPerDay}</Label>
            <Slider
              value={[preferences.mealsPerDay]}
              onValueChange={([value]) => setPreferences(prev => ({ ...prev, mealsPerDay: value }))}
              min={2}
              max={5}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2 meals</span>
              <span>5 meals</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate My Meal Plan'}
            <Sparkles className="w-5 h-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Recipe Selector Component
interface RecipeSelectorProps {
  recipes: Array<{
    id: string;
    name: string;
    type: string;
    calories: number;
    price: number;
    description: string;
  }>;
  selectedRecipes: Set<string>;
  onToggleRecipe: (recipeId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  recipes,
  selectedRecipes,
  onToggleRecipe,
  open,
  onOpenChange,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredRecipes = recipes.filter(r => 
    filterType === 'all' || r.type === filterType
  );

  const groupedByType = filteredRecipes.reduce((acc, recipe) => {
    if (!acc[recipe.type]) acc[recipe.type] = [];
    acc[recipe.type].push(recipe);
    return acc;
  }, {} as Record<string, typeof recipes>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Select Recipes ({selectedRecipes.size})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Recipes for Your Meal Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              type="button"
              variant={filterType === 'breakfast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('breakfast')}
            >
              Breakfast
            </Button>
            <Button
              type="button"
              variant={filterType === 'lunch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('lunch')}
            >
              Lunch
            </Button>
            <Button
              type="button"
              variant={filterType === 'dinner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('dinner')}
            >
              Dinner
            </Button>
            <Button
              type="button"
              variant={filterType === 'snack' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('snack')}
            >
              Snack
            </Button>
          </div>
          <div className="space-y-4">
            {Object.entries(groupedByType).map(([type, typeRecipes]) => (
              <div key={type}>
                <h4 className="font-medium text-foreground mb-2 capitalize">{type}</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {typeRecipes.map(recipe => (
                    <div
                      key={recipe.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRecipes.has(recipe.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => onToggleRecipe(recipe.id)}
                    >
                      <Checkbox
                        checked={selectedRecipes.has(recipe.id)}
                        onCheckedChange={() => onToggleRecipe(recipe.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{recipe.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {recipe.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{recipe.calories} cal</span>
                          <span>•</span>
                          <span>${recipe.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetForm;
