import { Star, Clock, Users, Bookmark, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  rating: number;
  feedbackCount?: number;
  cookTime: string;
  prepMinutes?: number;
  cookMinutes?: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
  saved?: boolean;
  onSave?: (id: string) => void;
  hasSteps?: boolean; // Indicates structured steps available
  stepCount?: number; // Number of steps
  showEdit?: boolean; // Show edit button for user's own recipes
  creatorName?: string; // Creator name
  creatorImage?: string | null; // Creator profile image
}

export default function RecipeCard({
  id,
  title,
  image,
  rating,
  feedbackCount,
  cookTime,
  prepMinutes,
  cookMinutes,
  servings,
  difficulty,
  tags,
  description,
  saved,
  onSave,
  hasSteps,
  stepCount,
  showEdit,
  creatorName,
  creatorImage,
}: RecipeCardProps) {
  const navigate = useNavigate();
  
  const difficultyColors = {
    Easy: "bg-accent text-accent-foreground",
    Medium: "bg-primary text-primary-foreground", 
    Hard: "bg-secondary text-secondary-foreground"
  };

  const safeRating = Number.isFinite(rating) ? Number(rating.toFixed(1)) : 0;
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src.endsWith("/placeholder.svg")) return;
    target.src = "/placeholder.svg";
  };

  return (
    <Link 
      to={`/recipes/${id}`} 
      className="recipe-card group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-2xl overflow-hidden bg-card border border-border shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-muted to-muted">
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={onImgError}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <Badge className={`${difficultyColors[difficulty]} shadow-lg font-medium px-3 py-1`}>
            {difficulty}
          </Badge>
          {hasSteps && stepCount && (
            <Badge className="bg-background bg-opacity-95 text-foreground shadow-lg font-medium px-3 py-1 backdrop-blur-sm">
              📋 {stepCount} steps
            </Badge>
          )}
        </div>

        {/* Save button */}
        <div className="absolute top-3 right-3 z-10">
          <Button
            size="sm"
            variant="outline"
            className={`rounded-full bg-background bg-opacity-95 backdrop-blur-md shadow-lg border-2 transition-all duration-200 hover:scale-110 ${
              saved 
                ? 'border-primary bg-primary text-primary-foreground hover:bg-primary hover:bg-opacity-90' 
                : 'border-background hover:border-primary'
            }`}
            onClick={(e) => { e.preventDefault(); onSave?.(id); }}
            aria-label="Save recipe"
          >
            <Bookmark className={`w-4 h-4 transition-transform ${saved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Bottom gradient info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center gap-3 text-white text-opacity-90 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{safeRating}</span>
              {typeof feedbackCount === 'number' && (
                <span className="text-xs opacity-75">({feedbackCount})</span>
              )}
            </div>
            <div className="w-px h-4 bg-white bg-opacity-30" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{cookTime}</span>
            </div>
            <div className="w-px h-4 bg-white bg-opacity-30" />
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="font-medium">{servings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */
      <div className="p-5 space-y-3.5 bg-gradient-to-b from-card to-card">
        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Creator Info */}
        {creatorName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1 border-t">
            {creatorImage ? (
              <img
                src={creatorImage}
                alt={creatorName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
            )}
            <span className="truncate font-medium">by {creatorName}</span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, idx) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs font-medium px-2.5 py-0.5 transition-all duration-200 hover:scale-105"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showEdit ? (
          <div className="flex gap-2">
            <Button 
              className="flex-1 rounded-full font-semibold shadow-sm group-hover:shadow-md transition-all duration-200" 
              onClick={(e) => e.preventDefault()}
            >
              View
            </Button>
            <Button 
              variant="outline"
              className="flex-1 rounded-full font-semibold shadow-sm group-hover:shadow-md transition-all duration-200 hover:bg-primary hover:text-primary-foreground" 
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/recipes/${id}/edit`}>
                <Edit className="w-4 h-4 mr-1.5" />
                Edit
              </Link>
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full rounded-full font-semibold shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105" 
            onClick={(e) => e.preventDefault()}
          >
            <span className="group-hover:scale-105 inline-block transition-transform">View Recipe</span>
          </Button>
        )}
      </div>
    </Link>
  );
}