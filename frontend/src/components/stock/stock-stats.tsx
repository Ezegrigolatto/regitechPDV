import { Package, AlertTriangle, Tag } from 'lucide-react';

interface StockStatsProps {
  totalProducts: number;
  lowStockCount: number;
  categoriesCount: number;
}

export function StockStats({
  totalProducts,
  lowStockCount,
  categoriesCount,
}: StockStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
            Total Items
          </span>
        </div>
        <h3 className="text-3xl font-extrabold">{totalProducts.toLocaleString()}</h3>
        <p className="text-xs text-muted-foreground mt-2">Productos registrados</p>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
            Bajo Stock
          </span>
        </div>
        <h3 className="text-3xl font-extrabold">{lowStockCount}</h3>
        <p className="text-xs text-destructive mt-2 font-medium">
          {lowStockCount > 0 ? 'Artículos requieren reposición' : 'Todo en orden'}
        </p>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <Tag className="h-5 w-5 text-secondary-foreground" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
            Categorías
          </span>
        </div>
        <h3 className="text-3xl font-extrabold">{categoriesCount}</h3>
        <p className="text-xs text-muted-foreground mt-2">
          Distribución de catálogo activa
        </p>
      </div>
    </div>
  );
}
