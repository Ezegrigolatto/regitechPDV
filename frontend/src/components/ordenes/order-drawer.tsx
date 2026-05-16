import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { SaleOrder } from '@/services/sale-orders.service';
import { PDFActions } from '@/components/pdf/pdf-actions';
interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  order: SaleOrder | null;
  onDevolution: (orderId: string) => void;
  isDevolutionLoading?: boolean;
  canDevolution?: boolean;
}

const ORDER_TYPE_LABEL = {
  sale: 'Factura de Venta',
  remito: 'Remito',
  presupuesto: 'Presupuesto',
};

const ORDER_TYPE_COLOR = {
  sale: 'bg-green-500/10 text-green-700',
  remito: 'bg-blue-500/10 text-blue-700',
  presupuesto: 'bg-yellow-500/10 text-yellow-700',
};

const ORDER_STATUS_LABEL = {
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
  returned: 'Devuelto',
};

const ORDER_STATUS_COLOR = {
  pending: 'bg-muted text-muted-foreground',
  completed: 'bg-green-500/10 text-green-700',
  cancelled: 'bg-destructive/10 text-destructive',
  returned: 'bg-orange-500/10 text-orange-700',
};

export function OrderDrawer({
  open,
  onClose,
  order,
  onDevolution,
  isDevolutionLoading,
  canDevolution,
}: OrderDrawerProps) {
  if (!order) return null;

  const canDevolutionBtn =
    canDevolution &&
    (order.type === 'sale' || order.type === 'remito') &&
    order.status === 'completed';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[480px] sm:w-[480px] flex flex-col p-0 gap-0">
        <SheetHeader className="p-8 border-b">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded ${
                ORDER_TYPE_COLOR[order.type]
              }`}
            >
              {ORDER_TYPE_LABEL[order.type]}
            </span>
            <span
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded ${
                ORDER_STATUS_COLOR[order.status]
              }`}
            >
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>
          <SheetTitle className="text-2xl font-extrabold text-left">
            Orden #{order.id.slice(0, 8).toUpperCase()}
          </SheetTitle>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {order.customers && (
              <p className="text-sm font-medium">Cliente: {order.customers.full_name}</p>
            )}
            {order.profiles && (
              <p className="text-sm text-muted-foreground">
                Vendedor: {order.profiles.full_name}
              </p>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {order.type === 'presupuesto' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-yellow-700 font-medium">
              Este presupuesto toma el valor del/los producto/s al momento de su creación. No
              genera movimiento de stock ni es una venta.
            </div>
          )}
          {order.type === 'remito' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-700 font-medium">
              Este remito registra una entrega de mercadería sin factura electrónica.
            </div>
          )}
          {order.type === 'sale' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
              Venta con factura.{' '}
              {order.afip_cae
                ? `CAE: ${order.afip_cae}`
                : 'Sin CAE asignado (integración AFIP pendiente).'}
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              Productos
            </p>
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex flex-col flex-1 min-w-0 pr-4">
                  <span className="text-sm font-semibold truncate">{item.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.sku && (
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {item.sku}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {item.quantity} {item.unit ?? 'u'} × $
                      {item.unit_price.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold whitespace-nowrap">
                  ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>
                ${order.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {order.tax_total > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Impuestos</span>
                <span>
                  ${order.tax_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {order.discount_value && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Descuento</span>
                <span>
                  -
                  {order.discount_type === 'percentage'
                    ? `${order.discount_value}%`
                    : `$${order.discount_value}`}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-extrabold text-lg">
              <span>Total</span>
              <span>
                ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {order.payments && order.payments.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                Pagos
              </p>
              {order.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between text-sm">
                  <span className="capitalize text-muted-foreground">
                    {payment.payment_methods?.name ?? '—'}
                    {payment.reference && ` (${payment.reference})`}
                  </span>
                  <span className="font-semibold">
                    $
                    {payment.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t flex flex-col gap-3">
          <PDFActions order={order} />
          {canDevolutionBtn && (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDevolution(order.id)}
              disabled={isDevolutionLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isDevolutionLoading ? 'Procesando...' : 'Devolver'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
