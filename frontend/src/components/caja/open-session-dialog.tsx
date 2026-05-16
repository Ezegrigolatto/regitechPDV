import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { TimePicker } from '../ui/time-picker';

interface OpenSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (openingAmount: number, reminderTime: string | null) => void;
  isLoading?: boolean;
}

export function OpenSessionDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
}: OpenSessionDialogProps) {
  const [openingAmount, setOpeningAmount] = useState('');
  const [reminderTime, setReminderTime] = useState('21:00');
  const [useReminder, setUseReminder] = useState(true);

  const handleConfirm = () => {
    onConfirm(
      parseFloat(openingAmount) || 0,
      useReminder && reminderTime ? reminderTime.slice(0, 5) : null
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">Abrir Caja</DialogTitle>
          <DialogDescription>
            Ingresá el monto inicial en efectivo para comenzar la jornada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Monto inicial */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Monto inicial en efectivo
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                className="pl-7 text-lg font-bold"
                type="number"
                placeholder="0.00"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {/* Recordatorio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Recordatorio de cierre
              </Label>
              <button
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  useReminder ? 'bg-primary' : 'bg-muted'
                }`}
                onClick={() => setUseReminder(!useReminder)}
                disabled={isLoading}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    useReminder ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {useReminder && (
              <TimePicker
                defaultValue="21:00:00"
                onChange={(time) => setReminderTime(time.slice(0, 5))}
              />
            )}
            <p className="text-xs text-muted-foreground">
              {useReminder
                ? `Se te recordará cerrar la caja a las ${reminderTime}`
                : 'Sin recordatorio de cierre'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Abriendo...
              </span>
            ) : (
              'Abrir Caja'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
