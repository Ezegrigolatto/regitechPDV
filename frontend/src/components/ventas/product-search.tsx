import { useState, useRef, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/use-products';
import { useBranchStock } from '@/hooks/use-stock';
import { useAuthStore } from '@/stores/auth.store';
import { useVentasStore } from '@/stores/ventas.store';
import { calculateItemSubtotal } from '@/services/tickets.service';
import type { Product } from '@/services/products.service';
import type { TicketItem } from '@/services/tickets.service';

export function ProductSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { profile } = useAuthStore();
  const branchId = profile?.branch_id ?? '';
  const { activeTicketId, addItem, getActiveTicket } = useVentasStore();
  const activeTicket = getActiveTicket();

  const { data: products = [] } = useProducts({ is_active: true });
  const { data: branchStock = [] } = useBranchStock(branchId);

  // Filtrar productos por query
  const filtered =
    query.trim().length === 0
      ? []
      : products
          .filter((p) => {
            const q = query.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              (p.sku ?? '').toLowerCase().includes(q) ||
              (p.barcode ?? '').toLowerCase().includes(q)
            );
          })
          .slice(0, 8);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Detectar escaneo de código de barras (input rápido)
  useEffect(() => {
    if (query.length > 3) {
      const exactBarcode = products.find((p) => p.barcode === query || p.sku === query);
      if (exactBarcode) {
        handleAddProduct(exactBarcode);
        setQuery('');
        setOpen(false);
        return;
      }
    }
    setOpen(query.trim().length > 0);
  }, [query]);

  const getStock = (productId: string) =>
    branchStock.find((s) => s.product_id === productId)?.quantity ?? 0;

  const handleAddProduct = (product: Product) => {
    if (!activeTicketId) return;

    const stock = getStock(product.id);
    const itemEnTicket = activeTicket?.items.find((i) => i.product_id === product.id);
    const cantidadEnTicket = itemEnTicket?.quantity ?? 0;

    if (cantidadEnTicket >= stock) return; // no agregar si no hay stock

    const priceList = activeTicket?.price_list ?? 'retail';
    const unitPrice =
      priceList === 'wholesale' ? product.wholesale_price : product.retail_price;

    const { subtotal, tax_amount } = calculateItemSubtotal(
      1,
      unitPrice,
      null,
      null,
      product.taxes?.rate ?? null
    );

    const item: TicketItem = {
      product_id: product.id,
      sku: product.sku ?? null,
      name: product.name,
      unit: product.units_of_measure?.abbreviation ?? null,
      quantity: 1,
      unit_price: unitPrice,
      retail_price: product.retail_price,
      cost_price: product.cost_price,
      discount_type: null,
      discount_value: null,
      subtotal,
      tax_rate: product.taxes?.rate ?? null,
      tax_amount: tax_amount ?? null,
    };

    addItem(activeTicketId, item);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          className="pl-9 h-12"
          placeholder="Buscar producto por nombre, SKU o escanear código..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setOpen(true)}
          disabled={!activeTicketId}
        />
      </div>

      {/* Dropdown resultados */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-xl shadow-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              No se encontraron productos
            </div>
          ) : (
            <ul>
              {filtered.map((product) => {
                const stock = getStock(product.id);
                const outOfStock = stock <= 0;
                return (
                  <li
                    key={product.id}
                    className={`flex items-center justify-between px-4 py-3 border-b last:border-0 transition-colors ${
                      outOfStock
                        ? 'opacity-40 cursor-not-allowed bg-muted/30'
                        : 'cursor-pointer hover:bg-muted/50'
                    }`}
                    onClick={() => !outOfStock && handleAddProduct(product)}
                    title={outOfStock ? 'Sin stock disponible' : ''}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{product.name}</span>
                        {outOfStock && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                            Sin stock
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {product.sku && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {product.sku}
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-medium ${
                            outOfStock ? 'text-destructive' : 'text-muted-foreground'
                          }`}
                        >
                          Stock: {stock}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        ${product.retail_price.toLocaleString('es-AR')}
                      </span>
                      {!outOfStock && <Plus className="h-4 w-4 text-primary" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
