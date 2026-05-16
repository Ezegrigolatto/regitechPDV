import { useParams, useNavigate } from 'react-router-dom';
import { useSupplier } from '@/hooks/use-suppliers';
import { SupplierPurchases } from '@/components/proveedores/supplier-purchases';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function ProveedorDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: supplier, isLoading } = useSupplier(id ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Cargando proveedor...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Proveedor no encontrado</p>
        <Button onClick={() => navigate('/proveedores')}>Volver a proveedores</Button>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-8 min-h-[calc(100vh-4rem)]">
      {/* Back */}
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => navigate('/proveedores')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a proveedores
      </Button>

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {supplier.image_url ? (
          <img
            src={supplier.image_url}
            alt={supplier.name}
            className="h-20 w-20 rounded-2xl object-cover border shadow-sm"
          />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border">
            {supplier.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">{supplier.name}</h1>
              {supplier.razon_social && (
                <p className="text-muted-foreground mt-0.5">{supplier.razon_social}</p>
              )}
              {supplier.tax_id && (
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  CUIT: {supplier.tax_id}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase ${
                supplier.is_active
                  ? 'bg-green-500/10 text-green-700'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {supplier.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {supplier.email && (
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Email
              </p>
              <p className="text-sm font-semibold truncate">{supplier.email}</p>
            </div>
          </div>
        )}
        {supplier.phone && (
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Teléfono
              </p>
              <p className="text-sm font-semibold">{supplier.phone}</p>
              {supplier.phone_2 && (
                <p className="text-xs text-muted-foreground">{supplier.phone_2}</p>
              )}
            </div>
          </div>
        )}
        {supplier.address && (
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Dirección
              </p>
              <p className="text-sm font-semibold truncate">{supplier.address}</p>
            </div>
          </div>
        )}
        {supplier.website && (
          <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Sitio web
              </p>
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 truncate"
              >
                {supplier.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Notas */}
      {supplier.notes && (
        <div className="bg-card border rounded-xl p-5 mb-8">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Notas internas
          </p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {supplier.notes}
          </p>
        </div>
      )}

      {/* Compras */}
      <SupplierPurchases supplierId={id ?? ''} />
    </div>
  );
}
