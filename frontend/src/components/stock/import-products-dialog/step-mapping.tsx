import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ParseResult, ProductField } from '@/services/import.service';

interface StepMappingProps {
  parsed: ParseResult;
  fields: ProductField[];
  onConfirm: (mapping: Record<string, string>) => void;
  onBack: () => void;
}

const IGNORE_VALUE = '__ignore__';

function autoDetect(excelCol: string, fields: ProductField[]): string {
  const normalise = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  const col = normalise(excelCol);

  const aliases: Record<string, string> = {
    nombre: 'name',
    name: 'name',
    articulo: 'name',
    producto: 'name',
    sku: 'sku',
    codigo: 'sku',
    'codigo de barras': 'barcode',
    barcode: 'barcode',
    'codigo barra': 'barcode',
    descripcion: 'description',
    description: 'description',
    categoria: 'category_name',
    category: 'category_name',
    rubro: 'category_name',
    'precio costo': 'cost_price',
    costo: 'cost_price',
    'cost price': 'cost_price',
    'precio minorista': 'retail_price',
    minorista: 'retail_price',
    'retail price': 'retail_price',
    precio: 'retail_price',
    'precio mayorista': 'wholesale_price',
    mayorista: 'wholesale_price',
    'wholesale price': 'wholesale_price',
    'stock minimo': 'stock_min',
    'stock min': 'stock_min',
    'stock inicial': 'initial_stock',
    stock: 'initial_stock',
    existencia: 'initial_stock',
  };

  const match = aliases[col];
  if (match && fields.find((f) => f.key === match)) return match;
  return IGNORE_VALUE;
}

export function StepMapping({ parsed, fields, onConfirm, onBack }: StepMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    parsed.columns.forEach((col) => {
      initial[col] = autoDetect(col, fields);
    });
    setMapping(initial);
  }, [parsed.columns, fields]);

  const setField = (excelCol: string, dbField: string) => {
    setMapping((prev) => ({ ...prev, [excelCol]: dbField }));
  };

  // Required fields that are not yet mapped
  const missingRequired = useMemo(() => {
    const mapped = new Set(Object.values(mapping).filter((v) => v !== IGNORE_VALUE));
    return fields.filter((f) => f.required && !mapped.has(f.key));
  }, [mapping, fields]);

  // Detect duplicate field assignments (same DB field mapped more than once)
  const duplicates = useMemo(() => {
    const count: Record<string, number> = {};
    Object.values(mapping).forEach((v) => {
      if (v !== IGNORE_VALUE) count[v] = (count[v] ?? 0) + 1;
    });
    return new Set(Object.entries(count).filter(([, n]) => n > 1).map(([k]) => k));
  }, [mapping]);

  const canProceed = missingRequired.length === 0 && duplicates.size === 0;

  const handleConfirm = () => {
    const cleaned: Record<string, string> = {};
    Object.entries(mapping).forEach(([col, field]) => {
      if (field !== IGNORE_VALUE) cleaned[col] = field;
    });
    onConfirm(cleaned);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold">Mapear columnas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Indicá a qué campo corresponde cada columna de tu planilla.{' '}
          <span className="font-semibold text-foreground">{parsed.total_rows} filas</span> detectadas.
        </p>
      </div>

      {/* Mapping table */}
      <div className="border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 bg-muted/50 px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b">
          <span>Columna en tu planilla</span>
          <span />
          <span>Campo en el sistema</span>
        </div>

        <div className="divide-y max-h-72 overflow-y-auto">
          {parsed.columns.map((col) => {
            const selectedField = mapping[col] ?? IGNORE_VALUE;
            const isDuplicate = selectedField !== IGNORE_VALUE && duplicates.has(selectedField);
            const isRequired = fields.find((f) => f.key === selectedField)?.required;

            return (
              <div
                key={col}
                className={cn(
                  'grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3',
                  isDuplicate && 'bg-destructive/5',
                )}
              >
                {/* Excel column */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded truncate max-w-full">
                    {col}
                  </span>
                  {isDuplicate && (
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                </div>

                <span className="text-muted-foreground text-lg">→</span>

                {/* DB field select */}
                <select
                  value={selectedField}
                  onChange={(e) => setField(col, e.target.value)}
                  className={cn(
                    'w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors',
                    isDuplicate ? 'border-destructive' : 'border-border',
                    isRequired && selectedField !== IGNORE_VALUE && 'font-semibold',
                  )}
                >
                  <option value={IGNORE_VALUE}>— Ignorar —</option>
                  {fields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                      {f.required ? ' *' : ''}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation messages */}
      {missingRequired.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-destructive font-medium">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Campos requeridos sin mapear:{' '}
            {missingRequired.map((f) => f.label).join(', ')}
          </span>
        </div>
      )}
      {duplicates.size > 0 && (
        <div className="flex items-start gap-2 text-sm text-destructive font-medium">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Hay campos asignados más de una vez. Cada campo debe mapearse a una sola columna.
          </span>
        </div>
      )}
      {canProceed && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          <span>Todo listo para importar</span>
        </div>
      )}

      {/* Preview */}
      {parsed.preview.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Vista previa (primeras {parsed.preview.length} filas)
          </p>
          <div className="overflow-x-auto rounded-xl border">
            <table className="text-xs w-full">
              <thead className="bg-muted/50">
                <tr>
                  {parsed.columns.map((col) => (
                    <th key={col} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsed.preview.map((row, i) => (
                  <tr key={i}>
                    {parsed.columns.map((col) => (
                      <td key={col} className="px-3 py-2 whitespace-nowrap max-w-[160px] truncate">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button disabled={!canProceed} onClick={handleConfirm} size="lg">
          Importar {parsed.total_rows} productos
        </Button>
      </div>
    </div>
  );
}
