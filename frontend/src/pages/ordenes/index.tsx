import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { OrderTable } from '@/components/ordenes/order-table';
import { OrderDrawer } from '@/components/ordenes/order-drawer';
import { useSaleOrders, saleOrderKeys } from '@/hooks/use-sale-orders';
import { useAuthStore } from '@/stores/auth.store';
import { createDevolution } from '@/services/devolutions.service';
import { toast } from 'sonner';
import { Search, Calendar, RotateCcw, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SaleOrder } from '@/services/sale-orders.service';
import { useQueryClient } from '@tanstack/react-query';
import supabase from '../../../supabase-config';
import { usePermissions } from '@/hooks/use-permissions';

type TabType = 'all' | 'sale' | 'remito' | 'presupuesto';
type DevolutionState = 'idle' | 'loading' | 'success' | 'error';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'sale', label: 'Facturas' },
  { key: 'remito', label: 'Remitos' },
  { key: 'presupuesto', label: 'Presupuestos' },
];

export default function Ordenes() {
  const { profile } = useAuthStore();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [devolutionOpen, setDevolutionOpen] = useState(false);
  const [devolutionNotes, setDevolutionNotes] = useState('');
  const [devolutionState, setDevolutionState] = useState<DevolutionState>('idle');

  const { data: orders = [], isLoading } = useSaleOrders({
    branch_id: profile?.role !== 'admin' ? profile?.branch_id ?? undefined : undefined,
    type: activeTab !== 'all' ? activeTab : undefined,
    status: statusFilter !== 'all' ? (statusFilter as SaleOrder['status']) : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customers?.full_name ?? '').toLowerCase().includes(q)
    );
  });

  const handleView = (order: SaleOrder) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleDevolutionRequest = () => {
    setDevolutionState('idle');
    setDevolutionNotes('');
    setDevolutionOpen(true);
  };

  const handleDevolutionConfirm = async () => {
    if (!selectedOrder) return;
    setDevolutionState('loading');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      await createDevolution({
        original_order_id: selectedOrder.id,
        notes: devolutionNotes,
        session_token: session.access_token,
      });

      setDevolutionState('success');
      queryClient.invalidateQueries({ queryKey: saleOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['branch_stock'] });
    } catch (err: any) {
      console.error('Error devolución:', err);
      setDevolutionState('error');
      toast.error('Error al procesar devolución', {
        description: err?.message ?? 'Intentá de nuevo',
      });
    }
  };

  const handleDevolutionClose = () => {
    if (devolutionState === 'success') {
      toast.success('Devolución registrada', {
        description: 'El stock fue revertido correctamente',
      });
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: 'returned' });
      }
    }
    setDevolutionOpen(false);
    setDevolutionNotes('');
    setDevolutionState('idle');
  };

  return (
    <div className="w-full px-8 py-8 min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Órdenes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historial de ventas, remitos y presupuestos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por Nº orden o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="returned">Devuelto</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 w-44"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 w-44"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {(search || statusFilter !== 'all' || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setDateFrom('');
              setDateTo('');
            }}
          >
            Limpiar
          </Button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'orden' : 'órdenes'}
        </p>
      </div>

      <OrderTable orders={filtered} onView={handleView} isLoading={isLoading} />

      {/* Drawer — se mantiene abierto mientras el dialog está activo */}
      <OrderDrawer
        open={drawerOpen}
        onClose={() => {
          if (!devolutionOpen) {
            setDrawerOpen(false);
            setSelectedOrder(null);
          }
        }}
        order={selectedOrder}
        onDevolution={handleDevolutionRequest}
        isDevolutionLoading={devolutionState === 'loading'}
        canDevolution={can('sales', 'devolution')}
      />

      {/* Dialog devolución — se abre encima del drawer */}
      <Dialog
        open={devolutionOpen}
        onOpenChange={(open) => {
          if (!open && devolutionState !== 'loading') {
            handleDevolutionClose();
          }
        }}
      >
        <DialogContent showCloseButton={devolutionState !== 'loading'}>
          <DialogHeader>
            <DialogTitle>
              {devolutionState === 'success'
                ? '¡Devolución registrada!'
                : '¿Confirmar devolución?'}
            </DialogTitle>
            <DialogDescription>
              {devolutionState === 'success'
                ? 'El stock fue revertido correctamente.'
                : 'Se creará un registro de devolución y se revertirá el stock. Esta acción no se puede deshacer.'}
            </DialogDescription>
          </DialogHeader>

          {devolutionState === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <Button className="w-full" onClick={handleDevolutionClose}>
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <textarea
                className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring mt-2"
                rows={3}
                placeholder="Motivo de la devolución (opcional)..."
                value={devolutionNotes}
                onChange={(e) => setDevolutionNotes(e.target.value)}
                disabled={devolutionState === 'loading'}
              />
              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDevolutionClose}
                  disabled={devolutionState === 'loading'}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDevolutionConfirm}
                  disabled={devolutionState === 'loading'}
                >
                  {devolutionState === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar Devolución'
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
