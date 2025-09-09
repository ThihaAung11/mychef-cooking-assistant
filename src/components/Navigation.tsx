import { useState } from "react";
import { Menu, X, Home, Search, BookOpen, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: Search, label: "Discover", href: "/discover" },
  { icon: BookOpen, label: "My Recipes", href: "/my-recipes" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold bg-gradient-warm bg-clip-text text-transparent">
            မြန်မာ Kitchen
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <Link to={item.href} onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">
            မြန်မာ Kitchen
          </h1>
          
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Button key={item.href} variant="ghost" className="gap-2" asChild>
                <Link to={item.href} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">EN</Button>
            <Button variant="warm" size="sm">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 5).map((item) => (
            <Button key={item.href} variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2" asChild>
              <Link to={item.href} className="flex flex-col items-center gap-1 py-2">
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </nav>
    </>
  );
}