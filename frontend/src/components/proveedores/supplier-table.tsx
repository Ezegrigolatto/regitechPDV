import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, UserCheck, UserX } from 'lucide-react';
import type { Supplier } from '@/services/suppliers.service';

interface SupplierTableProps {
  suppliers: Supplier[];
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onActivate: (supplier: Supplier) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDeactivate?: boolean;
}

export function SupplierTable({
  suppliers,
  onView,
  onEdit,
  onDelete,
  onActivate,
  isLoading,
  canDeactivate,
  canEdit,
}: SupplierTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        Cargando proveedores...
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
                Proveedor
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Razón Social
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                CUIT
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Email
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Teléfono
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Estado
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-16 text-muted-foreground"
                >
                  No se encontraron proveedores
                </TableCell>
              </TableRow>
            )}
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="group h-14">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {supplier.image_url ? (
                      <img
                        src={supplier.image_url}
                        alt={supplier.name}
                        className="h-8 w-8 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {supplier.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold">{supplier.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {supplier.razon_social ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {supplier.tax_id ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {supplier.email ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {supplier.phone ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-[11px] font-bold rounded-full uppercase ${
                      supplier.is_active
                        ? 'bg-green-500/10 text-green-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {supplier.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>
                <TableCell className="w-[100px] text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onView(supplier)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeactivate && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 ${
                        supplier.is_active
                          ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-500/10'
                      }`}
                      onClick={() =>
                        supplier.is_active ? onDelete(supplier) : onActivate(supplier)
                      }
                    >
                      {supplier.is_active ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                  )}
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
