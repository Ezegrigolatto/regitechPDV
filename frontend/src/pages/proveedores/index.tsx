import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SupplierTable } from '@/components/proveedores/supplier-table';
import { SupplierDrawer } from '@/components/proveedores/supplier-drawer';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeactivateSupplier,
  useActivateSupplier,
} from '@/hooks/use-suppliers';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Supplier } from '@/services/suppliers.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export default function Proveedores() {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { can } = usePermissions();

  const { data: suppliers = [], isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deactivateSupplier = useDeactivateSupplier();
  const activateSupplier = useActivateSupplier();

  const filtered = suppliers.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.razon_social ?? '').toLowerCase().includes(q) ||
      (s.tax_id ?? '').toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q)
    );
  });

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleDeleteRequest = (supplier: Supplier) => {
    setDeleteSupplier(supplier);
    setDeleteOpen(true);
  };

  const handleActivate = async (supplier: Supplier) => {
    try {
      await activateSupplier.mutateAsync(supplier.id);
      toast.success('Proveedor activado correctamente');
    } catch (err: any) {
      toast.error('Error al activar proveedor', { description: err?.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSupplier) return;
    setDeleteLoading(true);
    try {
      await deactivateSupplier.mutateAsync(deleteSupplier.id);
      toast.success('Proveedor desactivado correctamente');
      setDeleteOpen(false);
      setDeleteSupplier(null);
    } catch (err: any) {
      toast.error('Error al desactivar proveedor', { description: err?.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async (data: Partial<Supplier>) => {
    try {
      if (drawerMode === 'create') {
        await createSupplier.mutateAsync(data as any);
        toast.success('Proveedor creado correctamente');
      } else if (drawerMode === 'edit' && selectedSupplier) {
        await updateSupplier.mutateAsync({ id: selectedSupplier.id, supplier: data });
        toast.success('Proveedor actualizado correctamente');
      }
      setDrawerOpen(false);
      setSelectedSupplier(null);
    } catch (err: any) {
      toast.error('Error al guardar proveedor', { description: err?.message });
    }
  };

  return (
    <div className="w-full px-8 py-8 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Proveedores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrá tu base de proveedores
          </p>
        </div>
        {can('suppliers', 'create') && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, razón social, CUIT o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <Button variant="ghost" onClick={() => setSearch('')}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Contador */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'proveedor' : 'proveedores'}
        </p>
      </div>

      {/* Tabla */}
      <SupplierTable
        suppliers={filtered}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onActivate={handleActivate}
        isLoading={isLoading}
        canEdit={can('suppliers', 'edit')}
        canDeactivate={can('suppliers', 'deactivate')}
      />

      {/* Drawer */}
      <SupplierDrawer
        open={drawerOpen}
        onClose={() => {
          if (!deleteOpen) {
            setDrawerOpen(false);
            setSelectedSupplier(null);
          }
        }}
        onSave={handleSave}
        supplier={selectedSupplier}
        mode={drawerMode}
        isLoading={createSupplier.isPending || updateSupplier.isPending}
      />

      {/* Dialog desactivar */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            setDeleteOpen(false);
            setDeleteSupplier(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desactivar proveedor?</DialogTitle>
            <DialogDescription>
              El proveedor <strong>{deleteSupplier?.name}</strong> será desactivado. Podés
              reactivarlo después.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteSupplier(null);
              }}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Desactivando...
                </span>
              ) : (
                'Desactivar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
