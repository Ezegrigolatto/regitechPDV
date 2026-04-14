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
import { Package, DollarSign, AlertTriangle, Tag } from 'lucide-react';
import { useChartTheme } from '@/hooks/use-chart-theme';

const COLORS = [
  '#ff7a21',
  '#984200',
  '#febb28',
  '#ee6e11',
  '#863900',
  '#694a00',
  '#ffc69c',
  '#ffb378',
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

  if (isLoading) {
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
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <KpiCard
          title="Unidades totales"
          value={stats.totalUnits.toLocaleString('es-AR')}
          icon={Tag}
          iconColor="text-blue-600"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          title="Valor del inventario"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-500/10"
          subtitle="A precio de costo"
        />
        <KpiCard
          title="Bajo stock mínimo"
          value={stats.lowStock.toString()}
          icon={AlertTriangle}
          iconColor="text-destructive"
          iconBg="bg-destructive/10"
          subtitle="Requieren reposición"
        />
      </div>

      {/* Evolución del stock */}
      {stockEvolution.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-2">Evolución del stock en unidades</h3>
          <p className="text-xs text-muted-foreground mb-6">
            Basado en movimientos registrados
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stockEvolution}>
              <defs>
                <linearGradient id="colorUnidades" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7a21" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff7a21" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: chart.axisColor }}
                stroke={chart.axisColor}
              />
              <YAxis
                tick={{ fontSize: 11, fill: chart.axisColor }}
                stroke={chart.axisColor}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [(value as number) || 0, 'Unidades en stock']}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="unidades"
                stroke="#ff7a21"
                strokeWidth={2.5}
                fill="url(#colorUnidades)"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unidades por categoría */}
        {categoryUnitsData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-6">Unidades por categoría</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryUnitsData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chart.gridColor}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: chart.axisColor }}
                  stroke={chart.axisColor}
                />
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
                <Bar dataKey="unidades" fill="#ff7a21" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Valor por categoría */}
        {categoryValueData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-6">Valor del inventario por categoría</h3>
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
                  {categoryValueData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency((value as number) || 0), 'Valor']}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: '11px', color: chart.axisColor }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabla de categorías */}
      {stats.byCategory.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-6">Detalle por categoría</h3>
          <div className="space-y-3">
            {stats.byCategory.map((cat, index) => {
              const maxValue = stats.byCategory[0].value;
              const pct = maxValue > 0 ? (cat.value / maxValue) * 100 : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{cat.name}</span>
                    <div className="flex gap-4 text-muted-foreground">
                      <span>{cat.units.toLocaleString('es-AR')} u</span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
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
