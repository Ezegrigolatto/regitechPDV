import { useQuery } from '@tanstack/react-query';
import { getStockStats } from '@/services/reports.service';
import { KpiCard } from './kpi-card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Package, DollarSign, AlertTriangle, Layers } from 'lucide-react';
import { useChartTheme } from '@/hooks/use-chart-theme';

const CATEGORY_COLORS = [
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#ec4899', // pink
  '#ef4444', // red
  '#84cc16', // lime
];

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

interface StockSectionProps {
  branchId: string;
}

export function StockSection({ branchId }: StockSectionProps) {
  const chart = useChartTheme();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['reports', 'stock', branchId],
    queryFn: () => getStockStats(branchId),
    enabled: !!branchId,
  });

  if (!stats && isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando stock...
      </div>
    );
  }

  if (!stats) return null;

  const stockEvolution = (() => {
    if (!stats.movements.length) return [];
    const byDay: Record<string, number> = {};
    let cumulative = 0;
    stats.movements.forEach((mov) => {
      const day = mov.created_at.slice(0, 10);
      cumulative += mov.quantity;
      byDay[day] = cumulative;
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, units]) => ({
        date: new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
        }),
        unidades: Math.max(0, units),
      }));
  })();

  const categoryUnitsData = stats.byCategory
    .slice(0, 8)
    .map((cat) => ({ name: cat.name, unidades: cat.units }));

  const categoryValueData = stats.byCategory
    .slice(0, 6)
    .map((cat) => ({ name: cat.name, value: cat.value }));

  const tooltipStyle = {
    borderRadius: '12px',
    border: `1px solid ${chart.tooltipBorder}`,
    background: chart.tooltipBg,
    color: chart.tooltipColor,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-extrabold mb-1">Stock</h2>
        <p className="text-sm text-muted-foreground">Estado actual del inventario</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Productos distintos"
          value={stats.totalProducts.toString()}
          icon={Package}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-500/10"
          accentColor="#6366f1"
        />
        <KpiCard
          title="Unidades totales"
          value={stats.totalUnits.toLocaleString('es-AR')}
          icon={Layers}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-500/10"
          accentColor="#06b6d4"
        />
        <KpiCard
          title="Valor del inventario"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-500/10"
          accentColor="#10b981"
          subtitle="A precio de costo"
        />
        <KpiCard
          title="Bajo stock mínimo"
          value={stats.lowStock.toString()}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-500/10"
          accentColor="#ef4444"
          subtitle="Requieren reposición"
        />
      </div>

      {/* Evolución del stock */}
      {stockEvolution.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-1">Evolución del stock en unidades</h3>
          <p className="text-xs text-muted-foreground mb-6">Basado en movimientos registrados</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stockEvolution}>
              <defs>
                <linearGradient id="stockAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: chart.axisColor }} stroke={chart.axisColor} />
              <YAxis tick={{ fontSize: 11, fill: chart.axisColor }} stroke={chart.axisColor} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [(value as number) || 0, 'Unidades en stock']}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="unidades"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#stockAreaGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unidades por categoría — barras multi-color */}
        {categoryUnitsData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Unidades por categoría</h3>
            <p className="text-xs text-muted-foreground mb-6">Cantidad de ítems en inventario</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryUnitsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: chart.axisColor }} stroke={chart.axisColor} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: chart.axisColor }}
                  stroke={chart.axisColor}
                  width={100}
                />
                <Tooltip
                  formatter={(value) => [(value as number) || 0, 'Unidades']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="unidades" radius={[0, 6, 6, 0]}>
                  {categoryUnitsData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Valor por categoría */}
        {categoryValueData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Valor del inventario por categoría</h3>
            <p className="text-xs text-muted-foreground mb-6">Valorización a precio de costo</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryValueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryValueData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency((value as number) || 0), 'Valor']}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: '11px', color: chart.axisColor }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Barras de progreso por categoría */}
      {stats.byCategory.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-1">Detalle por categoría</h3>
          <p className="text-xs text-muted-foreground mb-6">Proporción del valor de inventario</p>
          <div className="space-y-4">
            {stats.byCategory.map((cat, i) => {
              const maxValue = stats.byCategory[0].value;
              const pct = maxValue > 0 ? (cat.value / maxValue) * 100 : 0;
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                    <div className="flex gap-5 text-muted-foreground">
                      <span>{cat.units.toLocaleString('es-AR')} u</span>
                      <span className="font-bold text-foreground w-24 text-right">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
