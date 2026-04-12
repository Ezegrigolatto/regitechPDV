import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TicketTabs } from '@/components/ventas/ticket-tabs';
import { ProductSearch } from '@/components/ventas/product-search';
import { CheckoutDialog } from '@/components/ventas/checkout-dialog';
import { useVentasStore } from '@/stores/ventas.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCloseTicket, usePaymentMethods } from '@/hooks/use-sale-orders';
import { useBranchStock } from '@/hooks/use-stock';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MinusCircle, PlusCircle, Trash2, ShoppingCart, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Ventas = () => {
  const { profile } = useAuthStore();
  const {
    tickets,
    activeTicketId,
    addTicket,
    getActiveTicket,
    incrementItem,
    decrementItem,
    removeItem,
    setDiscount,
    clearTicket,
  } = useVentasStore();

  const activeTicket = getActiveTicket();
  const { data: branchStock = [] } = useBranchStock(profile?.branch_id ?? '');

  const getStock = (productId: string) =>
    branchStock.find((s) => s.product_id === productId)?.quantity ?? 0;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const { data: paymentMethods = [] } = usePaymentMethods();
  const closeTicket = useCloseTicket();

  const handleApplyDiscount = () => {
    if (!activeTicketId || !discountValue) return;
    setDiscount(activeTicketId, discountType, parseFloat(discountValue));
  };

  const handleRemoveDiscount = () => {
    if (!activeTicketId) return;
    setDiscount(activeTicketId, null, null);
    setDiscountValue('');
  };

  const handleConfirmCheckout = async (
    orderType: 'sale' | 'remito' | 'presupuesto',
    payments: { payment_method_id: string; amount: number; reference?: string }[]
  ) => {
    const supabase = (await import('../../../supabase-config')).default;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!activeTicket) return;

    try {
      let ticketId = activeTicket.id;

      if (!activeTicket.synced) {
        const supabase = (await import('../../../supabase-config')).default;
        const { data: created, error } = await supabase
          .from('tickets')
          .insert({
            branch_id: activeTicket.branch_id,
            created_by: profile?.id,
            customer_id: activeTicket.customer_id,
            price_list: activeTicket.price_list,
            items: activeTicket.items,
            discount_type: activeTicket.discount_type,
            discount_value: activeTicket.discount_value,
            subtotal: activeTicket.subtotal,
            tax_total: activeTicket.tax_total,
            total: activeTicket.total,
            notes: activeTicket.notes,
            status: 'open',
          })
          .select()
          .single();

        if (error) throw new Error(`Error creando ticket: ${error.message}`);
        ticketId = created.id;
      }

      await closeTicket.mutateAsync({
        ticket_id: ticketId,
        order_type: orderType,
        payments,
      });

      clearTicket(activeTicket.id);
      setCheckoutOpen(false);
      setDiscountValue('');

      const label =
        orderType === 'sale'
          ? 'Factura'
          : orderType === 'remito'
          ? 'Remito'
          : 'Presupuesto';

      toast.success(`${label} generado correctamente`, {
        description: `Total: $${activeTicket.total.toLocaleString('es-AR', {
          minimumFractionDigits: 2,
        })}`,
      });
    } catch (err: any) {
      console.error('Error al cerrar ticket:', err);
      toast.error('Error al procesar el cobro', {
        description: err?.message ?? 'Intentá de nuevo',
      });
    }
  };

  // Sin tickets abiertos
  if (tickets.length === 0) {
    return (
      <div className="w-full px-6 flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="p-6 bg-muted rounded-full">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No hay tickets abiertos</h2>
        <p className="text-muted-foreground text-sm">
          Creá un nuevo ticket para empezar a vender
        </p>
        <Button
          onClick={() => addTicket(profile?.branch_id ?? '', profile?.id ?? '')}
          size="lg"
        >
          Nuevo Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6 flex flex-col gap-4">
      {/* Tabs */}
      <TicketTabs />

      {/* Contenido del ticket activo */}
      {activeTicket && (
        <div className="flex flex-col gap-4">
          {/* Búsqueda */}
          <ProductSearch />

          {/* Tabla de items */}
          <div className="border rounded-2xl overflow-auto max-h-[45vh]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-[100px] text-center">Código</TableHead>
                  <TableHead>Artículo</TableHead>
                  <TableHead className="text-center">Precio</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-center">Importe</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTicket.items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Buscá un producto para agregarlo al ticket
                    </TableCell>
                  </TableRow>
                )}
                {activeTicket.items.map((item) => (
                  <TableRow key={item.product_id} className="h-14">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {item.sku ?? '—'}
                    </TableCell>
                    <TableCell className="font-semibold max-w-[200px] truncate">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-center">
                      $
                      {item.unit_price.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <MinusCircle
                          className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors h-5 w-5"
                          onClick={() => decrementItem(activeTicket.id, item.product_id)}
                        />
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <PlusCircle
                          className={`h-5 w-5 transition-colors ${
                            item.quantity >= getStock(item.product_id)
                              ? 'text-muted-foreground/30 cursor-not-allowed'
                              : 'cursor-pointer text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => {
                            if (item.quantity >= getStock(item.product_id)) return;
                            incrementItem(activeTicket.id, item.product_id);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      $
                      {item.subtotal.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const stock = getStock(item.product_id);
                        const isLow = stock <= item.quantity;
                        return (
                          <span
                            className={
                              isLow
                                ? 'text-destructive font-bold'
                                : 'text-muted-foreground'
                            }
                          >
                            {stock}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Trash2
                          className="h-4 w-4 text-destructive cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={() => removeItem(activeTicket.id, item.product_id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer del ticket */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            {/* Descuento */}
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Descuento
                </label>
                <div className="flex gap-2">
                  <Select
                    value={discountType}
                    onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}
                  >
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">$ Fijo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="w-24 h-9"
                    type="number"
                    placeholder="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={handleApplyDiscount}
                  >
                    Aplicar
                  </Button>
                  {activeTicket.discount_value && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 text-destructive"
                      onClick={handleRemoveDiscount}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Totales + Cobrar */}
            <div className="flex items-end gap-6">
              <div className="text-right space-y-1">
                <div className="flex justify-between gap-8 text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>
                    $
                    {activeTicket.subtotal.toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {activeTicket.tax_total > 0 && (
                  <div className="flex justify-between gap-8 text-sm text-muted-foreground">
                    <span>Impuestos</span>
                    <span>
                      $
                      {activeTicket.tax_total.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {activeTicket.discount_value && (
                  <div className="flex justify-between gap-8 text-sm text-destructive">
                    <span>Descuento</span>
                    <span>
                      -
                      {activeTicket.discount_type === 'percentage'
                        ? `${activeTicket.discount_value}%`
                        : `$${activeTicket.discount_value}`}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between gap-8 font-extrabold text-lg">
                  <span>Total</span>
                  <span>
                    $
                    {activeTicket.total.toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="h-14 px-8 text-base font-bold"
                disabled={activeTicket.items.length === 0 || closeTicket.isPending}
                onClick={() => setCheckoutOpen(true)}
              >
                {closeTicket.isPending ? 'Procesando...' : 'Cobrar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout dialog */}
      {activeTicket && (
        <CheckoutDialog
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={handleConfirmCheckout}
          ticket={activeTicket}
          paymentMethods={paymentMethods}
          isLoading={closeTicket.isPending}
        />
      )}
    </div>
  );
};

export default Ventas;
