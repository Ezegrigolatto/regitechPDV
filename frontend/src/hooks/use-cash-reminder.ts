import { useEffect, useState } from 'react';
import { useCajaStore } from '@/stores/caja.store';

interface UseCashReminderOptions {
  reminderTime: string | null; // formato 'HH:MM'
  hasOpenSession: boolean;
}

export function useCashReminder({
  reminderTime,
  hasOpenSession,
}: UseCashReminderOptions) {
  const [showReminder, setShowReminder] = useState(false);
  const { isSnoozed } = useCajaStore();

  useEffect(() => {
    if (!reminderTime || !hasOpenSession) {
      setShowReminder(false);
      return;
    }

    const check = () => {
      if (isSnoozed()) return;

      const now = new Date();
      const [hours, minutes] = reminderTime.split(':').map(Number);

      const isPastReminder =
        now.getHours() > hours ||
        (now.getHours() === hours && now.getMinutes() >= minutes);

      if (isPastReminder && hasOpenSession) {
        setShowReminder(true);
      }
    };

    check();
    const interval = setInterval(check, 10 * 1000); // cada 10 segundos
    return () => clearInterval(interval);
  }, [reminderTime, hasOpenSession]);

  const dismiss = () => {
    setShowReminder(false);
  };

  return { showReminder, dismiss };
}
