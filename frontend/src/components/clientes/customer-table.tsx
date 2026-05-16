import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, UserX } from 'lucide-react';
import type { Customer } from '@/services/customers.service';

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDeactivate?: boolean;
}

export function CustomerTable({
  customers,
  onView,
  onEdit,
  onDelete,
  isLoading,
  canDeactivate,
  canEdit,
}: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        Cargando clientes...
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
                Nombre
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Email
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Teléfono
              </TableHead>
              <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                CUIT/DNI
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
            {customers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-muted-foreground"
                >
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            )}
            {customers.map((customer) => (
              <TableRow key={customer.id} className="group h-14">
                <TableCell>
                  <span className="font-semibold">{customer.full_name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {customer.email ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {customer.phone ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {customer.tax_id ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-[11px] font-bold rounded-full uppercase ${
                      customer.is_active
                        ? 'bg-green-500/10 text-green-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {customer.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => onView(customer)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeactivate && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(customer)}
                      >
                        <UserX className="h-4 w-4" />
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
