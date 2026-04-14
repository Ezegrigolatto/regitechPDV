import { useEffect, useState, useRef } from 'react';
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
import { ExternalLink, Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Supplier } from '@/services/suppliers.service';
import supabase from '../../../supabase-config';
import { toast } from 'sonner';

interface SupplierDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
  supplier?: Supplier | null;
  isLoading?: boolean;
  mode: 'view' | 'edit' | 'create';
}

const EMPTY_FORM = {
  name: '',
  razon_social: '',
  tax_id: '',
  email: '',
  phone: '',
  phone_2: '',
  address: '',
  website: '',
  notes: '',
  image_url: '',
};

export function SupplierDrawer({
  open,
  onClose,
  onSave,
  supplier,
  isLoading,
  mode,
}: SupplierDrawerProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEditing = mode === 'edit' || mode === 'create';

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name ?? '',
        razon_social: supplier.razon_social ?? '',
        tax_id: supplier.tax_id ?? '',
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        phone_2: supplier.phone_2 ?? '',
        address: supplier.address ?? '',
        website: supplier.website ?? '',
        notes: supplier.notes ?? '',
        image_url: supplier.image_url ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [supplier, open]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `suppliers/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('purchases')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('purchases').getPublicUrl(path);
      handleChange('image_url', data.publicUrl);
      toast.success('Imagen cargada');
    } catch (err: any) {
      toast.error('Error al subir imagen', { description: err?.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = () => {
    onSave({
      name: form.name,
      razon_social: form.razon_social || null,
      tax_id: form.tax_id || null,
      email: form.email || null,
      phone: form.phone || null,
      phone_2: form.phone_2 || null,
      address: form.address || null,
      website: form.website || null,
      notes: form.notes || null,
      image_url: form.image_url || null,
      is_active: true,
    });
  };

  const title =
    mode === 'create' ? 'Nuevo Proveedor' :
    mode === 'edit' ? 'Editar Proveedor' :
    'Detalle de Proveedor';

  const badge =
    mode === 'create' ? 'Nuevo' :
    mode === 'edit' ? 'Modo Edición' :
    'Vista';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[480px] sm:w-[480px] flex flex-col p-0 gap-0">
        <SheetHeader className="p-8 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded">
              {badge}
            </span>
            {supplier?.is_active === false && (
              <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded">
                Inactivo
              </span>
            )}
          </div>
          <SheetTitle className="text-3xl font-extrabold text-left">{title}</SheetTitle>
          {supplier && (
            <p className="text-sm text-muted-foreground text-left">
              Proveedor desde {new Date(supplier.created_at).toLocaleDateString('es-AR', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Imagen */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {form.image_url ? (
                <img
                  src={form.image_url}
                  alt="Logo proveedor"
                  className="h-20 w-20 rounded-xl object-cover border"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border">
                  {form.name ? form.name.slice(0, 2).toUpperCase() : '?'}
                </div>
              )}
              {isEditing && (
                <button
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:opacity-90 transition-opacity"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <p className="font-bold text-lg">{form.name || 'Nombre del proveedor'}</p>
              {form.razon_social && (
                <p className="text-sm text-muted-foreground">{form.razon_social}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Info general */}
          <div>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Información general
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Nombre *
                </Label>
                {isEditing ? (
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nombre del proveedor"
                  />
                ) : (
                  <p className="text-sm font-semibold">{supplier?.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Razón Social
                </Label>
                {isEditing ? (
                  <Input
                    value={form.razon_social}
                    onChange={(e) => handleChange('razon_social', e.target.value)}
                    placeholder="Razón Social S.A."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{supplier?.razon_social ?? '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  CUIT
                </Label>
                {isEditing ? (
                  <Input
                    value={form.tax_id}
                    onChange={(e) => handleChange('tax_id', e.target.value)}
                    placeholder="30-12345678-9"
                  />
                ) : (
                  <p className="text-sm font-mono text-muted-foreground">{supplier?.tax_id ?? '—'}</p>
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
                    placeholder="contacto@proveedor.com"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{supplier?.email ?? '—'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Teléfono
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+54 11 1234-5678"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{supplier?.phone ?? '—'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Teléfono 2
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form.phone_2}
                      onChange={(e) => handleChange('phone_2', e.target.value)}
                      placeholder="+54 11 8765-4321"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{supplier?.phone_2 ?? '—'}</p>
                  )}
                </div>
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
                  <p className="text-sm text-muted-foreground">{supplier?.address ?? '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Sitio web
                </Label>
                {isEditing ? (
                  <Input
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://www.proveedor.com"
                  />
                ) : supplier?.website ? (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {supplier.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Notas */}
          <div>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Notas internas
            </p>
            {isEditing ? (
              <textarea
                className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                rows={4}
                placeholder="Notas sobre el proveedor..."
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {supplier?.notes ?? 'Sin notas'}
              </p>
            )}
          </div>

          {/* Historial — solo en modo view */}
          {mode === 'view' && supplier && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                  Compras
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onClose();
                    navigate(`/proveedores/${supplier.id}`);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver historial de compras
                </Button>
              </div>
            </>
          )}
        </div>

        {isEditing && (
          <div className="p-8 border-t grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !form.name}
            >
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Proveedor' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}