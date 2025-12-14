import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, UtensilsCrossed, PieChart, Wallet, Sparkles, Check } from 'lucide-react';
import gohanflowLogo from '@/assets/gohanflow-logo.png';

const Index = () => {
  const { user } = useAuth();

  const features = [
    { icon: UtensilsCrossed, title: 'Personalized Meals', description: 'Get meal suggestions tailored to your dietary preferences' },
    { icon: Wallet, title: 'Budget Control', description: 'Set your budget and we\'ll plan meals within your means' },
    { icon: PieChart, title: 'Track Spending', description: 'Monitor your food expenses with detailed analytics' },
    { icon: Sparkles, title: 'Smart Suggestions', description: 'AI-powered recommendations based on your goals' },
  ];

  const benefits = ['Save time with automated meal planning', 'Reduce food waste with precise portions', 'Achieve nutrition goals effortlessly', 'Stay within budget every week'];

  return (
    <div className="min-h-screen gradient-hero">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={gohanflowLogo} alt="GohanFlow" className="w-10 h-10 shadow-soft rounded-md" />
          <span className="font-display text-xl font-semibold text-foreground">GohanFlow</span>
        </div>
        <Link to={user ? '/dashboard' : '/auth'}>
          <Button variant={user ? 'soft' : 'hero'}>{user ? 'Dashboard' : 'Get Started'}<ArrowRight className="w-4 h-4" /></Button>
        </Link>
      </nav>

      <section className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />Smart meal planning made simple
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-foreground mb-6">
          Eat healthy, <span className="text-gradient">stay on budget</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Create personalized meal plans based on your dietary preferences, nutrition goals, and budget.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth"><Button variant="hero" size="xl">Start Planning Free<ArrowRight className="w-5 h-5" /></Button></Link>
          <Button variant="outline" size="xl">See How It Works</Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-lg">Powerful features to make meal planning effortless</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} variant="elevated" className="p-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-primary" /></div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <Card variant="elevated" className="p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-display font-semibold text-foreground mb-4">Why choose GohanFlow?</h2>
              <p className="text-muted-foreground mb-6">Join thousands who simplified their meal planning.</p>
              <Link to="/auth"><Button variant="coral" size="lg">Get Started Now<ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-4 h-4 text-primary" /></div>
                  <span className="text-sm text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <footer className="container mx-auto px-4 py-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={gohanflowLogo} alt="GohanFlow" className="w-8 h-8 rounded-md" />
          <span className="font-display font-medium text-foreground">GohanFlow</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2024 GohanFlow. Eat well, live well.</p>
      </footer>
    </div>
  );
};

export default Index;
