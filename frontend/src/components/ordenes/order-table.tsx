import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { SaleOrder } from '@/services/sale-orders.service';

interface OrderTableProps {
  orders: SaleOrder[];
  onView: (order: SaleOrder) => void;
  isLoading?: boolean;
}

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

const PAGE_SIZE = 15;

export function OrderTable({ orders, onView, isLoading }: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        Cargando órdenes...
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
                Nº Orden
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Tipo
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Cliente
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
                  colSpan={7}
                  className="text-center py-16 text-muted-foreground"
                >
                  No se encontraron órdenes
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
                  <span className="text-sm">
                    {order.customers?.full_name ?? (
                      <span className="text-muted-foreground">Sin cliente</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
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
                  ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => onView(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
