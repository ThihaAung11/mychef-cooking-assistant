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

  const { data: feedbacks = [] } = useQuery<Feedback[]>({
    queryKey: ["feedbacks", id],
    queryFn: () => feedbackService.getByRecipe(id),
    enabled: !!id,
  });

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

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
        await savedRecipesService.delete(savedId);
        setSavedId(null);
        toast({ title: t('recipeDetail.removed'), description: t('recipeDetail.recipeRemoved') });
      } else {
        const res = await savedRecipesService.save(String(recipe.id));
        setSavedId(String(res.id));
        toast({ title: t('recipeDetail.saved'), description: t('recipeDetail.recipeAdded') });
      }
    } catch (err: any) {
      toast({ title: t('recipeDetail.actionFailed'), description: err?.message || t('recipeDetail.unableToUpdate'), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitFeedbackMut = useMutation({
    mutationFn: () => feedbackService.create({ recipe_id: id, rating, comment: comment || undefined }),
    onSuccess: () => {
      toast({ title: t('recipeDetail.submitted'), description: t('recipeDetail.thankYou') });
      setRating(0);
      setComment("");
      qc.invalidateQueries({ queryKey: ["feedbacks", id] });
      qc.invalidateQueries({ queryKey: ["recipe", id] });
    },
    onError: (err: any) => {
      toast({ title: t('recipeDetail.failed'), description: err?.message || t('recipeDetail.unableToSubmit'), variant: "destructive" });
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
                        disabled={saving}
                      >
                        <Bookmark className={`w-5 h-5 ${savedId ? 'fill-current' : ''}`} />
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
                <h2 className="text-xl font-semibold mb-6">{t('recipeDetail.reviews')}</h2>

                {user && (
                  <Card className="p-6 mb-6">
                    <h3 className="font-semibold mb-4">{t('recipeDetail.leaveReview')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-all hover:scale-125"
                          >
                            <Star
                              className={`w-8 h-8 cursor-pointer transition-all ${
                                star <= (hoverRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                  : 'text-muted-foreground hover:text-yellow-400/50'
                              }`}
                            />
                          </button>
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 text-lg font-semibold text-primary animate-in fade-in">
                            {rating} {rating === 1 ? t('recipeDetail.star') : t('recipeDetail.stars')}
                          </span>
                        )}
                      </div>
                      <Textarea
                        placeholder={t('recipeDetail.shareExperience')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <Button 
                        onClick={handleSubmitFeedback} 
                        disabled={submitFeedbackMut.isPending || rating === 0}
                        className="w-full"
                      >
                        {submitFeedbackMut.isPending ? t('recipeDetail.submitting') : t('recipeDetail.submitReview')}
                      </Button>
                    </div>
                  </Card>
                )}

                {!user && (
                  <Card className="p-6 mb-6 text-center">
                    <p className="text-muted-foreground">{t('recipeDetail.loginToReview')}</p>
                  </Card>
                )}

                <div className="space-y-4">
                  {feedbacks.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">{t('recipeDetail.noReviews')}</p>
                    </div>
                  )}
                  {feedbacks.map((fb) => (
                    <Card key={fb.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {(fb.user?.name || fb.user?.username || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold">{fb.user?.name || fb.user?.username || t('recipeDetail.anonymous')}</div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-medium">{fb.rating}.0</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {fb.comment && (
                        <p className="text-sm leading-relaxed text-muted-foreground pl-12">
                          {fb.comment}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
