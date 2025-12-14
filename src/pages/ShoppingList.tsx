import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { type Meal, type Ingredient } from '@/data/mockData';
import { 
  ShoppingCart, DollarSign, Package, Check, 
  Calendar, CalendarDays, CalendarRange, Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentMealPlan } from '@/services/mealPlanService';
import { getShoppingList, saveShoppingList } from '@/services/shoppingListService';
import { createNotification } from '@/services/notificationService';

interface ShoppingItem extends Ingredient {
  id: string;
  category: string;
  checked: boolean;
  owned: boolean;
}

const ShoppingList = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Generate shopping list from meal plan
  useEffect(() => {
    const loadShoppingList = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Отримати поточний план
        const plan = await getCurrentMealPlan(user.id);
        if (!plan || !plan.weeklyPlan) {
          // Перевірити чи є збережений список покупок
          const savedList = await getShoppingList(user.id);
          if (savedList && savedList.items && savedList.items.length > 0) {
            setItems(savedList.items);
            setTotalBudget(savedList.totalBudget || 0);
          }
          setIsLoading(false);
          return;
        }

        // Перевірити чи є збережений список покупок
        const savedList = await getShoppingList(user.id);
        if (savedList && savedList.items && savedList.items.length > 0) {
          // Якщо є збережений список, використовуємо його
          setItems(savedList.items);
          setTotalBudget(savedList.totalBudget || 0);
          setIsLoading(false);
          return;
        }

        // Якщо немає збереженого списку, генеруємо з плану

        const ingredientMap = new Map<string, ShoppingItem>();

        // Determine how many days to include based on period
        const daysToInclude = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
        const planDays = plan.weeklyPlan.slice(0, Math.min(daysToInclude, 7));

        // Aggregate ingredients
        planDays.forEach((day: { meals: Meal[] }) => {
          day.meals.forEach((meal: Meal) => {
            meal.ingredients.forEach((ing: Ingredient) => {
              const key = ing.name.toLowerCase();
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key)!;
                existing.price += ing.price;
              } else {
                ingredientMap.set(key, {
                  ...ing,
                  id: `item-${Date.now()}-${Math.random()}`,
                  category: categorizeIngredient(ing.name),
                  checked: false,
                  owned: false,
                });
              }
            });
          });
        });

        // Multiply for monthly
        let multiplier = 1;
        if (period === 'monthly') multiplier = 4;

        const generatedItems = Array.from(ingredientMap.values()).map(item => ({
          ...item,
          price: item.price * multiplier,
        }));

        setItems(generatedItems);
        setTotalBudget(plan.preferences.budget * (period === 'monthly' ? 4 : 1));

        // Зберігаємо згенерований список
        await saveShoppingList({
          userId: user.id,
          items: generatedItems,
          totalBudget: plan.preferences.budget * (period === 'monthly' ? 4 : 1),
        });

        // Створити нотифікацію про створення списку покупок
        await createNotification({
          userId: user.id,
          type: 'shopping',
          title: 'Shopping List Ready',
          message: `Your ${period} shopping list has been generated with ${generatedItems.length} items. Don't forget to check it!`,
        });
      } catch (error) {
        console.error('Помилка завантаження списку покупок:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadShoppingList();
  }, [period, user]);

  // Categorize ingredient
  function categorizeIngredient(name: string): string {
    const categories: Record<string, string[]> = {
      produce: ['avocado', 'tomato', 'spinach', 'kale', 'cucumber', 'carrot', 'onion', 'banana', 'apple', 'mango', 'lemon', 'broccoli', 'pepper', 'ginger', 'garlic', 'green onion'],
      dairy: ['yogurt', 'cheese', 'milk', 'egg', 'butter', 'feta'],
      meat: ['chicken', 'salmon', 'beef', 'pork', 'fish'],
      grains: ['rice', 'bread', 'oats', 'pasta', 'quinoa', 'noodles', 'granola'],
      pantry: ['oil', 'honey', 'soy sauce', 'teriyaki', 'miso', 'chia', 'almond butter', 'hummus', 'tahini', 'olive', 'herbs', 'spices', 'salt', 'sesame'],
    };

    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => lowerName.includes(k))) {
        return category;
      }
    }
    return 'other';
  }

  // Toggle item checked
  const toggleChecked = async (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);

    // Зберігаємо зміни в API
    if (user?.id) {
      try {
        await saveShoppingList({
          userId: user.id,
          items: updatedItems,
          totalBudget,
        });
      } catch (error) {
        console.error('Помилка збереження списку покупок:', error);
      }
    }
  };

  // Toggle item owned (already have it) - переміщує вниз та перекреслює
  const toggleOwned = async (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, owned: !item.owned } : item
    );
    
    // Сортуємо: спочатку невідмічені, потім відмічені (owned)
    const sortedItems = [...updatedItems].sort((a, b) => {
      if (a.owned && !b.owned) return 1;
      if (!a.owned && b.owned) return -1;
      return 0;
    });
    
    setItems(sortedItems);

    // Зберігаємо зміни в API
    if (user?.id) {
      try {
        await saveShoppingList({
          userId: user.id,
          items: sortedItems,
          totalBudget,
        });
      } catch (error) {
        console.error('Помилка збереження списку покупок:', error);
      }
    }
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Calculate totals
  const itemsToBy = items.filter(i => !i.owned);
  const totalCost = itemsToBy.reduce((sum, i) => sum + i.price, 0);
  const checkedItems = itemsToBy.filter(i => i.checked);
  const spentAmount = checkedItems.reduce((sum, i) => sum + i.price, 0);
  const remainingBudget = totalBudget - spentAmount;

  const exportList = () => {
    toast({ title: 'Shopping list exported!', description: 'Your list has been downloaded.' });
  };

  const categoryIcons: Record<string, string> = {
    produce: '🥬',
    dairy: '🥛',
    meat: '🥩',
    grains: '🌾',
    pantry: '🫙',
    other: '📦',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
              Shopping List
            </h1>
            <p className="text-muted-foreground">
              Your personalized grocery list based on your meal plan
            </p>
          </div>
          <Button variant="soft" onClick={exportList}>
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>

        {/* Period Selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)} className="mb-6">
          <TabsList>
            <TabsTrigger value="daily" className="gap-2">
              <Calendar className="w-4 h-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <CalendarRange className="w-4 h-4" />
              Monthly
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <Card variant="elevated" className="p-12 text-center">
            <p className="text-muted-foreground">Loading shopping list...</p>
          </Card>
        ) : items.length === 0 ? (
          <Card variant="elevated" className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
              No shopping list yet
            </h2>
            <p className="text-muted-foreground mb-4">
              Generate a meal plan first to create your shopping list
            </p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Shopping List */}
            <div className="lg:col-span-2 space-y-4">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <Card key={category} variant="elevated">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 capitalize">
                      <span>{categoryIcons[category] || '📦'}</span>
                      {category}
                      <Badge variant="secondary" className="ml-auto">
                        {categoryItems.filter(i => !i.owned).length} items
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categoryItems
                      .sort((a, b) => {
                        // Сортуємо: спочатку невідмічені, потім відмічені (owned)
                        if (a.owned && !b.owned) return 1;
                        if (!a.owned && b.owned) return -1;
                        return 0;
                      })
                      .map(item => (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          item.owned 
                            ? 'bg-muted/50 border-muted opacity-60' 
                            : item.checked 
                              ? 'bg-primary/10 border-primary/30' 
                              : 'bg-card border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleChecked(item.id)}
                            disabled={item.owned}
                          />
                          <div>
                            <span className={`font-medium ${item.checked || item.owned ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({item.quantity})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${item.owned ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            ${item.price.toFixed(2)}
                          </span>
                          <Button
                            variant={item.owned ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => toggleOwned(item.id)}
                            className="text-xs"
                          >
                            {item.owned ? <Check className="w-3 h-3 mr-1" /> : null}
                            {item.owned ? 'Have it' : 'Already have'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              <Card variant="glass" className="p-6 sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Summary
                </h3>

                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Shopping Progress</span>
                      <span className="font-medium text-foreground">
                        {checkedItems.length}/{itemsToBy.length}
                      </span>
                    </div>
                    <Progress 
                      value={itemsToBy.length > 0 ? (checkedItems.length / itemsToBy.length) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Items to buy
                      </span>
                      <span className="font-semibold text-foreground">{itemsToBy.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Estimated total
                      </span>
                      <span className="font-semibold text-foreground">${totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Already spent</span>
                      <span className="font-semibold text-primary">${spentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="text-muted-foreground">Budget remaining</span>
                      <span className={`font-semibold ${remainingBudget >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        ${remainingBudget.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="pt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Budget Usage</span>
                      <span className="font-medium text-foreground">
                        {((spentAmount / totalBudget) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((spentAmount / totalBudget) * 100, 100)} 
                      className={`h-2 ${spentAmount > totalBudget ? '[&>div]:bg-destructive' : ''}`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShoppingList;
