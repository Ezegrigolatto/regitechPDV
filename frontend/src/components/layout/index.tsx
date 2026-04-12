import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from '../app-sidebar';
import { SiteHeader } from '../site-header';
import { useThemeStore } from '@/stores/theme.store';
import { useEffect } from 'react';

const Layout: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="w-full">
        <SiteHeader theme={theme} setTheme={setTheme} />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default Layout;