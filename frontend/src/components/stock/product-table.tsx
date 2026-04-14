import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Pencil, Trash2, FilterX } from 'lucide-react';
import type { Product, Category } from '@/services/products.service';
import type { BranchStock } from '@/services/stock.service';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  branchStock: BranchStock[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  filterCategory: string;
  onFilterCategory: (val: string) => void;
  filterSearch: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const PAGE_SIZE = 10;

export function ProductTable({
  products,
  categories,
  branchStock,
  onEdit,
  onDelete,
  filterCategory,
  onFilterCategory,
  filterSearch,
  canEdit,
  canDelete,
}: ProductTableProps) {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStock = (productId: string) => {
    const stock = branchStock.find((s) => s.product_id === productId);
    return stock?.quantity ?? 0;
  };

  const getStockMin = (product: Product) => product.stock_min ?? 0;

  const isLowStock = (product: Product) => getStock(product.id) <= getStockMin(product);

  // Filtros locales
  const filtered = products.filter((p) => {
    const matchSearch =
      !filterSearch ||
      p.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(filterSearch.toLowerCase()) ||
      (p.barcode ?? '').toLowerCase().includes(filterSearch.toLowerCase());

    const matchCategory =
      !filterCategory || filterCategory === 'all' || p.category_id === filterCategory;

    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (val: string) => {
    onFilterCategory(val);
    setPage(1);
  };

  return (
    <>
      {/* Controles */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 items-center">
          <Select value={filterCategory} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filterCategory && filterCategory !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => handleFilterChange('all')}
            >
              <FilterX className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-muted/30 rounded-2xl overflow-hidden p-1">
        <div className="bg-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Código
                </TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Artículo
                </TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Categoría
                </TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                  Precio Minorista
                </TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                  Precio Mayorista
                </TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                  Stock Actual
                </TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-16 text-muted-foreground"
                  >
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((product) => {
                const stock = getStock(product.id);
                const low = isLowStock(product);
                return (
                  <TableRow key={product.id} className="group h-16">
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {product.sku ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{product.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-muted text-[11px] font-bold text-muted-foreground rounded-full uppercase">
                        {product.categories?.name ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      $
                      {product.retail_price.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-bold text-muted-foreground">
                      $
                      {product.wholesale_price.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {low ? (
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-destructive">{stock}</span>
                          <span className="text-[9px] font-bold text-destructive uppercase">
                            Crítico
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">{stock}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => onEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground font-medium">
        <span>
          Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
          {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} artículos
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </Button>
        </div>
      </div>

      {/* Confirm Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              El producto será desactivado y no aparecerá en ventas ni búsquedas. Podés
              reactivarlo después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
