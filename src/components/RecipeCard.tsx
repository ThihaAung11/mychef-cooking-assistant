import { Star, Clock, Users, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  rating: number;
  cookTime: string;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
}

export default function RecipeCard({
  title,
  image,
  rating,
  cookTime,
  servings,
  difficulty,
  tags,
  description,
}: RecipeCardProps) {
  const difficultyColors = {
    Easy: "bg-accent text-accent-foreground",
    Medium: "bg-primary text-primary-foreground", 
    Hard: "bg-secondary text-secondary-foreground"
  };

  return (
    <div className="recipe-card group cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Button size="sm" variant="outline" className="rounded-full bg-background/80 backdrop-blur-sm">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
        </div>
        {/* Hover Quick Actions (Desktop) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden md:block">
          <div className="pointer-events-auto flex items-center justify-center gap-2 rounded-full bg-background/80 backdrop-blur-sm p-2 shadow-sm">
            <Button size="sm" variant="warm" className="rounded-full">Cook Now</Button>
            <Button size="sm" variant="secondary" className="rounded-full">Save</Button>
            <Button size="sm" variant="outline" className="rounded-full">Share</Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-medium">{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{servings}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Action */}
        <Button className="w-full rounded-full">
          View Recipe
        </Button>
      </div>
    </div>
  );
}