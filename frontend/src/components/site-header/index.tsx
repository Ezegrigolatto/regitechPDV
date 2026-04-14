import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Moon, Sun, LockOpen, Lock } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useOpenCashSession } from '@/hooks/use-cash-sessions';
import { Button } from '../ui/button';

interface SiteHeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export function SiteHeader({ theme, setTheme }: SiteHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id ?? '';

  const { data: currentSession } = useOpenCashSession(branchId);
  const isOpen = !!currentSession;

  const currentPath = location.pathname.startsWith('/')
    ? location.pathname.slice(1)
    : location.pathname;

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
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
      <div className="flex items-center gap-3 pr-6">
        {/* Hint de caja */}
        {branchId && (
          <Button
            onClick={() => navigate('/caja')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              isOpen
                ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20'
                : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            }`}
          >
            {isOpen ? (
              <>
                <LockOpen className="h-3 w-3" />
                Caja abierta
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Caja cerrada
              </>
            )}
          </Button>
        )}

        {theme === 'dark' ? (
          <Moon
            className="h-5 w-5 transition-colors cursor-pointer"
            onClick={toggleTheme}
          />
        ) : (
          <Sun
            className="h-5 w-5 transition-colors cursor-pointer"
            onClick={toggleTheme}
          />
        )}
      </div>
    </header>
  );
}
