import Navigation from "@/components/Navigation";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recipesService } from "@/services/recipes.service";
import { savedRecipesService } from "@/services/saved-recipes.service";
import { feedbackService } from "@/services/feedback.service";
import CookingSessionTracker from "@/components/CookingSessionTracker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Users, Star, ChevronLeft, Bookmark, Edit, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatCookingTime } from "@/lib/api-utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Feedback } from "@/types/api.types";

export default function RecipeDetail() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const qc = useQueryClient();
  
  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => recipesService.getById(id),
    enabled: !!id,
  });

  const { data: feedbacks = [], isLoading: feedbacksLoading, isError: feedbacksError } = useQuery<Feedback[]>({
    queryKey: ["feedbacks", id],
    queryFn: () => feedbackService.getByRecipe(id),
    enabled: !!id,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load reviews'
    }
  });

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ["saved-recipes"],
    queryFn: () => savedRecipesService.list(),
    enabled: !!user,
  });

  const [saving, setSaving] = useState(false);
  
  // Check if current recipe is saved
  const savedRecipe = savedRecipes.find(sr => String(sr.recipe_id) === id);
  const savedId = savedRecipe?.id || null;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  // Check if user has already reviewed this recipe
  const userFeedback = feedbacks.find(fb => fb.user?.id === user?.id);
  const isUpdatingReview = !!userFeedback;

  // Pre-populate form with existing review
  useEffect(() => {
    if (userFeedback && !rating && !comment) {
      setRating(userFeedback.rating);
      setComment(userFeedback.comment || "");
    }
  }, [userFeedback, rating, comment]);

  const totalMins = useMemo(() => {
    if (!recipe) return 0;
    return (recipe.preparation_time || 0) + (recipe.cooking_time || 0);
  }, [recipe]);

  const image = useMemo(() => recipesService.getCardImage(recipe?.image_url), [recipe?.image_url]);
  const avgRating = recipe?.average_rating ?? 0;

  const steps = useMemo(() => {
    // Use structured steps if available (new format)
    if (recipe?.steps && recipe.steps.length > 0) {
      return recipe.steps
        .sort((a, b) => a.step_number - b.step_number)
        .map(step => step.instruction_text);
    }
    
    // Fall back to parsing instructions string (old format)
    const raw = recipe?.instructions || "";
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return lines;
  }, [recipe?.steps, recipe?.instructions]);

  // Announce steps loaded once
  const [announced, setAnnounced] = useState(false);
  useEffect(() => {
    if (!recipe || announced) return;
    if (steps.length > 0) {
      toast({
        title: t('recipeDetail.loadedSteps').replace('{count}', steps.length.toString()),
        description: `${recipe.servings || 0} ${t('recipeDetail.servings')} • ${totalMins ? formatCookingTime(totalMins) : '-'}`,
      });
    } else {
      toast({ title: t('recipeDetail.noStepsProvided'), description: t('recipeDetail.noStepsCheck') });
    }
    setAnnounced(true);
  }, [recipe, steps.length, announced, totalMins]);

  const onSave = async () => {
    if (!recipe) return;
    try {
      setSaving(true);
      if (savedId) {
        await savedRecipesService.delete(String(savedId));
        toast({ title: t('recipeDetail.removed'), description: t('recipeDetail.recipeRemoved') });
      } else {
        await savedRecipesService.save(String(recipe.id));
        toast({ title: t('recipeDetail.saved'), description: t('recipeDetail.recipeAdded') });
      }
      // Refresh saved recipes query to update UI
      qc.invalidateQueries({ queryKey: ["saved-recipes"] });
    } catch (err: any) {
      toast({ title: t('recipeDetail.actionFailed'), description: err?.message || t('recipeDetail.unableToUpdate'), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitFeedbackMut = useMutation({
    mutationFn: () => {
      if (isUpdatingReview && userFeedback) {
        // Update existing review
        return feedbackService.update(String(userFeedback.id), { 
          rating, 
          comment: comment || undefined 
        });
      } else {
        // Create new review
        return feedbackService.create({ 
          recipe_id: id, 
          rating, 
          comment: comment || undefined 
        });
      }
    },
    onSuccess: () => {
      const actionText = isUpdatingReview ? 'updated' : 'submitted';
      toast({ 
        title: `Review ${actionText}!`, 
        description: isUpdatingReview ? 'Your review has been updated.' : t('recipeDetail.thankYou') 
      });
      // Don't clear form for updates, keep the values
      if (!isUpdatingReview) {
        setRating(0);
        setComment("");
      }
      qc.invalidateQueries({ queryKey: ["feedbacks", id] });
      qc.invalidateQueries({ queryKey: ["recipe", id] });
    },
    onError: (err: any) => {
      const actionText = isUpdatingReview ? 'update' : 'submit';
      toast({ 
        title: `Failed to ${actionText} review`, 
        description: err?.message || t('recipeDetail.unableToSubmit'), 
        variant: "destructive" 
      });
    },
  });

  const handleSubmitFeedback = () => {
    if (!user) {
      toast({ title: t('recipeDetail.loginRequired'), description: t('recipeDetail.pleaseLogin'), variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: t('recipeDetail.ratingRequired'), description: t('recipeDetail.selectRating'), variant: "destructive" });
      return;
    }
    submitFeedbackMut.mutate();
  };

  const handleDeleteReview = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await feedbackService.delete(String(feedbackId));
      toast({ title: 'Review deleted', description: 'Your review has been removed.' });
      qc.invalidateQueries({ queryKey: ["feedbacks", id] });
      qc.invalidateQueries({ queryKey: ["recipe", id] });
      setRating(0);
      setComment("");
    } catch (err: any) {
      toast({ title: 'Failed to delete', description: err?.message || 'Unable to delete review', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6 py-6 md:py-8">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link to="/discover"><ChevronLeft className="w-4 h-4 mr-2" /> {t('recipeDetail.back')}</Link>
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-xl bg-muted animate-pulse" />
              <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            </div>
          )}

          {isError && (
            <div className="text-destructive">{t('recipeDetail.failedToLoad')}</div>
          )}

          {recipe && (
            <div className="space-y-6">
              {/* Hero Section - Two Column on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Image */}
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="aspect-[4/3]">
                    <img 
                      src={image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>

                {/* Right: Title & Meta */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{recipe.title}</h1>
                    <div className="flex gap-2 flex-shrink-0">
                      {user && recipe.created_by === user.id && (
                        <Button size="icon" variant="ghost" asChild>
                          <Link to={`/recipes/${id}/edit`}><Edit className="w-5 h-5" /></Link>
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant={savedId ? "default" : "ghost"}
                        onClick={onSave} 
                        disabled={saving || !user}
                        className={`transition-all duration-200 ${savedId ? 'bg-primary hover:bg-primary/90 shadow-lg' : 'hover:bg-accent'}`}
                        title={savedId ? t('recipeDetail.removeSaved') : t('recipeDetail.saveRecipe')}
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Bookmark className={`w-5 h-5 transition-transform duration-200 ${
                            savedId ? 'fill-current scale-110' : 'hover:scale-110'
                          }`} />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 
                      <span className="font-semibold">{Number(avgRating.toFixed ? (avgRating as any).toFixed(1) : avgRating)}</span>
                      <span className="text-sm text-muted-foreground">({recipe.total_feedbacks || 0})</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> 
                      <span>{totalMins ? formatCookingTime(totalMins) : '-'}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> 
                      <span>{recipe.servings || 0} {t('recipeDetail.servings')}</span>
                    </div>
                    {recipe.difficulty_level && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Badge variant="secondary">{recipe.difficulty_level}</Badge>
                      </>
                    )}
                  </div>

                  {recipe.description && (
                    <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
                  )}

                  {/* Creator Info */}
                  {recipe.creator && (
                    <div className="flex items-center gap-3 pt-2 border-t">
                      {recipe.creator.profile_image_url ? (
                        <img
                          src={recipe.creator.profile_image_url}
                          alt={recipe.creator.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Created by</p>
                        <p className="font-medium">
                          {recipe.creator.name || recipe.creator.username}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cooking Tracker */}
                  {steps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('recipeDetail.startCooking')}</h3>
                      <CookingSessionTracker
                        recipeId={id}
                        recipeTitle={recipe.title}
                        steps={steps}
                        totalMinutes={totalMins}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients & Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Ingredients */}
                <div className="md:sticky md:top-24 h-fit">
                  <h2 className="text-lg font-semibold mb-4">{t('recipeDetail.ingredients')}</h2>
                  <div className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed">
                    {recipe.ingredients}
                  </div>
                </div>

                {/* Steps */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold mb-4">{t('recipeDetail.instructions')}</h2>
                  {steps.length === 0 ? (
                    <p className="text-muted-foreground">{t('recipeDetail.noStepsProvided')}</p>
                  ) : (
                    <div className="space-y-4">
                      {steps.map((s, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {idx + 1}
                          </div>
                          <p className="leading-relaxed pt-1.5">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    {t('recipeDetail.reviews')}
                    {feedbacks.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
                      </Badge>
                    )}
                  </h2>
                  {recipe?.average_rating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{Number(recipe.average_rating).toFixed(1)} average</span>
                    </div>
                  )}
                </div>

                {user && (
                  <Card id="rating-section" className={`p-6 mb-6 border-2 ${isUpdatingReview ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100' : 'border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        {isUpdatingReview ? 'Update Your Review' : t('recipeDetail.leaveReview')}
                      </h3>
                      {isUpdatingReview && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Editing
                        </Badge>
                      )}
                    </div>
                    {isUpdatingReview && (
                      <p className="text-sm text-muted-foreground mb-4">
                        You've already reviewed this recipe. You can update your rating and comment below.
                      </p>
                    )}
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">How would you rate this recipe?</p>
                        <div className="flex items-center gap-2 p-4 bg-background/80 rounded-lg">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-all hover:scale-125 active:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full p-1"
                              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                            >
                              <Star
                                className={`w-10 h-10 cursor-pointer transition-all duration-200 ${
                                  star <= (hoverRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg scale-110'
                                    : 'text-muted-foreground hover:text-yellow-400/70 hover:scale-105'
                                }`}
                              />
                            </button>
                          ))}
                          {(hoverRating || rating) > 0 && (
                            <div className="ml-3 animate-in fade-in slide-in-from-left-2">
                              <div className="text-lg font-semibold text-primary">
                                {hoverRating || rating} {(hoverRating || rating) === 1 ? t('recipeDetail.star') : t('recipeDetail.stars')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {(hoverRating || rating) === 5 && "Perfect!"}
                                {(hoverRating || rating) === 4 && "Great!"}
                                {(hoverRating || rating) === 3 && "Good!"}
                                {(hoverRating || rating) === 2 && "Okay"}
                                {(hoverRating || rating) === 1 && "Not great"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Tell others about your experience (optional)</p>
                        <Textarea
                          placeholder={t('recipeDetail.shareExperience')}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          className="resize-none bg-background/80"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleSubmitFeedback} 
                        disabled={submitFeedbackMut.isPending || rating === 0}
                        className="w-full h-12 text-base font-semibold"
                        size="lg"
                      >
                        {submitFeedbackMut.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            {isUpdatingReview ? 'Updating...' : t('recipeDetail.submitting')}
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            {isUpdatingReview ? 'Update Review' : t('recipeDetail.submitReview')}
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}

                {!user && (
                  <Card className="p-6 mb-6 text-center">
                    <p className="text-muted-foreground">{t('recipeDetail.loginToReview')}</p>
                  </Card>
                )}

                {/* Loading State */}
                {feedbacksLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-full bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {feedbacksError && !feedbacksLoading && (
                  <Card className="p-6 text-center">
                    <p className="text-destructive mb-2">Failed to load reviews</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => qc.invalidateQueries({ queryKey: ["feedbacks", id] })}
                    >
                      Try Again
                    </Button>
                  </Card>
                )}

                {/* Feedback List */}
                {!feedbacksLoading && !feedbacksError && (
                  <div className="space-y-4">
                    {feedbacks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <Star className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Be the first to share your experience with this recipe!
                        </p>
                        {user && (
                          <Button variant="outline" onClick={() => document.getElementById('rating-section')?.scrollIntoView({ behavior: 'smooth' })}>
                            Write First Review
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Show total count for many reviews */}
                        {feedbacks.length > 3 && (
                          <div className="text-center text-sm text-muted-foreground py-2">
                            Showing all {feedbacks.length} reviews
                          </div>
                        )}
                        {feedbacks.map((fb) => {
                          const isUserReview = fb.user?.id === user?.id;
                          return (
                    <Card key={fb.id} className={`p-6 hover:shadow-md transition-shadow ${
                      isUserReview ? 'ring-2 ring-primary/20 bg-primary/5 border-primary/30' : ''
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {fb.user?.profile_image_url ? (
                            <img
                              src={fb.user.profile_image_url}
                              alt={fb.user.name || fb.user.username}
                              className="w-12 h-12 rounded-full object-cover border-2 border-border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border-2 border-border">
                              {(fb.user?.name || fb.user?.username || 'A')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-2">
                                {fb.user?.name || fb.user?.username || t('recipeDetail.anonymous')}
                                {isUserReview && (
                                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                                    Your Review
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{fb.rating}.0</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              {new Date(fb.created_at).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            {isUserReview && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteReview(Number(fb.id))}
                                className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                          
                          {fb.comment && (
                            <blockquote className="text-sm leading-relaxed text-muted-foreground border-l-4 border-primary/20 pl-4 italic">
                              "{fb.comment}"
                            </blockquote>
                          )}
                        </div>
                      </div>
                    </Card>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
