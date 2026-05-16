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
import { ShoppingCart, TrendingUp, Receipt, Tag } from 'lucide-react';
import type { DateRange } from '@/services/reports.service';
import { useChartTheme } from '@/hooks/use-chart-theme';

const COLORS = ['#984200', '#ff7a21', '#febb28', '#ee6e11', '#863900', '#694a00'];

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

  if (isLoading) {
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
    { name: 'Factura', value: stats.byType.sale },
    { name: 'Remito', value: stats.byType.remito },
    { name: 'Presupuesto', value: stats.byType.presupuesto },
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
          iconColor="text-green-600"
          iconBg="bg-green-500/10"
        />
        <KpiCard
          title="Órdenes"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <KpiCard
          title="Ticket promedio"
          value={formatCurrency(stats.avgTicket)}
          icon={Receipt}
          iconColor="text-blue-600"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          title="Método principal"
          value={
            paymentData.length > 0
              ? paymentData.sort((a, b) => b.value - a.value)[0].name
              : '—'
          }
          icon={Tag}
          iconColor="text-purple-600"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Ventas por día */}
      {salesByDayData.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-6">Ventas por día</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesByDayData}>
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
                stroke="#ff7a21"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-6">Por método de pago</h3>
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
                  {paymentData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
            <h3 className="font-bold mb-6">Por tipo de comprobante</h3>
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
                  width={80}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Total']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="value" fill="#ff7a21" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top productos */}
      {stats.topProducts.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-6">Productos más vendidos</h3>
          <div className="bg-muted/30 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    #
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Producto
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                    Unidades
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topProducts.map((product, index) => (
                  <TableRow key={index} className="h-12">
                    <TableCell>
                      <span className={`text-sm font-extrabold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-amber-600' :
                        'text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{product.name}</TableCell>
                    <TableCell className="text-center">{product.quantity}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(product.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}