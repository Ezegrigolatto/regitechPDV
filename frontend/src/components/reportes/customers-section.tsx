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

const COLORS = ['#ff7a21', '#984200', '#febb28', '#ee6e11', '#863900'];

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

  if (isLoading) {
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
    { name: 'Nuevos', value: stats.newCustomers },
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
        <p className="text-sm text-muted-foreground">
          Análisis de clientes en el período
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Clientes nuevos"
          value={stats.newCustomers.toString()}
          icon={UserPlus}
          iconColor="text-green-600"
          iconBg="bg-green-500/10"
        />
        <KpiCard
          title="Clientes recurrentes"
          value={stats.recurringCustomers.toString()}
          icon={Repeat}
          iconColor="text-blue-600"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          title="Total activos"
          value={(stats.newCustomers + stats.recurringCustomers).toString()}
          icon={Users}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clientes nuevos por día */}
        {newByDayData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-6">Clientes nuevos por día</h3>
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
                <Bar dataKey="count" fill="#ff7a21" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Nuevos vs recurrentes */}
        {recurrenceData.length > 0 && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-6">Nuevos vs recurrentes</h3>
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
                  {recurrenceData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [(value as number) || 0, '']}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: '12px', color: chart.axisColor }}>
                      {value}
                    </span>
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
          <h3 className="font-bold mb-6">Top 5 clientes por compras</h3>
          <div className="bg-muted/30 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    #
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Cliente
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                    Órdenes
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                    Total comprado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topCustomers.map((customer, index) => (
                  <TableRow key={index} className="h-12">
                    <TableCell>
                      <span
                        className={`text-sm font-extrabold ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                            ? 'text-slate-400'
                            : index === 2
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{customer.name}</TableCell>
                    <TableCell className="text-center">{customer.orders}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(customer.total)}
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
  