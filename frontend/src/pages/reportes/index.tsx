import { useState } from 'react';
import {
  DateRangeSelector,
  getPresetRange,
} from '@/components/reportes/date-range-selector';
import { SalesSection } from '@/components/reportes/sales-section';
import { CustomersSection } from '@/components/reportes/customers-section';
import { StockSection } from '@/components/reportes/stock-section';
import { useAuthStore } from '@/stores/auth.store';
import { useCategories } from '@/hooks/use-products';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRange } from '@/services/reports.service';

type Section = 'sales' | 'customers' | 'stock';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'sales', label: 'Ventas' },
  { key: 'customers', label: 'Clientes' },
  { key: 'stock', label: 'Stock' },
];

export default function Reportes() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id ?? '';

  const [activeSection, setActiveSection] = useState<Section>('sales');
  const [range, setRange] = useState<DateRange>(getPresetRange('month'));
  const [categoryId, setCategoryId] = useState<string>('all');

  const { data: categories = [] } = useCategories();

  const handleRangeChange = (newRange: DateRange) => {
    setRange(newRange);
  };

  return (
    <div className="w-full px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Reportes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dashboard de métricas y análisis de tu negocio
        </p>
      </div>

      {/* Controles globales */}
      <div className="bg-card border rounded-2xl p-5 mb-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <DateRangeSelector onChange={handleRangeChange} />

          {/* Filtro por categoría — solo en ventas */}
          {activeSection === 'sales' && (
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todas las categorías" />
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
          )}
        </div>
      </div>

      {/* Tabs de secciones */}
      <div className="flex items-center gap-2 border-b mb-8">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeSection === section.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeSection === 'sales' && (
        <SalesSection
          branchId={branchId}
          range={range}
          categoryId={categoryId !== 'all' ? categoryId : undefined}
        />
      )}
      {activeSection === 'customers' && (
        <CustomersSection branchId={branchId} range={range} />
      )}
      {activeSection === 'stock' && (
        <StockSection branchId={branchId} />
      )}
    </div>
  );
}
