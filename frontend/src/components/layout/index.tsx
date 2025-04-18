import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from '../app-sidebar';
import { SiteHeader } from '../site-header';

const Layout: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') || 'light') as 'light' | 'dark';
    }
    return 'light' as 'light' | 'dark';
  });

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar theme={theme} />
      <main className="w-full">
        <SiteHeader theme={theme} setTheme={setTheme} />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default Layout;
