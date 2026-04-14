import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LockOpen, Lock, Clock } from 'lucide-react';
import type { CashSession } from '@/services/cash-sessions.service';

interface CashSessionCardProps {
  session: CashSession | null;
  totalSold: number;
  expectedCash: number;
  breakdown: { name: string; total: number }[];
  onOpen: () => void;
  onClose: () => void;
  canManage?: boolean;
}

export function CashSessionCard({
  session,
  totalSold,
  expectedCash,
  breakdown,
  onOpen,
  onClose,
  canManage,
}: CashSessionCardProps) {
  const isOpen = session?.status === 'open';

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-6">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isOpen ? 'bg-green-500/10' : 'bg-muted'}`}>
            {isOpen ? (
              <LockOpen className="h-6 w-6 text-green-600" />
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-extrabold text-lg">
              {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
            </p>
            {session && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isOpen ? 'Abierta a las' : 'Cerrada a las'}{' '}
                {new Date(
                  isOpen ? session.opened_at : session.closed_at!
                ).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {canManage && (
          <div>
            {isOpen ? (
              <Button variant="destructive" onClick={onClose}>
                <Lock className="h-4 w-4 mr-2" />
                Cerrar Caja
              </Button>
            ) : (
              <Button onClick={onOpen}>
                <LockOpen className="h-4 w-4 mr-2" />
                Abrir Caja
              </Button>
            )}
          </div>
        )}
      </div>

      {isOpen && session && (
        <>
          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Monto inicial
              </p>
              <p className="text-lg font-extrabold">
                $
                {session.opening_amount.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Total vendido
              </p>
              <p className="text-lg font-extrabold text-green-600">
                ${totalSold.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Efectivo esperado
              </p>
              <p className="text-lg font-extrabold">
                ${expectedCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {session.reminder_time && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Recordatorio
                </p>
                <p className="text-lg font-extrabold text-primary">
                  {session.reminder_time.slice(0, 5)}
                </p>
              </div>
            )}
          </div>

          {/* Desglose */}
          {breakdown.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Ventas por método de pago
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {breakdown.map((item) => (
                  <div
                    key={item.name}
                    className="bg-muted/30 rounded-lg px-4 py-3 flex justify-between items-center"
                  >
                    <span className="text-sm capitalize text-muted-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold">
                      ${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
