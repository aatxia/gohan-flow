import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Utensils, Target, Wallet } from 'lucide-react';

interface AnalyticsPanelProps {
  totalBudget: number;
  totalSpent: number;
  spendingByMeal: { name: string; value: number; color: string }[];
  dailySpending: { day: string; amount: number }[];
  mealsPlanned: number;
  averageCostPerMeal: number;
}

// AnalyticsPanel component displays budget and spending analytics
const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  totalBudget,
  totalSpent,
  spendingByMeal,
  dailySpending,
  mealsPlanned,
  averageCostPerMeal,
}) => {
  const remaining = totalBudget - totalSpent;
  const percentSpent = (totalSpent / totalBudget) * 100;
  const isOverBudget = remaining < 0;

  // Stat card component for reusability
  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subtext, 
    trend 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string; 
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card variant="glass" className="p-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-primary' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
             trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-display font-semibold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Budget"
          value={`$${totalBudget.toFixed(2)}`}
          subtext="Weekly allocation"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          trend={percentSpent > 80 ? 'down' : 'neutral'}
        />
        <StatCard
          icon={Utensils}
          label="Meals Planned"
          value={mealsPlanned.toString()}
          subtext={`$${averageCostPerMeal.toFixed(2)} avg/meal`}
        />
        <StatCard
          icon={Target}
          label="Remaining"
          value={`$${Math.abs(remaining).toFixed(2)}`}
          subtext={isOverBudget ? 'Over budget' : 'Available'}
          trend={isOverBudget ? 'down' : 'up'}
        />
      </div>

      {/* Budget Progress */}
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Budget Usage
            <span className={`text-sm font-normal ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
              {percentSpent.toFixed(1)}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={Math.min(percentSpent, 100)} 
            className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>$0</span>
            <span>${totalBudget.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Spending by Meal Type */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Spending by Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByMeal}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {spendingByMeal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {spendingByMeal.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Spending */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpending}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
