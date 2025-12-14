import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentMealPlan } from '@/services/mealPlanService';

// Analytics page displaying spending and meal plan statistics
const Analytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<{
    totalBudget: number;
    totalSpent: number;
    spendingByMeal: { name: string; value: number; color: string }[];
    dailySpending: { day: string; amount: number }[];
    mealsPlanned: number;
    averageCostPerMeal: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data from API
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const plan = await getCurrentMealPlan(user.id);
        
        if (!plan || !plan.weeklyPlan) {
          setAnalyticsData(null);
          setIsLoading(false);
          return;
        }
        
        // Calculate spending by meal type
        const mealTypeSpending: Record<string, number> = {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
        };

        let totalMeals = 0;

        plan.weeklyPlan.forEach((day: { meals: { type: string; price: number }[] }) => {
          day.meals.forEach((meal: { type: string; price: number }) => {
            mealTypeSpending[meal.type] = (mealTypeSpending[meal.type] || 0) + meal.price;
            totalMeals++;
          });
        });

        // Format data for charts
        const spendingByMeal = [
          { name: 'Breakfast', value: mealTypeSpending.breakfast, color: 'hsl(45, 90%, 55%)' },
          { name: 'Lunch', value: mealTypeSpending.lunch, color: 'hsl(142, 45%, 42%)' },
          { name: 'Dinner', value: mealTypeSpending.dinner, color: 'hsl(16, 85%, 65%)' },
          { name: 'Snacks', value: mealTypeSpending.snack, color: 'hsl(200, 70%, 55%)' },
        ].filter(item => item.value > 0);

        const dailySpending = plan.weeklyPlan.map((day: { day: string; totalCost: number }) => ({
          day: day.day.slice(0, 3),
          amount: day.totalCost,
        }));

        setAnalyticsData({
          totalBudget: plan.preferences.budgetPeriod === 'weekly' 
            ? plan.preferences.budget 
            : plan.preferences.budget * 7,
          totalSpent: plan.totalWeeklyCost,
          spendingByMeal,
          dailySpending,
          mealsPlanned: totalMeals,
          averageCostPerMeal: totalMeals > 0 ? plan.totalWeeklyCost / totalMeals : 0,
        });
      } catch (error) {
        console.error('Помилка завантаження аналітики:', error);
        setAnalyticsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
            Expense Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your meal planning spending and nutrition goals
          </p>
        </div>

        {isLoading ? (
          <Card variant="elevated" className="p-12 text-center">
            <p className="text-muted-foreground">Loading analytics...</p>
          </Card>
        ) : analyticsData ? (
          <div className="animate-fade-in">
            <AnalyticsPanel {...analyticsData} />
          </div>
        ) : (
          // Empty state when no meal plan exists
          <Card variant="elevated" className="p-12 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
                No data yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create a meal plan first to see your spending analytics and budget tracking
              </p>
              <Link to="/meal-planner">
                <Button variant="hero" size="lg">
                  Create Your First Plan
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Analytics;
