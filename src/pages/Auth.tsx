import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { isFirebaseReady } from '@/config/firebaseConfig';
import gohanflowLogo from '@/assets/gohanflow-logo.png';

const emailSchema = z.string().email('Please enter a valid email address').max(255);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(100);
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [firebaseReady, setFirebaseReady] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setFirebaseReady(isFirebaseReady());
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0].message;
    }

    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.issues[0].message;
    }

    if (!isLogin) {
      const nameResult = nameSchema.safeParse(formData.name);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.issues[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Login failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      } else {
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          toast({
            title: 'Account created!',
            description: 'Welcome to GohanFlow. Let\'s get started!',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Registration failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="container mx-auto px-4 py-6">
        <a href="/" className="flex items-center gap-2 w-fit">
          <img src={gohanflowLogo} alt="GohanFlow" className="w-10 h-10 shadow-soft rounded-md" />
          <span className="font-display text-xl font-semibold text-foreground">GohanFlow</span>
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-scale-up">
          <Card variant="elevated" className="shadow-elevated">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-display">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Enter your credentials to access your meal plans' 
                  : 'Start your journey to healthier eating'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!firebaseReady && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Firebase not configured</AlertTitle>
                  <AlertDescription>
                    Please update <code className="text-xs">src/config/firebaseConfig.ts</code> with your Firebase credentials.
                    See <code className="text-xs">FIREBASE_SETUP_GUIDE.md</code> for instructions.
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full mt-6"
                  disabled={isLoading || !firebaseReady}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                    className="ml-1 text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              {isLogin && (
                <div className="mt-4 p-3 rounded-lg bg-accent text-sm text-center">
                  <p className="text-muted-foreground">Demo credentials:</p>
                  <p className="text-foreground font-mono">demo@mealplan.com / demo123</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
