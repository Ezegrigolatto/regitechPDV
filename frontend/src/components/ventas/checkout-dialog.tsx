import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, User } from 'lucide-react';
import type { LocalTicket } from '@/stores/ventas.store';
import type { PaymentMethod } from '@/services/sale-orders.service';
import type { Customer } from '@/services/customers.service';

interface PaymentEntry {
  payment_method_id: string;
  amount: string;
  reference: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    orderType: 'sale' | 'remito' | 'presupuesto',
    payments: { payment_method_id: string; amount: number; reference?: string }[]
  ) => void;
  ticket: LocalTicket;
  paymentMethods: PaymentMethod[];
  isLoading?: boolean;
  customer: Customer | null;
}

export function CheckoutDialog({
  open,
  onClose,
  onConfirm,
  ticket,
  paymentMethods,
  isLoading,
  customer,
}: CheckoutDialogProps) {
  const [orderType, setOrderType] = useState<'sale' | 'remito' | 'presupuesto'>('sale');
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { payment_method_id: '', amount: ticket.total.toString(), reference: '' },
  ]);

  const totalPagado = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const diferencia = totalPagado - ticket.total;
  const isValid =
    orderType === 'presupuesto' ||
    (payments.every((p) => p.payment_method_id && parseFloat(p.amount) > 0) &&
      Math.abs(diferencia) < 0.01);

  console.log(diferencia);

  const addPayment = () => {
    setPayments((prev) => [
      ...prev,
      { payment_method_id: '', amount: '', reference: '' },
    ]);
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, field: keyof PaymentEntry, value: string) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const requiresReference = (methodId: string) => {
    return paymentMethods.find((m) => m.id === methodId)?.requires_reference ?? false;
  };

  const handleConfirm = () => {
    onConfirm(
      orderType,
      payments.map((p) => ({
        payment_method_id: p.payment_method_id,
        amount: parseFloat(p.amount),
        reference: p.reference || undefined,
      }))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">Cobrar</DialogTitle>
        </DialogHeader>

        {/* Cliente */}
        {customer && (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{customer.full_name}</p>
              {customer.tax_id && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  {customer.tax_id}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resumen del ticket */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">
              ${ticket.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {ticket.tax_total > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-semibold">
                ${ticket.tax_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {ticket.discount_value && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Descuento</span>
              <span className="font-semibold text-destructive">
                -
                {ticket.discount_type === 'percentage'
                  ? `${ticket.discount_value}%`
                  : `$${ticket.discount_value}`}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="font-extrabold text-lg">
              ${ticket.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tipo de orden */}
        <div className="space-y-2">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Tipo de comprobante
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(['sale', 'remito', 'presupuesto'] as const).map((type) => (
              <button
                key={type}
                className={`py-2.5 rounded-lg text-sm font-bold border transition-colors ${
                  orderType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setOrderType(type)}
              >
                {type === 'sale'
                  ? 'Factura'
                  : type === 'remito'
                  ? 'Remito'
                  : 'Presupuesto'}
              </button>
            ))}
          </div>
        </div>

        {/* Pagos */}
        {orderType !== 'presupuesto' && (
          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Métodos de pago
            </Label>

            {payments.map((payment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    value={payment.payment_method_id}
                    onValueChange={(val) =>
                      updatePayment(index, 'payment_method_id', val)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <span className="capitalize">{m.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      className="pl-7"
                      type="number"
                      placeholder="0.00"
                      value={payment.amount}
                      onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                    />
                  </div>

                  {payments.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removePayment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {requiresReference(payment.payment_method_id) && (
                  <Input
                    placeholder="Referencia (nº transferencia, últimos 4 dígitos...)"
                    value={payment.reference}
                    onChange={(e) => updatePayment(index, 'reference', e.target.value)}
                  />
                )}
              </div>
            ))}

            {payments.length < 3 && (
              <Button variant="outline" size="sm" onClick={addPayment} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar método de pago
              </Button>
            )}

            {totalPagado > 0 && (
              <div
                className={`flex justify-between text-sm font-bold rounded-lg px-3 py-2 ${
                  Math.abs(diferencia) < 0.01
                    ? 'bg-green-500/10 text-green-600'
                    : diferencia > 0
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                <span>
                  {Math.abs(diferencia) < 0.01
                    ? '✓ Monto exacto'
                    : diferencia > 0
                    ? 'Vuelto'
                    : 'Falta'}
                </span>
                <span>
                  {Math.abs(diferencia) < 0.01
                    ? ''
                    : `$${Math.abs(diferencia).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isLoading}>
            {isLoading
              ? 'Procesando...'
              : orderType === 'presupuesto'
              ? 'Generar Presupuesto'
              : 'Confirmar Cobro'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
