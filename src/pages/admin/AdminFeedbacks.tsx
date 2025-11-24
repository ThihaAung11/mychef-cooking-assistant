import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Star } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const feedbacks = await adminService.feedbacks.list();
      setFeedbacks(feedbacks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feedbacks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await adminService.feedbacks.delete(id);
      toast({ title: "Success", description: "Feedback deleted" });
      loadFeedbacks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <p className="text-muted-foreground">View and moderate user feedbacks</p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="glass-card p-8 text-center text-muted-foreground">
            Loading feedbacks...
          </Card>
        ) : feedbacks.length === 0 ? (
          <Card className="glass-card p-8 text-center text-muted-foreground">
            No feedbacks found
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback.id} className="glass-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{feedback.user_name || 'Anonymous'}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recipe: {feedback.recipe_title}
                  </p>
                  <p className="text-sm">{feedback.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(feedback.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(feedback.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
