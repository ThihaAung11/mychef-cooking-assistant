import Navigation from "@/components/Navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipesService } from "@/services/recipes.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import type { CreateRecipeRequest } from "@/types/api.types";

export default function CreateRecipe() {
  const navigate = useNavigate();
  const qc = useQueryClient();
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

  const createMut = useMutation({
    mutationFn: async () => {
      const recipe = await recipesService.create(formData);
      if (imageFile) {
        await recipesService.uploadImage(String(recipe.id), imageFile, setUploadProgress);
      }
      return recipe;
    },
    onSuccess: (recipe) => {
      toast({ title: "Success", description: "Recipe created successfully!" });
      qc.invalidateQueries({ queryKey: ["recipes"] });
      navigate(`/recipes/${recipe.id}`);
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.message || "Unable to create recipe", variant: "destructive" });
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
    createMut.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 py-6 md:py-10">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold">Create New Recipe</h1>
            <p className="text-sm text-muted-foreground">Share your culinary creation with the community</p>
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
              <Button type="submit" disabled={createMut.isPending} className="flex-1">
                {createMut.isPending ? "Creating..." : "Create Recipe"}
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
