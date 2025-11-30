import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recipesService } from "@/services/recipes.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { CreateRecipeRequest } from "@/types/api.types";

export default function EditRecipe() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<CreateRecipeRequest>({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    cuisine_type: "",
    difficulty_level: "Easy",
    preparation_time: undefined,
    cooking_time: undefined,
    servings: undefined,
    is_public: true,
  });

  // Load existing recipe
  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => recipesService.getById(id),
    enabled: !!id,
  });

  // Check if user is the creator
  useEffect(() => {
    if (recipe && user && recipe.created_by !== user.id) {
      toast({ title: "Access Denied", description: "You can only edit your own recipes.", variant: "destructive" });
      navigate(`/recipes/${id}`);
    }
  }, [recipe, user, id, navigate]);

  // Pre-fill form with existing data
  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || "",
        description: recipe.description || "",
        ingredients: recipe.ingredients || "",
        instructions: recipe.instructions || "",
        cuisine_type: recipe.cuisine_type || "",
        difficulty_level: recipe.difficulty_level || "Easy",
        preparation_time: recipe.preparation_time,
        cooking_time: recipe.cooking_time,
        servings: recipe.servings,
        is_public: recipe.is_public !== false,
      });
      if (recipe.image_url) {
        setImagePreview(recipesService.getCardImage(recipe.image_url));
      }
    }
  }, [recipe]);

  const updateMut = useMutation({
    mutationFn: async () => {
      const updated = await recipesService.update(id, formData);
      if (imageFile) {
        await recipesService.uploadImage(id, imageFile, setUploadProgress);
      }
      return updated;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Recipe updated successfully!" });
      qc.invalidateQueries({ queryKey: ["recipe", id] });
      qc.invalidateQueries({ queryKey: ["recipes"] });
      navigate(`/recipes/${id}`);
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.message || "Unable to update recipe", variant: "destructive" });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, or WebP image.", variant: "destructive" });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be less than 5MB.", variant: "destructive" });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    if (!formData.ingredients.trim()) {
      toast({ title: "Validation Error", description: "Ingredients are required.", variant: "destructive" });
      return;
    }
    if (!formData.instructions.trim()) {
      toast({ title: "Validation Error", description: "Instructions are required.", variant: "destructive" });
      return;
    }
    updateMut.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 md:pt-20 pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-3xl px-4 flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading recipe...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 md:pt-20 pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-3xl px-4 flex items-center justify-center py-20">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-3">Recipe Not Found</h2>
              <p className="text-sm text-muted-foreground mb-4">The recipe you're trying to edit doesn't exist.</p>
              <Button onClick={() => navigate("/my-recipes")}>Go to My Recipes</Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold">Edit Recipe</h1>
            <p className="text-sm text-muted-foreground">Update your recipe details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <Card className="p-4">
              <Label>Recipe Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </Card>

            {/* Basic Info */}
            <Card className="p-4 space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Traditional Burmese Mohinga"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your recipe..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Input
                    id="cuisine"
                    value={formData.cuisine_type || ""}
                    onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                    placeholder="e.g., Burmese"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings || ""}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="4"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prep">Prep Time (minutes)</Label>
                  <Input
                    id="prep"
                    type="number"
                    value={formData.preparation_time || ""}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="15"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="cook">Cook Time (minutes)</Label>
                  <Input
                    id="cook"
                    type="number"
                    value={formData.cooking_time || ""}
                    onChange={(e) => setFormData({ ...formData, cooking_time: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="30"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public-toggle">Make recipe public</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to discover and view this recipe
                  </p>
                </div>
                <Switch
                  id="public-toggle"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>
            </Card>

            {/* Ingredients */}
            <Card className="p-4">
              <Label htmlFor="ingredients">Ingredients *</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="List ingredients (one per line)&#10;e.g.,&#10;2 cups rice noodles&#10;1 lb chicken breast&#10;3 cloves garlic"
                rows={8}
                required
              />
            </Card>

            {/* Instructions */}
            <Card className="p-4">
              <Label htmlFor="instructions">Cooking Instructions *</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Write step-by-step instructions (one step per line)&#10;e.g.,&#10;Heat oil in a large pot over medium heat.&#10;Add garlic and sauté until fragrant.&#10;Add chicken and cook until browned."
                rows={10}
                required
              />
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={updateMut.isPending || isLoading} className="flex-1">
                {updateMut.isPending ? "Updating..." : "Update Recipe"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/my-recipes")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
