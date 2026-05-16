import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useCajaStore } from '@/stores/caja.store';
import {
  useOpenCashSession,
  useOpenCashSessionMutation,
  useCloseCashSession,
  useCashSessionHistory,
} from '@/hooks/use-cash-sessions';
import { useSaleOrders } from '@/hooks/use-sale-orders';
import { CashSessionCard } from '@/components/caja/cash-session-card';
import { CashSessionHistory } from '@/components/caja/cash-session-history';
import { OpenSessionDialog } from '@/components/caja/open-session-dialog';
import { CloseSessionDialog } from '@/components/caja/close-session-dialog';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';

export default function Caja() {
  const { profile } = useAuthStore();
  const { can } = usePermissions();
  const { setCurrentSession } = useCajaStore();
  const branchId = profile?.branch_id ?? '';

  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const { data: currentSession, isLoading: loadingSession } =
    useOpenCashSession(branchId);
  const { data: history = [], isLoading: loadingHistory } =
    useCashSessionHistory(branchId);
  const openSession = useOpenCashSessionMutation();
  const closeSession = useCloseCashSession();

  // Órdenes de la sesión actual para calcular totales
  const { data: orders = [] } = useSaleOrders({
    branch_id: branchId,
    status: 'completed',
    date_from: currentSession?.opened_at,
  });

  // Calcular totales
  const totalSold = orders.reduce((sum, o) => sum + o.total, 0);

  const breakdown = orders
    .flatMap((o) => o.payments ?? [])
    .reduce((acc, payment) => {
      const name = payment.payment_methods?.name ?? 'otro';
      const existing = acc.find((a) => a.name === name);
      if (existing) {
        existing.total += payment.amount;
      } else {
        acc.push({ name, total: payment.amount });
      }
      return acc;
    }, [] as { name: string; total: number }[]);

  const cashBreakdown = breakdown.find((b) => b.name === 'efectivo');
  const expectedCash =
    (currentSession?.opening_amount ?? 0) + (cashBreakdown?.total ?? 0);

  // Sincronizar con el store global
  useEffect(() => {
    setCurrentSession(currentSession ?? null);
  }, [currentSession]);

  const handleOpenSession = async (
    openingAmount: number,
    reminderTime: string | null
  ) => {
    try {
      await openSession.mutateAsync({
        opening_amount: openingAmount,
        reminder_time: reminderTime ?? undefined,
      });
      toast.success('Caja abierta correctamente');
      setOpenDialogOpen(false);
    } catch (err: any) {
      toast.error('Error al abrir caja', { description: err?.message });
    }
  };

  const handleCloseSession = async (closingAmount: number) => {
    if (!currentSession) return;
    try {
      await closeSession.mutateAsync({
        session_id: currentSession.id,
        closing_amount: closingAmount,
      });
      toast.success('Caja cerrada correctamente');
      setCloseDialogOpen(false);
    } catch (err: any) {
      toast.error('Error al cerrar caja', { description: err?.message });
    }
  };

  if (loadingSession) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-muted-foreground">
        Cargando caja...
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-8 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Caja</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná las sesiones de caja de tu sucursal
        </p>
      </div>

      {/* Card estado actual */}
      <div className="mb-8">
        <CashSessionCard
          session={currentSession ?? null}
          totalSold={totalSold}
          expectedCash={expectedCash}
          breakdown={breakdown}
          onOpen={() => setOpenDialogOpen(true)}
          onClose={() => setCloseDialogOpen(true)}
          canManage={can('cash', 'open')}
        />
      </div>

      {/* Historial */}
      <div>
        <h2 className="text-lg font-extrabold mb-4">Historial de sesiones</h2>
        <CashSessionHistory sessions={history} isLoading={loadingHistory} />
      </div>

      {/* Dialog abrir */}
      <OpenSessionDialog
        open={openDialogOpen}
        onClose={() => {
          if (!openSession.isPending) setOpenDialogOpen(false);
        }}
        onConfirm={handleOpenSession}
        isLoading={openSession.isPending}
      />

      {/* Dialog cerrar */}
      {currentSession && (
        <CloseSessionDialog
          open={closeDialogOpen}
          onClose={() => {
            if (!closeSession.isPending) setCloseDialogOpen(false);
          }}
          onConfirm={handleCloseSession}
          session={currentSession}
          breakdown={breakdown}
          totalSold={totalSold}
          expectedCash={expectedCash}
          isLoading={closeSession.isPending}
        />
      )}
    </div>
  );
}
