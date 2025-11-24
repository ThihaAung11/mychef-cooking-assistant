import { FormEvent, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { formatApiError } from "@/lib/api-utils";
import { toast } from "@/hooks/use-toast";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    // Clear error when user types
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.username || formData.username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (!formData.email || !formData.email.includes("@")) {
      return "Please enter a valid email address";
    }
    if (!formData.password || formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        name: formData.name || undefined,
        password: formData.password,
      });

      setSuccess(true);
      toast({
        title: "Account created!",
        description: "Your account has been created successfully. Please sign in.",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const errorMsg = formatApiError(err);
      setError(errorMsg);
      toast({
        title: "Registration failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <main className="pt-16 md:pt-20 pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-md px-4 md:px-0">
            <Card className="p-6 md:p-8 border-border/60 bg-card/90 backdrop-blur-sm rounded-2xl">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold mb-2">Account Created!</h1>
                  <p className="text-sm text-muted-foreground">
                    Your account has been created successfully.
                    <br />
                    Redirecting to login...
                  </p>
                </div>
              </div>
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
        <div className="mx-auto w-full max-w-md px-4 md:px-0">
          <Card className="p-6 md:p-8 border-border/60 bg-card/90 backdrop-blur-sm rounded-2xl">
            <div className="mb-6 text-center space-y-1">
              <h1 className="text-2xl font-semibold">Create an account</h1>
              <p className="text-muted-foreground text-sm">
                Join our community of food lovers
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-[10px] text-muted-foreground">
                By creating an account, you agree to our Terms and Privacy
                Policy.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
