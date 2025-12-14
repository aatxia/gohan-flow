import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MealCard from '@/components/MealCard';
import { MEALS, type Meal } from '@/data/mockData';
import { 
  UtensilsCrossed, 
  PieChart, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { getCurrentMealPlan } from '@/services/mealPlanService';

// Dashboard page - main hub for authenticated users
const Dashboard = () => {
  const { user } = useAuth();
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [greeting, setGreeting] = useState('');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Load saved meal plan from API
  useEffect(() => {
    const loadMealPlan = async () => {
      if (!user?.id) {
        // Show sample meals for non-authenticated users
        setTodaysMeals([MEALS[0], MEALS[4], MEALS[8]]);
        return;
      }

      try {
        const plan = await getCurrentMealPlan(user.id);
        if (plan && plan.weeklyPlan) {
          // Get today's meals from the saved plan
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const todayPlan = plan.weeklyPlan.find((d: { day: string }) => d.day === today);
          if (todayPlan) {
            setTodaysMeals(todayPlan.meals);
          } else {
            // If no plan for today, show sample meals
            setTodaysMeals([MEALS[0], MEALS[4], MEALS[8]]);
          }
        } else {
          // Show sample meals for new users
          setTodaysMeals([MEALS[0], MEALS[4], MEALS[8]]);
        }
      } catch (error) {
        console.error('Помилка завантаження плану:', error);
        // Show sample meals on error
        setTodaysMeals([MEALS[0], MEALS[4], MEALS[8]]);
      }
    };

    loadMealPlan();
  }, [user]);

  // Quick stats data
  const stats = [
    { icon: Calendar, label: 'This Week', value: '21 meals', color: 'text-primary' },
    { icon: TrendingUp, label: 'Budget Used', value: '68%', color: 'text-chart-3' },
    { icon: Clock, label: 'Prep Time', value: '~45min/day', color: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
            {greeting}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's your meal planning overview for today
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.label} 
                variant="glass" 
                className="p-5 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-semibold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          <Card variant="elevated" className="p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
              </div>
              <Sparkles className="w-5 h-5 text-chart-3" />
            </div>
            <CardTitle className="text-xl mb-2">Create New Plan</CardTitle>
            <p className="text-muted-foreground text-sm mb-4">
              Generate a personalized meal plan based on your preferences and budget
            </p>
            <Link to="/meal-planner">
              <Button variant="hero" className="w-full">
                Start Planning
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          <Card variant="elevated" className="p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center">
                <PieChart className="w-6 h-6 text-secondary-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">View Analytics</CardTitle>
            <p className="text-muted-foreground text-sm mb-4">
              Track your spending, nutrition goals, and meal planning progress
            </p>
            <Link to="/analytics">
              <Button variant="coral" className="w-full">
                See Analytics
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </section>

        {/* Today's Meals */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Today's Meals
            </h2>
            <Link to="/meal-planner">
              <Button variant="ghost" size="sm">
                View Full Plan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {todaysMeals.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {todaysMeals.map((meal, idx) => (
                <div 
                  key={meal.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${500 + idx * 100}ms` }}
                >
                  <MealCard meal={meal} />
                </div>
              ))}
            </div>
          ) : (
            <Card variant="glass" className="p-8 text-center">
              <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                No meals planned yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first meal plan to see today's meals here
              </p>
              <Link to="/meal-planner">
                <Button variant="default">Create Meal Plan</Button>
              </Link>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
