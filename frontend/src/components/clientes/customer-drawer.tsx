import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Customer } from '@/services/customers.service';

interface CustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => void;
  customer?: Customer | null;
  isLoading?: boolean;
  mode: 'view' | 'edit' | 'create';
}

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
  tax_id: '',
};

export function CustomerDrawer({
  open,
  onClose,
  onSave,
  customer,
  isLoading,
  mode,
}: CustomerDrawerProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = mode === 'edit' || mode === 'create';

  useEffect(() => {
    if (customer) {
      setForm({
        full_name: customer.full_name ?? '',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        tax_id: customer.tax_id ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [customer, open]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave({
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      tax_id: form.tax_id || null,
      is_active: true,
    });
  };

  const title =
    mode === 'create'
      ? 'Nuevo Cliente'
      : mode === 'edit'
      ? 'Editar Cliente'
      : 'Detalle de Cliente';

  const badge =
    mode === 'create'
      ? 'Nuevo'
      : mode === 'edit'
      ? 'Modo Edición'
      : 'Vista';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[450px] sm:w-[450px] flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="p-8 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded">
              {badge}
            </span>
            {customer?.is_active === false && (
              <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded">
                Inactivo
              </span>
            )}
          </div>
          <SheetTitle className="text-3xl font-extrabold text-left">
            {title}
          </SheetTitle>
          {customer && (
            <p className="text-sm text-muted-foreground text-left">
              Cliente desde {new Date(customer.created_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Info general */}
          <div>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Información general
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Nombre completo *
                </Label>
                {isEditing ? (
                  <Input
                    value={form.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Ej: Juan Pérez"
                  />
                ) : (
                  <p className="text-sm font-semibold">{customer?.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  CUIT / DNI
                </Label>
                {isEditing ? (
                  <Input
                    value={form.tax_id}
                    onChange={(e) => handleChange('tax_id', e.target.value)}
                    placeholder="20-12345678-9"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground font-mono">
                    {customer?.tax_id ?? '—'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contacto */}
          <div>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Contacto
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="juan@email.com"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {customer?.email ?? '—'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Teléfono
                </Label>
                {isEditing ? (
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {customer?.phone ?? '—'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Dirección
                </Label>
                {isEditing ? (
                  <Input
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Av. Corrientes 1234, CABA"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {customer?.address ?? '—'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Historial — solo en modo view */}
          {mode === 'view' && customer && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                  Historial de compras
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onClose();
                    navigate(`/clientes/${customer.id}`);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver historial completo
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="p-8 border-t grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !form.full_name}
            >
              {isLoading
                ? 'Guardando...'
                : mode === 'create'
                ? 'Crear Cliente'
                : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}