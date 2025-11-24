import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Clock, ListChecks } from "lucide-react";

interface CookingSessionTrackerProps {
  recipeId: string;
  recipeTitle: string;
  steps: string[];
  totalMinutes: number;
}

export default function CookingSessionTracker({
  recipeId,
  recipeTitle,
  steps,
  totalMinutes,
}: CookingSessionTrackerProps) {
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-3">
      {/* Primary CTA - Hero Button */}
      <Button 
        asChild 
        size="lg" 
        className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/90"
      >
        <Link to={`/cooking-session/${recipeId}`}>
          <Play className="w-5 h-5 mr-2" />
          Start Cooking
        </Link>
      </Button>

      {/* Subtle Meta Info */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ListChecks className="w-4 h-4" />
          <span>{steps.length} steps</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{totalMinutes ? formatTime(totalMinutes) : '-'}</span>
        </div>
        <span>•</span>
        <span>🤖 AI help</span>
      </div>
    </div>
  );
}
