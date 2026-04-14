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
import { Separator } from '@/components/ui/separator';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CashSession } from '@/services/cash-sessions.service';

interface PaymentBreakdown {
  name: string;
  total: number;
}

interface CloseSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (closingAmount: number) => void;
  session: CashSession;
  breakdown: PaymentBreakdown[];
  totalSold: number;
  expectedCash: number;
  isLoading?: boolean;
}

export function CloseSessionDialog({
  open,
  onClose,
  onConfirm,
  session,
  breakdown,
  totalSold,
  expectedCash,
  isLoading,
}: CloseSessionDialogProps) {
  const [closingAmount, setClosingAmount] = useState('');

  const closing = parseFloat(closingAmount) || 0;
  const difference = closing - expectedCash;
  const isExact = Math.abs(difference) < 0.01;

  const handleConfirm = () => {
    onConfirm(closing);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={!isLoading} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">Cerrar Caja</DialogTitle>
          <DialogDescription>
            Revisá el resumen de la sesión antes de cerrar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Resumen de la sesión */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Apertura</span>
              <span className="font-semibold">
                {new Date(session.opened_at).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto inicial</span>
              <span className="font-semibold">
                ${session.opening_amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total vendido</span>
              <span>${totalSold.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Desglose por método de pago */}
          {breakdown.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Desglose por método de pago
              </p>
              {breakdown.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{item.name}</span>
                  <span className="font-semibold">
                    ${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Efectivo esperado */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Efectivo esperado en caja</span>
            <span className="font-bold">
              ${expectedCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Monto real */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Efectivo real en caja
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                className="pl-7 text-lg font-bold"
                type="number"
                placeholder="0.00"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {/* Diferencia */}
          {closingAmount && (
            <div className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold ${
              isExact
                ? 'bg-green-500/10 text-green-700'
                : difference > 0
                ? 'bg-blue-500/10 text-blue-700'
                : 'bg-destructive/10 text-destructive'
            }`}>
              <div className="flex items-center gap-2">
                {isExact ? (
                  <Minus className="h-4 w-4" />
                ) : difference > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {isExact ? 'Cierre exacto' : difference > 0 ? 'Sobrante' : 'Faltante'}
                </span>
              </div>
              {!isExact && (
                <span>
                  ${Math.abs(difference).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleConfirm}
            disabled={isLoading || !closingAmount}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cerrando...
              </span>
            ) : (
              'Cerrar Caja'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}