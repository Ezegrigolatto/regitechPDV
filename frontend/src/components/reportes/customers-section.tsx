import { useQuery } from '@tanstack/react-query';
import { getCustomersStats } from '@/services/reports.service';
import { KpiCard } from './kpi-card';
import {
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, UserPlus, Repeat } from 'lucide-react';
import type { DateRange } from '@/services/reports.service';
import { useChartTheme } from '@/hooks/use-chart-theme';

const RECURRENCE_COLORS = ['#8b5cf6', '#06b6d4'];   // violet nuevos, cyan recurrentes
const TOP_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981'];

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

interface CustomersSectionProps {
  branchId: string;
  range: DateRange;
}

export function CustomersSection({ branchId, range }: CustomersSectionProps) {
  const chart = useChartTheme();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['reports', 'customers', branchId, range],
    queryFn: () => getCustomersStats(branchId, range),
    enabled: !!branchId,
  });

  if (!stats && isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando clientes...
      </div>
    );
  }

  if (!stats) return null;

  const newByDayData = Object.entries(stats.newByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
      }),
      count,
    }));

  const recurrenceData = [
    { name: 'Nuevos',      value: stats.newCustomers },
    { name: 'Recurrentes', value: stats.recurringCustomers },
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
        <h2 className="text-lg font-extrabold mb-1">Clientes</h2>
        <p className="text-sm text-muted-foreground">Análisis de clientes en el período</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Clientes nuevos"
          value={stats.newCustomers.toString()}
          icon={UserPlus}
          iconColor="text-violet-600"
          iconBg="bg-violet-500/10"
          accentColor="#8b5cf6"
        />
        <KpiCard
          title="Clientes recurrentes"
          value={stats.recurringCustomers.toString()}
          icon={Repeat}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-500/10"
          accentColor="#06b6d4"
        />
        <KpiCard
          title="Total activos"
          value={(stats.newCustomers + stats.recurringCustomers).toString()}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-500/10"
          accentColor="#6366f1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clientes nuevos por día */}
        {newByDayData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Clientes nuevos por día</h3>
            <p className="text-xs text-muted-foreground mb-6">Alta de clientes en el período</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={newByDayData}>
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
                  formatter={(value) => [(value as number) || 0, 'Clientes nuevos']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Nuevos vs recurrentes */}
        {recurrenceData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Nuevos vs recurrentes</h3>
            <p className="text-xs text-muted-foreground mb-6">Composición de clientes activos</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={recurrenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {recurrenceData.map((_, i) => (
                    <Cell key={i} fill={RECURRENCE_COLORS[i % RECURRENCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [(value as number) || 0, '']}
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
      </div>

      {/* Top 5 clientes */}
      {stats.topCustomers.length > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold mb-1">Top 5 clientes por compras</h3>
          <p className="text-xs text-muted-foreground mb-6">Clientes con mayor volumen en el período</p>
          <div className="bg-muted/30 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-12">#</TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">Órdenes</TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Total comprado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topCustomers.map((customer, i) => (
                  <TableRow key={i} className="h-12">
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white"
                        style={{ backgroundColor: TOP_COLORS[i] ?? '#6366f1' }}
                      >
                        {i + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{customer.name}</TableCell>
                    <TableCell className="text-center">{customer.orders}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(customer.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {stats.newCustomers === 0 && stats.recurringCustomers === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Users className="h-12 w-12 opacity-20" />
          <p className="font-medium">Sin actividad de clientes en el período</p>
        </div>
      )}
    </div>
  );
}
