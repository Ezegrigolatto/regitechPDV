import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number; // porcentaje vs período anterior
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: KpiCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        )}
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            isNeutral
              ? 'bg-muted text-muted-foreground'
              : isPositive
              ? 'bg-green-500/10 text-green-700'
              : 'bg-destructive/10 text-destructive'
          }`}>
            {isNeutral ? (
              <Minus className="h-3 w-3" />
            ) : isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="text-2xl font-extrabold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}