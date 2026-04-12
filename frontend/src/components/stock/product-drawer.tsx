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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Product, Category } from '@/services/products.service';

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>, currentStock: number) => void;
  product?: Product | null;
  categories: Category[];
  currentStock?: number;
  isLoading?: boolean;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  sku: '',
  barcode: '',
  category_id: '',
  retail_price: '',
  wholesale_price: '',
  cost_price: '',
  stock_min: '',
  current_stock: '',
};

export function ProductDrawer({
  open,
  onClose,
  onSave,
  product,
  categories,
  currentStock = 0,
  isLoading,
}: ProductDrawerProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        category_id: product.category_id ?? '',
        retail_price: product.retail_price?.toString() ?? '',
        wholesale_price: product.wholesale_price?.toString() ?? '',
        cost_price: product.cost_price?.toString() ?? '',
        stock_min: product.stock_min?.toString() ?? '',
        current_stock: currentStock.toString(),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [product, open, currentStock]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(
      {
        name: form.name,
        description: form.description || null,
        sku: form.sku || null,
        barcode: form.barcode || null,
        category_id: form.category_id,
        retail_price: parseFloat(form.retail_price) || 0,
        wholesale_price: parseFloat(form.wholesale_price) || 0,
        cost_price: parseFloat(form.cost_price) || 0,
        stock_min: parseFloat(form.stock_min) || 0,
      },
      parseFloat(form.current_stock) || 0
    );
  };

  const stockValue = parseFloat(form.current_stock) || 0;
  const stockMin = parseFloat(form.stock_min) || 0;
  const stockPercent = stockMin > 0 ? Math.min((stockValue / (stockMin * 3)) * 100, 100) : 50;
  const isLow = stockValue <= stockMin;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[450px] sm:w-[450px] flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="p-8 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded">
              {isEditing ? 'Modo Edición' : 'Nuevo Artículo'}
            </span>
          </div>
          <SheetTitle className="text-3xl font-extrabold text-left">
            {isEditing ? 'Editar Artículo' : 'Crear Artículo'}
          </SheetTitle>
          {isEditing && product?.sku && (
            <p className="text-sm text-muted-foreground font-medium text-left">
              SKU: {product.sku}
            </p>
          )}
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* — Información general — */}
          <div>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Información general
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Nombre del Artículo *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Sillón Nórdico Oskar"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Descripción
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    SKU
                  </Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="RT-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Código de barras
                  </Label>
                  <Input
                    value={form.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    placeholder="7891234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Categoría *
                </Label>
                <Select
                  value={form.category_id}
                  onValueChange={(val) => handleChange('category_id', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* — Precios — */}
          <div>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Precios
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Precio minorista *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      className="pl-7"
                      type="number"
                      value={form.retail_price}
                      onChange={(e) => handleChange('retail_price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Precio mayorista
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      className="pl-7"
                      type="number"
                      value={form.wholesale_price}
                      onChange={(e) => handleChange('wholesale_price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Precio de costo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    className="pl-7"
                    type="number"
                    value={form.cost_price}
                    onChange={(e) => handleChange('cost_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* — Stock — */}
          <div>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
              Stock
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Stock actual
                  </Label>
                  <Input
                    type="number"
                    value={form.current_stock}
                    onChange={(e) => handleChange('current_stock', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Stock mínimo
                  </Label>
                  <Input
                    type="number"
                    value={form.stock_min}
                    onChange={(e) => handleChange('stock_min', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Barra visual de stock */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Nivel de stock</span>
                  <span className={`text-xs font-bold ${isLow ? 'text-destructive' : 'text-primary'}`}>
                    {stockValue} unidades {isLow ? '— Crítico' : ''}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isLow ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                  <span>Mínimo: {stockMin}</span>
                  <span>Actual: {stockValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Descartar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !form.name || !form.category_id}
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Artículo'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}