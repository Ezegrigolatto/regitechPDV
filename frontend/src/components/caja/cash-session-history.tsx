import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LockOpen, Lock } from 'lucide-react';
import type { CashSession } from '@/services/cash-sessions.service';

interface CashSessionHistoryProps {
  sessions: CashSession[];
  isLoading?: boolean;
}

export function CashSessionHistory({ sessions, isLoading }: CashSessionHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando historial...
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-2xl overflow-hidden p-1">
      <div className="bg-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Estado
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Apertura
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Cierre
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Monto inicial
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Monto cierre
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Diferencia
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Abierto por
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  No hay sesiones registradas
                </TableCell>
              </TableRow>
            )}
            {sessions.map((session) => {
              const isOpen = session.status === 'open';
              const difference = session.difference;
              return (
                <TableRow key={session.id} className="h-14">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <>
                          <LockOpen className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-bold text-green-600">Abierta</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">Cerrada</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.opened_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-sm font-semibold">
                        {new Date(session.opened_at).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.closed_at ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.closed_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-sm font-semibold">
                          {new Date(session.closed_at).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${session.opening_amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {session.closing_amount != null
                      ? `$${session.closing_amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {difference != null ? (
                      <span className={`font-bold text-sm ${
                        Math.abs(difference) < 0.01
                          ? 'text-green-600'
                          : difference > 0
                          ? 'text-blue-600'
                          : 'text-destructive'
                      }`}>
                        {Math.abs(difference) < 0.01
                          ? '✓'
                          : `${difference > 0 ? '+' : '-'}$${Math.abs(difference).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {session.opener?.full_name ?? '—'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}