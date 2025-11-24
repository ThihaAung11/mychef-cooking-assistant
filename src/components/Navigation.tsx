import { Home, Search, User, MessageCircle, ChefHat, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

// Desktop navigation - Clear user journey
const getDesktopNavItems = (t: (key: string) => string) => [
  { icon: Home, label: t('nav.home'), href: "/" },
  { icon: MessageCircle, label: t('nav.askAI'), href: "/chat" },
  { icon: Search, label: t('nav.recipes'), href: "/discover" },
  { icon: ChefHat, label: t('nav.kitchen'), href: "/my-kitchen" },
];

// Mobile navigation - 4 tabs with Ask AI as hero (simplified labels)
const getMobileNavItems = (t: (key: string) => string) => [
  { icon: Home, label: t('nav.home'), href: "/" },
  { icon: MessageCircle, label: t('nav.askAI'), href: "/chat", isHero: true },
  { icon: Search, label: t('nav.recipes'), href: "/discover" },
  { icon: ChefHat, label: t('nav.kitchen'), href: "/my-kitchen" },
];

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  
  const desktopNavItems = getDesktopNavItems(t);
  const mobileNavItems = getMobileNavItems(t);
  
  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Navigation - Logo + Profile - Glass Effect */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl bg-background/70 dark:bg-background/80">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow transition-all">
              <Flame className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              MyChef
            </h1>
          </Link>
          
          {/* Language, Theme & Profile */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Desktop Navigation - Glass Effect */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl bg-background/70 dark:bg-background/80">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <Flame className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              MyChef
            </h1>
          </Link>
          
          <div className="flex items-center gap-2">
            {desktopNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Button 
                  key={item.href} 
                  variant={active ? "default" : "ghost"} 
                  size="sm" 
                  className={`gap-2 ${active ? 'shadow-sm' : ''}`} 
                  asChild
                >
                  <Link to={item.href} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {!isAuthenticated ? (
              <Button variant="warm" size="sm" asChild>
                <Link to="/login">{t('nav.signIn')}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                  <Link to="/profile">
                    <User className="w-4 h-4" />
                    <span>{t('nav.profile')}</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>{t('nav.logout')}</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) - Glass Effect */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl bg-background/80 dark:bg-background/90">
        <div className="flex items-end justify-around px-2 pb-3 pt-2 safe-area-inset-bottom">
          {mobileNavItems.map((item) => {
            const isHero = item.isHero;
            const active = isActive(item.href);
            
            if (isHero) {
              return (
                <Link 
                  key={item.href} 
                  to={item.href}
                  className="flex flex-col items-center -mt-5 group"
                >
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/90 shadow-lg flex items-center justify-center transition-all group-active:scale-95 mb-1 ${active ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <item.icon className="w-6 h-6 text-primary-foreground" strokeWidth={2} />
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            }
            
            return (
              <Link 
                key={item.href} 
                to={item.href}
                className="flex flex-col items-center gap-1 group pt-2"
              >
                <item.icon 
                  className={`w-5 h-5 transition-colors group-active:scale-90 ${active ? 'text-primary' : ''}`} 
                  strokeWidth={active ? 2 : 1.5} 
                />
                <span className={`text-[10px] font-medium ${active ? 'text-primary font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}