import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HEALTH_RECOMMENDATIONS, type HealthData } from '@/data/mockData';
import { 
  Activity, Heart, Droplets, Pill, AlertTriangle, 
  CheckCircle2, Info, Save, TrendingUp, TrendingDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getWhoAdvice } from '@/services/whoAdviceService';

const Health = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthData>({
    vitaminD: undefined,
    vitaminB12: undefined,
    iron: undefined,
    bloodSugar: undefined,
    cholesterol: undefined,
    hemoglobin: undefined,
  });

  const [savedData, setSavedData] = useState<HealthData | null>(null);
  const [whoAdvice, setWhoAdvice] = useState<Array<{
    id?: string;
    title: string;
    description?: string;
    message?: string;
    icon?: string;
  }>>([]);

  // Завантажити поради ВООЗ з бази даних
  useEffect(() => {
    const loadWhoAdvice = async () => {
      if (!user?.id) return;
      
      try {
        const advice = await getWhoAdvice(user.id);
        setWhoAdvice(advice);
      } catch (error) {
        console.error('Помилка завантаження порад ВООЗ:', error);
      }
    };
    
    loadWhoAdvice();
  }, [user]);

  // Save health data
  const saveHealthData = () => {
    setSavedData(healthData);
    localStorage.setItem('gohanflow_health', JSON.stringify(healthData));
    toast({ title: 'Health data saved!', description: 'Your recommendations have been updated.' });
  };

  // Get recommendation for a specific metric
  const getRecommendation = (metric: keyof typeof HEALTH_RECOMMENDATIONS, value: number | undefined) => {
    if (value === undefined || !(metric in HEALTH_RECOMMENDATIONS)) return null;
    
    const rec = HEALTH_RECOMMENDATIONS[metric] as { low: { threshold: number; message: string }; normal?: { threshold: number; message: string }; high?: { threshold: number; message: string } };
    if (value < rec.low.threshold) {
      return { status: 'low', message: rec.low.message, color: 'text-amber-500' };
    }
    if (metric === 'bloodSugar' && rec.high && value > rec.high.threshold) {
      return { status: 'high', message: rec.high.message, color: 'text-destructive' };
    }
    return { status: 'normal', message: rec.normal?.message || 'Levels are within healthy range.', color: 'text-primary' };
  };

  // Health metrics configuration
  const metrics = [
    { key: 'vitaminD', label: 'Vitamin D', unit: 'ng/mL', icon: Pill, range: '30-100' },
    { key: 'vitaminB12', label: 'Vitamin B12', unit: 'pg/mL', icon: Pill, range: '200-900' },
    { key: 'iron', label: 'Iron', unit: 'μg/dL', icon: Droplets, range: '60-170' },
    { key: 'bloodSugar', label: 'Blood Sugar (Fasting)', unit: 'mg/dL', icon: Activity, range: '70-100' },
    { key: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', icon: Heart, range: '<200' },
    { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', icon: Droplets, range: '12-17' },
  ];

  // Food recommendations based on WHO guidelines
  const nutritionTips = [
    { title: 'Eat Plenty of Vegetables', description: 'Aim for at least 400g of fruits and vegetables daily', icon: '🥗' },
    { title: 'Limit Sugar Intake', description: 'Keep added sugars below 10% of total energy intake', icon: '🍭' },
    { title: 'Choose Whole Grains', description: 'Replace refined grains with whole grain alternatives', icon: '🌾' },
    { title: 'Reduce Salt', description: 'Keep sodium intake below 5g per day', icon: '🧂' },
    { title: 'Healthy Fats', description: 'Replace saturated fats with unsaturated fats', icon: '🥑' },
    { title: 'Stay Hydrated', description: 'Drink 2-3 liters of water daily', icon: '💧' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
            Health & Recommendations
          </h1>
          <p className="text-muted-foreground">
            Track your health metrics and get personalized nutrition guidance
          </p>
        </div>

        {/* Disclaimer */}
        <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600">Educational Information Only</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            The recommendations provided are for educational purposes only and are not medical advice. 
            Always consult with healthcare professionals for medical decisions.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Health Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Enter Your Health Data
                </CardTitle>
                <CardDescription>
                  Input your latest health analysis results (mock data only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {metrics.map(({ key, label, unit, icon: Icon, range }) => (
                    <div key={key} className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {label}
                        <span className="text-xs text-muted-foreground">({range} {unit})</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder={`Enter ${label}`}
                        value={healthData[key as keyof HealthData] || ''}
                        onChange={(e) => setHealthData(prev => ({
                          ...prev,
                          [key]: e.target.value ? parseFloat(e.target.value) : undefined
                        }))}
                      />
                    </div>
                  ))}
                </div>
                <Button className="mt-6 w-full" onClick={saveHealthData}>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Get Recommendations
                </Button>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {savedData && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Your Personalized Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(savedData).map(([key, value]) => {
                    if (value === undefined) return null;
                    const rec = getRecommendation(key as keyof typeof HEALTH_RECOMMENDATIONS, value);
                    if (!rec) return null;

                    const metric = metrics.find(m => m.key === key);
                    const Icon = metric?.icon || Activity;

                    return (
                      <div key={key} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            rec.status === 'normal' ? 'bg-primary/10' : 
                            rec.status === 'low' ? 'bg-amber-500/10' : 'bg-destructive/10'
                          }`}>
                            {rec.status === 'normal' ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : rec.status === 'low' ? (
                              <TrendingDown className="w-5 h-5 text-amber-500" />
                            ) : (
                              <TrendingUp className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{metric?.label}</span>
                              <Badge variant={rec.status === 'normal' ? 'default' : 'secondary'}>
                                {value} {metric?.unit}
                              </Badge>
                              <Badge variant="outline" className={rec.color}>
                                {rec.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {Object.values(savedData).every(v => v === undefined) && (
                    <p className="text-center text-muted-foreground py-4">
                      Enter your health data above to receive personalized recommendations
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* WHO Guidelines Sidebar */}
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                WHO Nutrition Tips
              </h3>
              <div className="space-y-4">
                {whoAdvice.length > 0 ? (
                  whoAdvice.map((advice) => (
                    <div key={advice.id} className="flex gap-3">
                      <span className="text-2xl">{advice.icon || '💡'}</span>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{advice.title}</h4>
                        <p className="text-xs text-muted-foreground">{advice.description || advice.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback до статичних порад якщо немає в БД
                  nutritionTips.map((tip, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card variant="glass" className="p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Daily Targets
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fruits & Vegetables</span>
                    <span className="text-foreground">400g+</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Water Intake</span>
                    <span className="text-foreground">2-3L</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fiber</span>
                    <span className="text-foreground">25-30g</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Health;
