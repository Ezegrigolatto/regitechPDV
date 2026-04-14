import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomerTable } from '@/components/clientes/customer-table';
import { CustomerDrawer } from '@/components/clientes/customer-drawer';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeactivateCustomer,
} from '@/hooks/use-customers';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer } from '@/services/customers.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePermissions } from '@/hooks/use-permissions';

export default function Clientes() {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { can } = usePermissions();
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deactivateCustomer = useDeactivateCustomer();

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.tax_id ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q)
    );
  });

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerMode(can('customers', 'edit') ? 'view' : 'view');
    setDrawerOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    if (!can('customers', 'edit')) return;
    setSelectedCustomer(customer);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleDeleteRequest = (customer: Customer) => {
    setDeleteCustomer(customer);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCustomer) return;
    setDeleteLoading(true);
    try {
      await deactivateCustomer.mutateAsync(deleteCustomer.id);
      toast.success('Cliente desactivado correctamente');
      setDeleteOpen(false);
      setDeleteCustomer(null);
    } catch (err: any) {
      toast.error('Error al desactivar cliente', {
        description: err?.message ?? 'Intentá de nuevo',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async (data: Partial<Customer>) => {
    try {
      if (drawerMode === 'create') {
        await createCustomer.mutateAsync(data as any);
        toast.success('Cliente creado correctamente');
      } else if (drawerMode === 'edit' && selectedCustomer) {
        await updateCustomer.mutateAsync({ id: selectedCustomer.id, customer: data });
        toast.success('Cliente actualizado correctamente');
      }
      setDrawerOpen(false);
      setSelectedCustomer(null);
    } catch (err: any) {
      toast.error('Error al guardar cliente', {
        description: err?.message ?? 'Intentá de nuevo',
      });
    }
  };

  return (
    <div className="w-full px-8 py-8 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrá tu base de clientes
          </p>
        </div>
        {can('customers', 'create') && (
          <Button onClick={handleCreate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, email, CUIT o teléfono..."
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
          {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
        </p>
      </div>

      {/* Tabla */}
      <CustomerTable
        customers={filtered}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        isLoading={isLoading}
        canEdit={can('customers', 'edit')}
        canDeactivate={can('customers', 'deactivate')}
      />

      {/* Drawer */}
      <CustomerDrawer
        open={drawerOpen}
        onClose={() => {
          if (!deleteOpen) {
            setDrawerOpen(false);
            setSelectedCustomer(null);
          }
        }}
        onSave={handleSave}
        customer={selectedCustomer}
        mode={drawerMode}
        isLoading={createCustomer.isPending || updateCustomer.isPending}
      />

      {/* Dialog desactivar */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            setDeleteOpen(false);
            setDeleteCustomer(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desactivar cliente?</DialogTitle>
            <DialogDescription>
              El cliente <strong>{deleteCustomer?.full_name}</strong> será desactivado y
              no aparecerá en búsquedas. Podés reactivarlo después.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteCustomer(null);
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
              {deleteLoading ? 'Desactivando...' : 'Desactivar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
