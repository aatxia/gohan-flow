import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import NotificationCenter from '@/components/NotificationCenter';
import gohanflowLogo from '@/assets/gohanflow-logo.png';
import { LayoutDashboard, UtensilsCrossed, PieChart, ShoppingCart, ChefHat, Heart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
const Navbar = () => {
  const {
    user,
    logout
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [{
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  }, {
    path: '/meal-planner',
    label: 'Meal Plan',
    icon: UtensilsCrossed
  }, {
    path: '/recipes',
    label: 'Recipes',
    icon: ChefHat
  }, {
    path: '/shopping-list',
    label: 'Shopping',
    icon: ShoppingCart
  }, {
    path: '/analytics',
    label: 'Analytics',
    icon: PieChart
  }, {
    path: '/health',
    label: 'Health',
    icon: Heart
  }];
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  const isActive = (path: string) => location.pathname === path;
  return <nav className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <img src={gohanflowLogo} alt="GohanFlow" className="w-10 h-10 shadow-soft group-hover:shadow-elevated transition-shadow rounded-md" />
            <span className="font-display text-xl font-semibold text-foreground">
              GohanFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && <div className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
            const Icon = item.icon;
            return <Link key={item.path} to={item.path}>
                    <Button variant={isActive(item.path) ? 'soft' : 'ghost'} size="sm" className="gap-2">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>;
          })}
            </div>}

          {/* User actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? <>
                <NotificationCenter />
                <Link to="/profile">
                  <Button variant={isActive('/profile') ? 'soft' : 'ghost'} size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </> : <Link to="/auth">
                <Button variant="default" size="sm">Get Started</Button>
              </Link>}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && <div className="md:hidden py-4 border-t border-border animate-fade-in">
            {user ? <div className="space-y-2">
                {navItems.map(item => {
            const Icon = item.icon;
            return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant={isActive(item.path) ? 'soft' : 'ghost'} className="w-full justify-start gap-3">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>;
          })}
                <hr className="border-border my-3" />
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive('/profile') ? 'soft' : 'ghost'} className="w-full justify-start gap-3">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </div> : <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">Get Started</Button>
              </Link>}
          </div>}
      </div>
    </nav>;
};
export default Navbar;