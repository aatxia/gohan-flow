import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RECIPES, type Recipe } from '@/data/mockData';
import { 
  Search, Heart, MessageCircle, Clock, DollarSign, Flame, 
  Plus, ChefHat, Send, User, Share2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getAllRecipes, addRecipe, addCommentToRecipe, likeRecipe, shareRecipe } from '@/services/recipeService';

const Recipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());

  // Завантажити рецепти при завантаженні сторінки (тільки з БД)
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const loadedRecipes = await getAllRecipes();
        // Використовуємо тільки дані з бази даних
        setRecipes(loadedRecipes);
      } catch (error) {
        console.error('Помилка завантаження рецептів:', error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || recipe.type === selectedType;
    return matchesSearch && matchesType && recipe.status === 'published';
  });

  // Toggle like
  const toggleLike = async (recipeId: string) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to like recipes.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await likeRecipe(recipeId, user.id);
      if (result) {
        // Оновлюємо кількість лайків в локальному стані
        setRecipes(prev => prev.map(r => 
          r.id === recipeId ? { ...r, likes: result.likes } : r
        ));
        
        // Оновлюємо вибраний рецепт якщо він відкритий
        if (selectedRecipe?.id === recipeId) {
          setSelectedRecipe(prev => prev ? { ...prev, likes: result.likes } : null);
        }
        
        setLikedRecipes(prev => new Set(prev).add(recipeId));
      }
    } catch (error) {
      console.error('Помилка лайкування:', error);
    }
  };

  // Share recipe
  const handleShareRecipe = async (recipeId: string) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to share recipes.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await shareRecipe(user.id, recipeId);
      if (result) {
        toast({
          title: 'Recipe shared!',
          description: 'This recipe has been added to your profile.',
        });
      }
    } catch (error) {
      console.error('Помилка поширення рецепту:', error);
      toast({
        title: 'Error',
        description: 'Failed to share recipe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Add comment
  const addComment = async () => {
    if (!selectedRecipe || !newComment.trim() || !user) return;
    
    try {
      const comment = await addCommentToRecipe(selectedRecipe.id, {
        userId: user.id,
        userName: user.name,
        content: newComment,
      });

      if (comment) {
        // Оновлюємо рецепти в локальному стані
        setRecipes(prev => prev.map(r => 
          r.id === selectedRecipe.id 
            ? { ...r, comments: [...r.comments, comment] }
            : r
        ));
        setSelectedRecipe(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        setNewComment('');
        toast({ title: 'Comment added!' });
      }
    } catch (error) {
      console.error('Помилка додавання коментаря:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Submit recipe for moderation
  const submitRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a recipe.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const recipeData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string || 'dinner',
      prepTime: parseInt(formData.get('prepTime') as string) || 0,
      cookTime: parseInt(formData.get('cookTime') as string) || 0,
      ingredients: (formData.get('ingredients') as string).split('\n').map(line => ({
        name: line.trim(),
        quantity: '',
        price: 0,
      })),
      instructions: (formData.get('instructions') as string).split('\n').filter(line => line.trim()),
      authorId: user.id,
      authorName: user.name,
      status: 'pending',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      price: 0,
      servings: 1,
      tags: [],
    };

    try {
      const savedRecipe = await addRecipe(recipeData);
      if (savedRecipe) {
        toast({
          title: 'Recipe submitted!',
          description: 'Your recipe is pending moderation and will be published soon.',
        });
        // Оновлюємо список рецептів
        setRecipes(prev => [savedRecipe, ...prev]);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to submit recipe. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Помилка додавання рецепту:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit recipe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
              Recipes
            </h1>
            <p className="text-muted-foreground">Discover and share delicious recipes</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Submit Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Submit Your Recipe</DialogTitle>
              </DialogHeader>
              <form onSubmit={submitRecipe} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="e.g., Homemade Pasta" 
                    required 
                    minLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    placeholder="Describe your recipe in detail..." 
                    required 
                    minLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Meal Type *</Label>
                  <select 
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (min) *</Label>
                    <Input 
                      id="prepTime"
                      name="prepTime"
                      type="number" 
                      placeholder="15" 
                      required 
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time (min) *</Label>
                    <Input 
                      id="cookTime"
                      name="cookTime"
                      type="number" 
                      placeholder="30" 
                      required 
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients (one per line) *</Label>
                  <Textarea 
                    id="ingredients"
                    name="ingredients"
                    placeholder="200g pasta&#10;2 eggs&#10;100g cheese" 
                    required 
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: quantity name (e.g., "200g pasta" or "2 eggs")
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (one step per line) *</Label>
                  <Textarea 
                    id="instructions"
                    name="instructions"
                    placeholder="1. Boil water&#10;2. Cook pasta&#10;3. Mix ingredients" 
                    required 
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full">Submit for Review</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
              <TabsTrigger value="snack">Snack</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
            <Card 
              key={recipe.id} 
              variant="meal" 
              className="cursor-pointer group"
              onClick={() => {
                setSelectedRecipe(recipe);
                setIsDialogOpen(true);
              }}
            >
              {/* Recipe Header */}
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent relative">
                <Badge className="absolute top-3 left-3 capitalize">{recipe.type}</Badge>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat className="w-16 h-16 text-primary/30" />
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold text-foreground line-clamp-1">
                    {recipe.name}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 -mr-2"
                    onClick={(e) => { e.stopPropagation(); toggleLike(recipe.id); }}
                  >
                    <Heart className={`w-4 h-4 ${likedRecipes.has(recipe.id) ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {recipe.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime + recipe.cookTime}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {recipe.calories} cal
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${recipe.price.toFixed(2)}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>

                {/* Author and Engagement */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {recipe.authorName}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(recipe.id); }}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Heart className={`w-3 h-3 ${likedRecipes.has(recipe.id) ? 'fill-destructive text-destructive' : ''}`} />
                      {recipe.likes + (likedRecipes.has(recipe.id) ? 1 : 0)}
                    </button>
                    {user && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShareRecipe(recipe.id); }}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        title="Share in your profile"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {recipe.comments.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Recipe Detail Dialog - відкривається при кліку на рецепт */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRecipe?.name}</DialogTitle>
            </DialogHeader>
            
            {selectedRecipe && (
                          <div className="space-y-4">
                            {/* Recipe Details */}
                            <div className="space-y-3">
                              <p className="text-muted-foreground">{selectedRecipe.description}</p>
                              
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-accent">
                                  <div className="font-semibold text-foreground">{selectedRecipe.calories}</div>
                                  <div className="text-xs text-muted-foreground">Calories</div>
                                </div>
                                <div className="p-2 rounded-lg bg-accent">
                                  <div className="font-semibold text-foreground">{selectedRecipe.protein}g</div>
                                  <div className="text-xs text-muted-foreground">Protein</div>
                                </div>
                                <div className="p-2 rounded-lg bg-accent">
                                  <div className="font-semibold text-foreground">{selectedRecipe.carbs}g</div>
                                  <div className="text-xs text-muted-foreground">Carbs</div>
                                </div>
                                <div className="p-2 rounded-lg bg-accent">
                                  <div className="font-semibold text-foreground">{selectedRecipe.fat}g</div>
                                  <div className="text-xs text-muted-foreground">Fat</div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-foreground mb-2">Ingredients</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {selectedRecipe.ingredients.map((ing, i) => (
                                    <li key={i}>• {ing.quantity} {ing.name}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-foreground mb-2">Instructions</h4>
                                <ol className="text-sm text-muted-foreground space-y-2">
                                  {selectedRecipe.instructions.map((step, i) => (
                                    <li key={i}>{i + 1}. {step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>

                            {/* Comments */}
                            <div className="border-t border-border pt-4">
                              <h4 className="font-medium text-foreground mb-3">
                                Comments ({selectedRecipe.comments.length})
                              </h4>
                              
                              <div className="space-y-3 mb-4">
                                {selectedRecipe.comments.map(comment => (
                                  <div key={comment.id} className="p-3 rounded-lg bg-accent">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm">{comment.userName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                                  </div>
                                ))}
                                {selectedRecipe.comments.length === 0 && (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    No comments yet. Be the first!
                                  </p>
                                )}
                              </div>

                              {/* Add Comment */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button size="icon" onClick={addComment}>
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
          </DialogContent>
        </Dialog>

        {filteredRecipes.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-2">
              No recipes found
            </h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Recipes;
