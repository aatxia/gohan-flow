import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { DIETARY_PREFERENCES, CALORIE_GOALS } from '@/data/mockData';
import { User, Mail, Calendar, Target, DollarSign, Utensils, AlertCircle, Save, LogOut, ChefHat, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getProfile, saveProfile } from '@/services/profileService';
import { getSharedRecipes } from '@/services/recipeService';
import { Link } from 'react-router-dom';

interface ProfileData {
  name: string;
  email: string;
  age: number;
  dietaryPreference: string;
  calorieGoal: number;
  budgetDaily: number;
  budgetPeriod: 'daily' | 'weekly' | 'monthly';
  mealsPerDay: number;
  allergies: string[];
}

const ALLERGY_OPTIONS = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 
  'Soy', 'Fish', 'Shellfish', 'Sesame'
];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    age: 30,
    dietaryPreference: 'none',
    calorieGoal: 2000,
    budgetDaily: 15,
    budgetPeriod: 'daily',
    mealsPerDay: 3,
    allergies: [],
  });

  const [customCalories, setCustomCalories] = useState(false);
  const [sharedRecipes, setSharedRecipes] = useState<Array<{
    id: string;
    name: string;
    description: string;
    likes: number;
    comments?: Array<{ id: string }>;
  }>>([]);

  // Load saved profile from API
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        const savedProfile = await getProfile(user.id);
        if (savedProfile) {
          setProfile(prev => ({ ...prev, ...savedProfile }));
          if (!CALORIE_GOALS.some(g => g.calories === savedProfile.calorieGoal && g.id !== 'custom')) {
            setCustomCalories(true);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження профілю:', error);
      }
    };

    loadProfile();
    
    // Завантажити поширені рецепти
    const loadSharedRecipes = async () => {
      if (!user?.id) return;
      
      try {
        const recipes = await getSharedRecipes(user.id);
        setSharedRecipes(recipes);
      } catch (error) {
        console.error('Помилка завантаження поширених рецептів:', error);
      }
    };
    
    loadSharedRecipes();
  }, [user]);

  // Save profile to API
  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save your profile.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const saved = await saveProfile({
        userId: user.id,
        ...profile,
      });

      if (saved) {
        toast({ 
          title: 'Profile saved!', 
          description: 'Your preferences have been updated.' 
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save profile. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Помилка збереження профілю:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Toggle allergy
  const toggleAllergy = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
              Your Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your preferences and account settings
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Age: {profile.age} years</Label>
                <Slider
                  value={[profile.age]}
                  onValueChange={([value]) => setProfile(prev => ({ ...prev, age: value }))}
                  min={16}
                  max={100}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dietary Preferences */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                Dietary Preferences
              </CardTitle>
              <CardDescription>Select your dietary restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DIETARY_PREFERENCES.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => setProfile(prev => ({ ...prev, dietaryPreference: pref.id }))}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${
                      profile.dietaryPreference === pref.id
                        ? 'border-primary bg-primary/10 shadow-soft'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    <div className="font-medium text-foreground">{pref.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{pref.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Food Allergies
              </CardTitle>
              <CardDescription>Select any food allergies you have</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map((allergy) => (
                  <button
                    key={allergy}
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      profile.allergies.includes(allergy)
                        ? 'bg-destructive/20 text-destructive border border-destructive/30'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
              {profile.allergies.length > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Selected: {profile.allergies.join(', ')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Calorie Goals */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Calorie Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CALORIE_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => {
                      if (goal.id === 'custom') {
                        setCustomCalories(true);
                      } else {
                        setCustomCalories(false);
                        setProfile(prev => ({ ...prev, calorieGoal: goal.calories }));
                      }
                    }}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${
                      (goal.id !== 'custom' && profile.calorieGoal === goal.calories && !customCalories) ||
                      (goal.id === 'custom' && customCalories)
                        ? 'border-primary bg-primary/10 shadow-soft'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    <div className="font-medium text-foreground">{goal.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{goal.description}</div>
                  </button>
                ))}
              </div>
              
              {customCalories && (
                <div className="space-y-2 pt-4 animate-fade-in">
                  <Label>Custom calories: {profile.calorieGoal} cal/day</Label>
                  <Slider
                    value={[profile.calorieGoal]}
                    onValueChange={([value]) => setProfile(prev => ({ ...prev, calorieGoal: value }))}
                    min={1000}
                    max={4000}
                    step={50}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Settings */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Budget Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Amount ($)</Label>
                  <Input
                    type="number"
                    value={profile.budgetDaily}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      budgetDaily: parseFloat(e.target.value) || 0 
                    }))}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget Period</Label>
                  <RadioGroup
                    value={profile.budgetPeriod}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      setProfile(prev => ({ ...prev, budgetPeriod: value }))
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
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Meals per day: {profile.mealsPerDay}</Label>
                <Slider
                  value={[profile.mealsPerDay]}
                  onValueChange={([value]) => setProfile(prev => ({ ...prev, mealsPerDay: value }))}
                  min={2}
                  max={6}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2 meals</span>
                  <span>6 meals</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shared Recipes */}
          {sharedRecipes.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  My Shared Recipes
                </CardTitle>
                <CardDescription>
                  Recipes you've shared in your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {sharedRecipes.map((recipe) => (
                    <Link key={recipe.id} to={`/recipes`}>
                      <Card variant="glass" className="p-4 hover:shadow-elevated transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{recipe.name}</h4>
                          <ChefHat className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{recipe.likes} likes</span>
                          <span>•</span>
                          <span>{recipe.comments?.length || 0} comments</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <Button onClick={handleSaveProfile} className="w-full" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
