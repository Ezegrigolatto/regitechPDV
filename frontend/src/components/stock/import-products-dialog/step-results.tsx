import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importProducts, type ImportResult, type ParseResult } from '@/services/import.service';

interface StepResultsProps {
  parsed: ParseResult;
  mapping: Record<string, string>;
  branchId: string;
  onDone: () => void;
  onBack: () => void;
}

type Status = 'importing' | 'done' | 'error';

export function StepResults({ parsed, mapping, branchId, onDone, onBack }: StepResultsProps) {
  const [status, setStatus] = useState<Status>('importing');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animFrame: number;
    let target = 0;

    // Simulate progress while request is in-flight
    const tick = () => {
      setProgress((p) => {
        const next = p + (target - p) * 0.08;
        return next;
      });
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    target = 85; // fill to 85% while waiting

    importProducts(parsed.all_rows, mapping, branchId)
      .then((res) => {
        target = 100;
        setTimeout(() => {
          cancelAnimationFrame(animFrame);
          setProgress(100);
          setResult(res);
          setStatus('done');
        }, 400);
      })
      .catch((err: any) => {
        cancelAnimationFrame(animFrame);
        setFatalError(err.message ?? 'Error inesperado');
        setStatus('error');
      });

    return () => cancelAnimationFrame(animFrame);
  }, []);

  const successRate = result ? Math.round((result.success / result.total) * 100) : 0;

  // ── Importing ──────────────────────────────────────────────────────────────
  if (status === 'importing') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="text-center">
          <h3 className="text-lg font-bold">Importando productos...</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Procesando {parsed.total_rows} filas. No cierres esta ventana.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-2 w-2 rounded-full bg-primary"
              style={{ animation: `bounce 1s ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Fatal error ────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="p-4 rounded-full bg-destructive/10">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-destructive">Error en la importación</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">{fatalError}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>Volver al mapeo</Button>
        </div>
      </div>
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold">{result?.total}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">Total</p>
        </div>
        <div className="rounded-xl border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 p-4 text-center">
          <p className="text-2xl font-extrabold text-green-700 dark:text-green-400">{result?.success}</p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1 font-medium uppercase tracking-wide">Exitosos</p>
        </div>
        <div className={`rounded-xl border p-4 text-center ${(result?.errors.length ?? 0) > 0 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' : 'bg-card'}`}>
          <p className={`text-2xl font-extrabold ${(result?.errors.length ?? 0) > 0 ? 'text-destructive' : ''}`}>
            {result?.errors.length}
          </p>
          <p className={`text-xs mt-1 font-medium uppercase tracking-wide ${(result?.errors.length ?? 0) > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            Errores
          </p>
        </div>
      </div>

      {/* Status message */}
      {(result?.errors.length ?? 0) === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
            ¡Importación completada! Se importaron {result?.success} productos exitosamente.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Importación completada con errores. {successRate}% exitoso.
          </p>
        </div>
      )}

      {/* Error list */}
      {(result?.errors.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Detalle de errores
          </p>
          <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {result?.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-2.5 text-sm border-b last:border-b-0 bg-card"
              >
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold">Fila {err.row}:</span>{' '}
                  <span className="text-muted-foreground">{err.message}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onDone} size="lg">
          Finalizar
        </Button>
      </div>
    </div>
  );
}
