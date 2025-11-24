import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-muted font-semibold' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('my')}
          className={language === 'my' ? 'bg-muted font-semibold' : ''}
        >
          🇲🇲 မြန်မာ (Burmese)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
