import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlarmClock } from 'lucide-react';
import { useCajaStore } from '@/stores/caja.store';

interface CashReminderPopupProps {
  open: boolean;
  onSnooze: () => void;
  onDismiss: () => void;
}

export function CashReminderPopup({ open, onSnooze, onDismiss }: CashReminderPopupProps) {
  const navigate = useNavigate();
  const { snooze } = useCajaStore();

  const handleGoToCaja = () => {
    onDismiss();
    navigate('/caja');
  };

  const handleSnooze = () => {
    snooze();
    onSnooze();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center">
            Recordatorio de cierre
          </DialogTitle>
          <DialogDescription className="text-center">
            Es hora de cerrar la caja de hoy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <AlarmClock className="h-12 w-12 text-primary" />
          </div>

          <p className="text-sm text-muted-foreground text-center max-w-xs">
            No olvides registrar el cierre de caja para mantener un control preciso de tu negocio.
          </p>

          <div className="flex flex-col gap-2 w-full mt-2">
            <Button className="w-full" onClick={handleGoToCaja}>
              Ir a cerrar caja ahora
            </Button>
            <Button variant="outline" className="w-full" onClick={handleSnooze}>
              Recordar en 5 minutos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}