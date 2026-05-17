import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  accentColor?: string; // hex CSS color for left border
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  accentColor,
}: KpiCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div
      className="bg-card border rounded-2xl p-5 flex gap-4 items-start overflow-hidden relative"
      style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : undefined}
    >
      {/* Icon */}
      {Icon && (
        <div className={`shrink-0 p-3 rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">
            {title}
          </p>
          {change !== undefined && (
            <div
              className={`shrink-0 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                isNeutral
                  ? 'bg-muted text-muted-foreground'
                  : isPositive
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
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

        <p className="text-2xl font-extrabold mt-1 leading-none">{value}</p>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
