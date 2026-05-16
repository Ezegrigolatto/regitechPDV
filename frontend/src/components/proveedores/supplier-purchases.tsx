import { useState, useRef } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import {
  getSupplierPurchases,
  createSupplierPurchase,
  deleteSupplierPurchase,
  uploadPurchaseFile,
  type SupplierPurchase,
} from '@/services/suppliers-purchases.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SupplierPurchasesProps {
  supplierId: string;
}

type FormState = 'idle' | 'loading' | 'success';
type ViewMode = 'table' | 'grid';

export function SupplierPurchases({ supplierId }: SupplierPurchasesProps) {
  const { profile, user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SupplierPurchase | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['supplier_purchases', supplierId],
    queryFn: () => getSupplierPurchases(supplierId),
    enabled: !!supplierId,
  });

  const createMutation = useMutation({
    mutationFn: createSupplierPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier_purchases', supplierId] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleCreate = async () => {
    if (!form.amount || !form.date) {
      toast.error('Completá la fecha y el monto');
      return;
    }
    setFormState('loading');
    try {
      let file_url = null;
      let file_name = null;

      if (selectedFile) {
        const uploaded = await uploadPurchaseFile(supplierId, selectedFile);
        file_url = uploaded.url;
        file_name = uploaded.name;
      }

      await createMutation.mutateAsync({
        supplier_id: supplierId,
        branch_id: profile?.branch_id ?? '',
        date: form.date,
        amount: parseFloat(form.amount),
        notes: form.notes || null,
        file_url,
        file_name,
        created_by: user?.id ?? null,
      });

      setFormState('success');
    } catch (err: any) {
      toast.error('Error al registrar compra', { description: err?.message });
      setFormState('idle');
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormState('idle');
    setForm({
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      notes: '',
    });
    setSelectedFile(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSupplierPurchase(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ['supplier_purchases', supplierId] });
      toast.success('Compra eliminada');
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Error al eliminar compra', { description: err?.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalCompras = purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold">Historial de compras</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {purchases.length} compras · Total: $
            {totalCompras.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de vista */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`p-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar compra
          </Button>
        </div>
      </div>

      {/* Vista tabla */}
      {viewMode === 'table' && (
        <div className="bg-muted/30 rounded-2xl overflow-hidden p-1">
          <div className="bg-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Fecha
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                    Monto
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Archivo
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Notas
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Registrado por
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16 text-muted-foreground"
                    >
                      Cargando...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && purchases.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16 text-muted-foreground"
                    >
                      No hay compras registradas
                    </TableCell>
                  </TableRow>
                )}
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="group h-14">
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {new Date(purchase.date + 'T00:00:00').toLocaleDateString(
                          'es-AR',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      $
                      {purchase.amount.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      {purchase.file_url ? (
                        <a
                          href={purchase.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                        >
                          <FileText className="h-4 w-4" />
                          {purchase.file_name ?? 'Archivo'}
                          <Download className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                        {purchase.notes ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {purchase.profiles?.full_name ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeleteTarget(purchase);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Vista grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              Cargando...
            </div>
          )}
          {!isLoading && purchases.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No hay compras registradas
            </div>
          )}
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-card border rounded-2xl p-5 space-y-3 group relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(purchase.date + 'T00:00:00').toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xl font-extrabold mt-1">
                    $
                    {purchase.amount.toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setDeleteTarget(purchase);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {purchase.notes && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {purchase.notes}
                </p>
              )}

              {purchase.file_url && (
                <a
                  href={purchase.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                >
                  <FileText className="h-4 w-4" />
                  {purchase.file_name ?? 'Archivo'}
                  <Download className="h-3 w-3" />
                </a>
              )}

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {purchase.profiles?.full_name ?? '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog nueva compra */}
      <Dialog
        open={formOpen}
        onOpenChange={(o) => {
          if (!o && formState !== 'loading') handleCloseForm();
        }}
      >
        <DialogContent showCloseButton={formState !== 'loading'} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold">
              {formState === 'success' ? '¡Compra registrada!' : 'Registrar compra'}
            </DialogTitle>
          </DialogHeader>

          {formState === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <Button className="w-full" onClick={handleCloseForm}>
                Cerrar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Fecha *
                  </Label>
                  <DatePicker
                    mode="popover"
                    className="w-full"
                    value={new Date(form.date + 'T00:00:00')}
                    onDateChange={(date) => setForm((p) => ({ ...p, date: format(date, 'yyyy-MM-dd') }))}
                    disabled={formState === 'loading'}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Monto *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      className="pl-7"
                      type="number"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                      disabled={formState === 'loading'}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Notas
                </Label>
                <textarea
                  className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  rows={3}
                  placeholder="Detalles de la compra..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  disabled={formState === 'loading'}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Archivo adjunto (PDF, Excel, CSV)
                </Label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 text-primary" />
                      {selectedFile.name}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Hacé click para seleccionar un archivo
                    </p>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={formState === 'loading'}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseForm}
                  disabled={formState === 'loading'}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={formState === 'loading' || !form.amount || !form.date}
                >
                  {formState === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    'Registrar'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog eliminar */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (!o && !deleteLoading) {
            setDeleteOpen(false);
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar compra?</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
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
                  Eliminando...
                </span>
              ) : (
                'Eliminar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
