import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PDFActions } from '@/components/pdf/pdf-actions';
import { CheckCircle2 } from 'lucide-react';
import type { SaleOrder } from '@/services/sale-orders.service';

interface PostCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  order: SaleOrder | null;
  branchName?: string;
}

const ORDER_TYPE_LABEL = {
  sale: 'Factura',
  remito: 'Remito',
  presupuesto: 'Presupuesto',
};

export function PostCheckoutDialog({
  open,
  onClose,
  order,
  branchName = 'Casa Central',
}: PostCheckoutDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center">
            ¡Venta registrada!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-4 bg-green-500/10 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <div className="text-center space-y-1">
            <p className="font-bold text-lg">
              {ORDER_TYPE_LABEL[order.type]} #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-2xl font-extrabold">
              ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
            {order.customers && (
              <p className="text-sm text-muted-foreground">
                {order.customers.full_name}
              </p>
            )}
          </div>

          {/* PDF Actions */}
          <div className="w-full">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-3">
              Comprobante
            </p>
            <PDFActions
              order={order}
              branchName={branchName}
            />
          </div>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onClose}
          >
            Cerrar sin imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}