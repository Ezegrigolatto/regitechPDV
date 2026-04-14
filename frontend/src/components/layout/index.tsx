import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from '../app-sidebar';
import { SiteHeader } from '../site-header';
import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { useOpenCashSession } from '@/hooks/use-cash-sessions';
import { CashReminderPopup } from '@/components/caja/cash-reminder-popup';
import { useCashReminder } from '@/hooks/use-cash-reminder';
import { useCajaStore } from '@/stores/caja.store';

const Layout: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { profile } = useAuthStore();
  const { setCurrentSession } = useCajaStore();
  const branchId = profile?.branch_id ?? '';

  const { data: currentSession } = useOpenCashSession(branchId);

  useEffect(() => {
    setCurrentSession(currentSession ?? null);
  }, [currentSession]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const { showReminder, dismiss } = useCashReminder({
    reminderTime: currentSession?.reminder_time?.slice(0, 5) ?? null,
    hasOpenSession: !!currentSession,
  });

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="w-full">
        <SiteHeader theme={theme} setTheme={setTheme} />
        <Outlet />
      </main>

      <CashReminderPopup
        open={showReminder}
        onSnooze={dismiss}
        onDismiss={dismiss}
      />
    </SidebarProvider>
  );
};

export default Layout;