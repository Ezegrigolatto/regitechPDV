import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '@/hooks/use-customers';
import { useSaleOrders } from '@/hooks/use-sale-orders';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OrderDrawer } from '@/components/ordenes/order-drawer';
import { PDFActions } from '@/components/pdf/pdf-actions';
import { createDevolution } from '@/services/devolutions.service';
import { useQueryClient } from '@tanstack/react-query';
import { saleOrderKeys } from '@/hooks/use-sale-orders';
import { toast } from 'sonner';
import supabase from '../../../supabase-config';
import { usePermissions } from '@/hooks/use-permissions';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { SaleOrder } from '@/services/sale-orders.service';

const ORDER_TYPE_BADGE = {
  sale: 'bg-green-500/10 text-green-700',
  remito: 'bg-blue-500/10 text-blue-700',
  presupuesto: 'bg-yellow-500/10 text-yellow-700',
};

const ORDER_TYPE_LABEL = {
  sale: 'Factura',
  remito: 'Remito',
  presupuesto: 'Presupuesto',
};

const ORDER_STATUS_BADGE = {
  pending: 'bg-muted text-muted-foreground',
  completed: 'bg-green-500/10 text-green-700',
  cancelled: 'bg-destructive/10 text-destructive',
  returned: 'bg-orange-500/10 text-orange-700',
};

const ORDER_STATUS_LABEL = {
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
  returned: 'Devuelto',
};

type DevolutionState = 'idle' | 'loading' | 'success' | 'error';

export default function ClienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customer, isLoading: loadingCustomer } = useCustomer(id ?? '');
  const { data: orders = [], isLoading: loadingOrders } = useSaleOrders({
    customer_id: id,
  });

  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [devolutionOpen, setDevolutionOpen] = useState(false);
  const [devolutionNotes, setDevolutionNotes] = useState('');
  const [devolutionState, setDevolutionState] = useState<DevolutionState>('idle');

  const totalCompras = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

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

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Cargando cliente...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button onClick={() => navigate('/clientes')}>Volver a clientes</Button>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-8 min-h-screen">
      {/* Back */}
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => navigate('/clientes')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a clientes
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">{customer.full_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cliente desde{' '}
            {new Date(customer.created_at).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase ${
            customer.is_active
              ? 'bg-green-500/10 text-green-700'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {customer.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Email
          </p>
          <p className="text-sm font-semibold">{customer.email ?? '—'}</p>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Teléfono
          </p>
          <p className="text-sm font-semibold">{customer.phone ?? '—'}</p>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            CUIT / DNI
          </p>
          <p className="text-sm font-semibold font-mono">{customer.tax_id ?? '—'}</p>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Total compras
          </p>
          <p className="text-lg font-extrabold">
            ${totalCompras.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Historial de órdenes */}
      <div>
        <h2 className="text-lg font-extrabold mb-4">Historial de compras</h2>
        {loadingOrders ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Cargando historial...
          </div>
        ) : (
          <div className="bg-muted/30 rounded-2xl overflow-hidden p-1">
            <div className="bg-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Nº Orden
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Tipo
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Fecha
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Estado
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                      Total
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-16 text-muted-foreground"
                      >
                        Este cliente no tiene órdenes registradas
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((order) => (
                    <TableRow key={order.id} className="group h-14">
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-[11px] font-bold rounded-full uppercase ${
                            ORDER_TYPE_BADGE[order.type]
                          }`}
                        >
                          {ORDER_TYPE_LABEL[order.type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-[11px] font-bold rounded-full uppercase ${
                            ORDER_STATUS_BADGE[order.status]
                          }`}
                        >
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        $
                        {order.total.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleView(order)}
                          >
                            Ver detalle
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Drawer orden */}
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

      {/* Dialog devolución */}
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
