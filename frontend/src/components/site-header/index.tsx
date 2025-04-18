import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useMemo } from 'react';

interface SiteHeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export function SiteHeader({ theme, setTheme }: SiteHeaderProps) {
  const currentPath = useMemo(() => {
    const path = window.location.pathname;
    return path.startsWith('/') ? path.slice(1) : path;
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Guardamos en localStorage para mantener el tema entre sesiones
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 self-center" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium capitalize">{currentPath}</h1>
      </div>
      <div className="flex items-center justify-center pr-6">
        {theme === 'dark' ? (
          <Moon
            className={`h-5 w-5 transition-colors group-data-[theme=dark]:text-primary cursor-pointer `}
            onClick={toggleTheme}
          />
        ) : (
          <Sun
            className={`h-5 w-5 transition-colors group-data-[theme=light]:text-primary cursor-pointer`}
            onClick={toggleTheme}
          />
        )}
      </div>
    </header>
  );
}
