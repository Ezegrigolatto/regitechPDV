import { useQuery } from '@tanstack/react-query';
import { getSalesStats, getPreviousPeriodRevenue } from '@/services/reports.service';
import { KpiCard } from './kpi-card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShoppingCart, TrendingUp, Receipt, CreditCard } from 'lucide-react';
import type { DateRange } from '@/services/reports.service';
import { useChartTheme } from '@/hooks/use-chart-theme';

// Paleta diversa
const PIE_COLORS  = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
const TYPE_COLORS: Record<string, string> = {
  Factura:      '#10b981',
  Remito:       '#3b82f6',
  Presupuesto:  '#8b5cf6',
};
const DEFAULT_TYPE_COLOR = '#6366f1';

interface SalesSectionProps {
  branchId: string;
  range: DateRange;
  categoryId?: string;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

export function SalesSection({ branchId, range, categoryId }: SalesSectionProps) {
  const chart = useChartTheme();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['reports', 'sales', branchId, range, categoryId],
    queryFn: () => getSalesStats(branchId, range, categoryId),
    enabled: !!branchId,
  });

  const { data: prevRevenue } = useQuery({
    queryKey: ['reports', 'sales', 'prev', branchId, range],
    queryFn: () => getPreviousPeriodRevenue(branchId, range),
    enabled: !!branchId,
  });

  if (!stats && isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando ventas...
      </div>
    );
  }

  if (!stats) return null;

  const revenueChange =
    prevRevenue && prevRevenue > 0
      ? ((stats.totalRevenue - prevRevenue) / prevRevenue) * 100
      : undefined;

  const salesByDayData = Object.entries(stats.salesByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
      }),
      total,
    }));

  const paymentData = Object.entries(stats.paymentBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const typeData = [
    { name: 'Factura',      value: stats.byType.sale },
    { name: 'Remito',       value: stats.byType.remito },
    { name: 'Presupuesto',  value: stats.byType.presupuesto },
  ].filter((d) => d.value > 0);

  const tooltipStyle = {
    borderRadius: '12px',
    border: `1px solid ${chart.tooltipBorder}`,
    background: chart.tooltipBg,
    color: chart.tooltipColor,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-extrabold mb-1">Ventas</h2>
        <p className="text-sm text-muted-foreground">Resumen del período seleccionado</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total vendido"
          value={formatCurrency(stats.totalRevenue)}
          change={revenueChange}
          subtitle={prevRevenue ? `vs ${formatCurrency(prevRevenue)} período anterior` : undefined}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-500/10"
          accentColor="#10b981"
        />
        <KpiCard
          title="Órdenes"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-500/10"
          accentColor="#6366f1"
        />
        <KpiCard
          title="Ticket promedio"
          value={formatCurrency(stats.avgTicket)}
          icon={Receipt}
          iconColor="text-blue-600"
          iconBg="bg-blue-500/10"
          accentColor="#3b82f6"
        />
        <KpiCard
          title="Método principal"
          value={
            paymentData.length > 0
              ? paymentData.sort((a, b) => b.value - a.value)[0].name
              : '—'
          }
          icon={CreditCard}
          iconColor="text-violet-600"
          iconBg="bg-violet-500/10"
          accentColor="#8b5cf6"
        />
      </div>

      {/* Ventas por día */}
      {salesByDayData.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-1">Ventas por día</h3>
          <p className="text-xs text-muted-foreground mb-6">Ingresos diarios en el período</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesByDayData}>
              <defs>
                <linearGradient id="salesLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Ventas']}
                contentStyle={tooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Por método de pago</h3>
            <p className="text-xs text-muted-foreground mb-6">Distribución de ingresos</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: '12px', color: chart.axisColor }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {typeData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Por tipo de comprobante</h3>
            <p className="text-xs text-muted-foreground mb-6">Ventas, remitos y presupuestos</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: chart.axisColor }}
                  stroke={chart.axisColor}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: chart.axisColor }}
                  stroke={chart.axisColor}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Total']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={TYPE_COLORS[entry.name] ?? DEFAULT_TYPE_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top productos */}
      {stats.topProducts.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-1">Productos más vendidos</h3>
          <p className="text-xs text-muted-foreground mb-6">Top 10 por importe total</p>
          <div className="bg-muted/30 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-12">#</TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Producto</TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">Unidades</TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topProducts.map((product, i) => (
                  <TableRow key={i} className="h-12">
                    <TableCell>
                      <span className={`text-sm font-extrabold ${
                        i === 0 ? 'text-amber-500' :
                        i === 1 ? 'text-slate-400' :
                        i === 2 ? 'text-amber-700' :
                        'text-muted-foreground'
                      }`}>
                        #{i + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{product.name}</TableCell>
                    <TableCell className="text-center">{product.quantity}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(product.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.totalOrders === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <ShoppingCart className="h-12 w-12 opacity-20" />
          <p className="font-medium">Sin ventas en el período seleccionado</p>
        </div>
      )}
    </div>
  );
}
