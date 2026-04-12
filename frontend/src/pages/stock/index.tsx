import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StockStats } from '@/components/stock/stock-stats';
import { ProductTable } from '@/components/stock/product-table';
import { ProductDrawer } from '@/components/stock/product-drawer';
import { CategoryDialog } from '@/components/stock/category-dialog';
import { useAuthStore } from '@/stores/auth.store';
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeactivateProduct,
} from '@/hooks/use-products';
import { stockKeys, useBranchStock, useLowStock } from '@/hooks/use-stock';
import { Plus, Tag, Download, Search } from 'lucide-react';
import type { Product } from '@/services/products.service';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/hooks/use-products';
import * as XLSX from 'xlsx';
import supabase from '../../../supabase-config';

export default function Stock() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id ?? '';

  const queryClient = useQueryClient();

  // Queries
  const { data: products = [], isLoading: loadingProducts } = useProducts({
    is_active: true,
  });
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: branchStock = [] } = useBranchStock(branchId);
  const { data: lowStock = [] } = useLowStock(branchId);

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deactivateProduct = useDeactivateProduct();

  // UI state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Handlers — Producto
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  const handleSaveProduct = async (data: Partial<Product>, newStock: number) => {
    try {
      let productId = editingProduct?.id;

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, product: data });
      } else {
        const created = await createProduct.mutateAsync(data as any);
        productId = created.id;
      }

      if (productId && branchId) {
        const currentStockEntry = branchStock.find((s) => s.product_id === productId);
        const currentQty = currentStockEntry?.quantity ?? 0;
        const diff = newStock - currentQty;

        if (diff !== 0) {
          const { error: rpcError } = await supabase.rpc(
            diff > 0 ? 'increment_stock' : 'decrement_stock',
            {
              p_product_id: productId,
              p_branch_id: branchId,
              p_quantity: Math.abs(diff),
            }
          );

          if (rpcError) throw new Error(`Error actualizando stock: ${rpcError.message}`);

          const { error: movError } = await supabase.from('stock_movements').insert({
            product_id: productId,
            branch_id: branchId,
            type: 'adjustment',
            quantity: diff,
            reference_type: 'manual',
            notes: 'Ajuste manual desde gestión de stock',
            created_by: profile?.id,
          });

          if (movError)
            throw new Error(`Error registrando movimiento: ${movError.message}`);
        }

        queryClient.invalidateQueries({ queryKey: stockKeys.byBranch(branchId) });
        queryClient.invalidateQueries({ queryKey: stockKeys.lowStock(branchId) });
      }

      setDrawerOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error guardando producto:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await deactivateProduct.mutateAsync(id);
  };

  // Handlers — Categorías
  const handleCreateCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert({ name });
    if (error) {
      console.error('Error creando categoría:', error);
      return;
    }
    queryClient.invalidateQueries({ queryKey: productKeys.categories() });
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    await supabase.from('categories').update({ name }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: productKeys.categories() });
  };

  const handleDeleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: productKeys.categories() });
  };

  // Exportar
  const handleExport = (format: 'xlsx' | 'csv') => {
    const filtered = products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku ?? '').toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        !filterCategory || filterCategory === 'all' || p.category_id === filterCategory;

      return matchSearch && matchCategory;
    });

    const rows = filtered.map((p) => ({
      SKU: p.sku ?? '',
      Nombre: p.name,
      Categoría: p.categories?.name ?? '',
      'Precio Minorista': p.retail_price,
      'Precio Mayorista': p.wholesale_price,
      'Precio Costo': p.cost_price,
      'Stock Mínimo': p.stock_min,
      Stock: branchStock.find((s) => s.product_id === p.id)?.quantity ?? 0,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock');

    if (format === 'xlsx') {
      XLSX.writeFile(wb, 'stock.xlsx');
    } else {
      XLSX.writeFile(wb, 'stock.csv', { bookType: 'csv' });
    }
  };

  const isLoading = loadingProducts || loadingCategories;

  return (
    <div className="w-full px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Gestión de Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrá productos, categorías y niveles de inventario
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Búsqueda */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar artículo o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Exportar */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>

          {/* Categorías */}
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Categorías
          </Button>

          {/* Nuevo producto */}
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Artículo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StockStats
        totalProducts={products.length}
        lowStockCount={lowStock.length}
        categoriesCount={categories.length}
      />

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          Cargando productos...
        </div>
      ) : (
        <ProductTable
          products={products}
          categories={categories}
          branchStock={branchStock}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteProduct}
          filterCategory={filterCategory}
          onFilterCategory={setFilterCategory}
          filterSearch={search}
        />
      )}

      {/* Drawer crear/editar */}
      <ProductDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        currentStock={
          editingProduct
            ? branchStock.find((s) => s.product_id === editingProduct.id)?.quantity ?? 0
            : 0
        }
        isLoading={createProduct.isPending || updateProduct.isPending}
      />

      {/* Dialog categorías */}
      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        categories={categories}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
}
