import { FormEvent, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = location.state?.from?.pathname || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ username, password });
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      // Error is already shown in toast by AuthProvider
      setError(err.detail || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-md px-4 md:px-0">
          <Card className="p-6 md:p-8 border-border/60 bg-card/90 backdrop-blur-sm rounded-2xl">
            <div className="mb-6 text-center space-y-1">
              <h1 className="text-2xl font-semibold">{t('login.welcomeBack')}</h1>
              <p className="text-muted-foreground text-sm">{t('login.signInDesc')}</p>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">{t('login.usernameOrEmail')}</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder={t('login.usernamePlaceholder')} 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  disabled={loading}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    {t('login.forgotPassword')}
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={loading}
                  required 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('login.rememberMe')}
                </label>
              </div>
              
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t('login.signingIn') : t('login.signIn')}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('login.noAccount')}{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {t('login.signUp')}
                </Link>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t('login.termsAgreement')}
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
