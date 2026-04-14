import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import type { DateRange } from '@/services/reports.service';

export type Preset =
  | 'today'
  | 'week'
  | 'month'
  | 'quarter'
  | 'semester'
  | 'year'
  | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mes' },
  { key: 'quarter', label: 'Este trimestre' },
  { key: 'semester', label: 'Últimos 6 meses' },
  { key: 'year', label: 'Este año' },
  { key: 'custom', label: 'Personalizado' },
];

function getPresetRange(preset: Preset): DateRange {
  const now = new Date();
  const to = now.toISOString();

  switch (preset) {
    case 'today': {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      return { from: from.toISOString(), to };
    }
    case 'week': {
      const from = new Date(now);
      from.setDate(now.getDate() - now.getDay());
      from.setHours(0, 0, 0, 0);
      return { from: from.toISOString(), to };
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.toISOString(), to };
    }
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), quarter * 3, 1);
      return { from: from.toISOString(), to };
    }
    case 'semester': {
      const from = new Date(now);
      from.setDate(from.getDate() - 180);
      return { from: from.toISOString(), to };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: from.toISOString(), to };
    }
    default:
      return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to };
  }
}

interface DateRangeSelectorProps {
  onChange: (range: DateRange, preset: Preset) => void;
}

export function DateRangeSelector({ onChange }: DateRangeSelectorProps) {
  const [activePreset, setActivePreset] = useState<Preset>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    if (preset !== 'custom') {
      onChange(getPresetRange(preset), preset);
    }
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    onChange(
      {
        from: new Date(customFrom).toISOString(),
        to: new Date(customTo + 'T23:59:59').toISOString(),
      },
      'custom'
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              activePreset === preset.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => handlePreset(preset.key)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {activePreset === 'custom' && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 w-44"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </div>
          <span className="text-muted-foreground text-sm">hasta</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 w-44"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={handleCustomApply}
            disabled={!customFrom || !customTo}
          >
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}

export { getPresetRange };
