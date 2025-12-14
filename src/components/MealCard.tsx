import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Coins } from 'lucide-react';
import type { Meal } from '@/data/mockData';

interface MealCardProps {
  meal: Meal;
  showDetails?: boolean;
  onSelect?: () => void;
  selected?: boolean;
}

// MealCard component displays individual meal information
const MealCard: React.FC<MealCardProps> = ({ meal, showDetails = false, onSelect, selected }) => {
  // Format meal type for display
  const mealTypeColors = {
    breakfast: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
    lunch: 'bg-primary/20 text-primary border-primary/30',
    dinner: 'bg-secondary/20 text-secondary border-secondary/30',
    snack: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  };

  return (
    <Card
      variant="meal"
      className={`cursor-pointer ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      onClick={onSelect}
    >
      {/* Meal image placeholder with gradient */}
      <div className={`h-32 ${mealTypeColors[meal.type].split(' ')[0]} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{
            meal.type === 'breakfast' ? '🍳' :
            meal.type === 'lunch' ? '🥗' :
            meal.type === 'dinner' ? '🍽️' : '🍎'
          }</span>
        </div>
        <Badge 
          className={`absolute top-3 left-3 ${mealTypeColors[meal.type]} border`}
          variant="outline"
        >
          {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-1">
          {meal.name}
        </h3>

        {/* Quick stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-secondary" />
            <span>{meal.calories} cal</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{meal.prepTime}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-chart-3" />
            <span>${meal.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {meal.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Expanded details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-accent">
                <div className="text-xs text-muted-foreground">Protein</div>
                <div className="font-semibold text-foreground">{meal.protein}g</div>
              </div>
              <div className="p-2 rounded-lg bg-accent">
                <div className="text-xs text-muted-foreground">Carbs</div>
                <div className="font-semibold text-foreground">{meal.carbs}g</div>
              </div>
              <div className="p-2 rounded-lg bg-accent">
                <div className="text-xs text-muted-foreground">Fat</div>
                <div className="font-semibold text-foreground">{meal.fat}g</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Ingredients</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {meal.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{ingredient.name} ({ingredient.quantity})</span>
                    <span className="text-foreground">${ingredient.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealCard;
