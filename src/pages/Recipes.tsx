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
import { getAllRecipes, getRecipeById, addRecipe, addCommentToRecipe, likeRecipe, getUserLikedRecipeIds, shareRecipe } from '@/services/recipeService';
import { getProfile } from '@/services/profileService';
import { AlertTriangle, Bookmark } from 'lucide-react';

const ALLERGY_KEYWORDS: Record<string, string[]> = {
  'Peanuts': ['peanut', 'peanuts', 'groundnut'],
  'Tree Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'brazil nut', 'pine nut', 'chestnut', 'nuts'],
  'Milk': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'whey', 'casein', 'dairy', 'mozzarella', 'parmesan', 'cheddar', 'feta', 'ricotta', 'ghee'],
  'Eggs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
  'Wheat': ['wheat', 'flour', 'bread', 'pasta', 'noodle', 'noodles', 'couscous', 'tortilla', 'cracker', 'breadcrumb', 'pita', 'baguette', 'croissant'],
  'Soy': ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso', 'soy sauce'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'sardine', 'anchovy', 'bass', 'trout', 'mackerel', 'halibut', 'swordfish', 'catfish'],
  'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'octopus', 'crawfish', 'shellfish'],
  'Sesame': ['sesame', 'tahini'],
};

function detectAllergens(recipe: Recipe, userAllergies: string[]): string[] {
  if (!userAllergies.length) return [];
  const found: string[] = [];
  const ingredientText = recipe.ingredients.map(i => i.name.toLowerCase()).join(' ');
  const nameText = recipe.name.toLowerCase();
  const combined = `${nameText} ${ingredientText}`;

  for (const allergy of userAllergies) {
    const keywords = ALLERGY_KEYWORDS[allergy];
    if (keywords && keywords.some(kw => combined.includes(kw))) {
      found.push(allergy);
    }
  }
  return found;
}

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
  const [userAllergies, setUserAllergies] = useState<string[]>([]);


  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const loadedRecipes = await getAllRecipes();
        setRecipes(loadedRecipes);
      } catch (error) {
        console.error('Failed to load recipes:', error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    const loadUserData = async () => {
      if (!user?.id) return;
      try {
        const [profile, liked] = await Promise.all([
          getProfile(user.id),
          getUserLikedRecipeIds(user.id),
        ]);
        if (profile?.allergies && Array.isArray(profile.allergies)) {
          setUserAllergies(profile.allergies);
        }
        setLikedRecipes(liked);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadRecipes();
    loadUserData();
  }, [user]);


  const filteredRecipes = recipes.filter(recipe => {
    if (recipe.status !== 'published') return false;
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedType === 'saved') return likedRecipes.has(recipe.id);
    if (selectedType === 'all') return true;
    return recipe.type === selectedType;
  });


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
        setRecipes(prev => prev.map(r => 
          r.id === recipeId ? { ...r, likes: result.likes } : r
        ));

        if (selectedRecipe?.id === recipeId) {
          setSelectedRecipe(prev => prev ? { ...prev, likes: result.likes } : null);
        }
        
        setLikedRecipes(prev => {
          const next = new Set(prev);
          if (result.isLiked) {
            next.add(recipeId);
          } else {
            next.delete(recipeId);
          }
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to like recipe:', error);
    }
  };


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


  const addComment = async () => {
    if (!selectedRecipe || !newComment.trim() || !user) return;
    
    try {
      const comment = await addCommentToRecipe(selectedRecipe.id, {
        userId: user.id,
        userName: user.name,
        content: newComment,
      });

      if (comment) {
        setNewComment('');
        toast({ title: 'Comment added!' });

        const fresh = await getRecipeById(selectedRecipe.id);
        if (fresh) {
          setSelectedRecipe(fresh);
          setRecipes(prev => prev.map(r => r.id === fresh.id ? fresh : r));
        } else {
          setRecipes(prev => prev.map(r => 
            r.id === selectedRecipe.id 
              ? { ...r, comments: [...r.comments, comment] }
              : r
          ));
          setSelectedRecipe(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };


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
      type: (formData.get('type') as Recipe['type']) || 'dinner',
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
      status: 'pending' as const,
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
              {user && (
                <TabsTrigger value="saved" className="gap-1">
                  <Bookmark className="w-3 h-3" />
                  Saved ({likedRecipes.size})
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const allergens = detectAllergens(recipe, userAllergies);
              return (
            <Card 
              key={recipe.id} 
              variant="meal" 
              className={`cursor-pointer group ${allergens.length > 0 ? 'ring-2 ring-amber-400/60' : ''}`}
              onClick={async () => {
                setSelectedRecipe(recipe);
                setIsDialogOpen(true);
                const fresh = await getRecipeById(recipe.id);
                if (fresh) {
                  setSelectedRecipe(fresh);
                  setRecipes(prev => prev.map(r => r.id === fresh.id ? fresh : r));
                }
              }}
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent relative">
                <Badge className="absolute top-3 left-3 capitalize">{recipe.type}</Badge>
                {allergens.length > 0 && (
                  <Badge className="absolute top-3 right-3 bg-amber-500 text-white hover:bg-amber-600 gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Allergens
                  </Badge>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat className="w-16 h-16 text-primary/30" />
                </div>
              </div>

              <CardContent className="p-4">
                {allergens.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs text-amber-700 dark:text-amber-400">
                      Contains: {allergens.join(', ')}
                    </span>
                  </div>
                )}
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

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>

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
                      {recipe.likes}
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
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRecipe?.name}</DialogTitle>
            </DialogHeader>
            
            {selectedRecipe && (
                          <div className="space-y-4">
                            {(() => {
                              const allergens = detectAllergens(selectedRecipe, userAllergies);
                              return allergens.length > 0 ? (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700">
                                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">Allergy Warning</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                      This recipe contains allergens you are sensitive to: <strong>{allergens.join(', ')}</strong>
                                    </p>
                                  </div>
                                </div>
                              ) : null;
                            })()}
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

                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter' && newComment.trim()) addComment(); }}
                                />
                                <Button size="icon" onClick={addComment} disabled={!newComment.trim()}>
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
          </DialogContent>
        </Dialog>

        {filteredRecipes.length === 0 && !isLoading && (
          <Card variant="glass" className="p-12 text-center">
            {selectedType === 'saved' ? (
              <>
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-medium text-foreground mb-2">
                  No saved recipes yet
                </h3>
                <p className="text-muted-foreground">Like recipes to save them here</p>
              </>
            ) : (
              <>
                <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-medium text-foreground mb-2">
                  No recipes found
                </h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default Recipes;
