import { useEffect, useState } from 'react';
import { FileUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getProductFields, type ParseResult, type ProductField } from '@/services/import.service';
import { StepUpload } from './step-upload';
import { StepMapping } from './step-mapping';
import { StepResults } from './step-results';

type Step = 'upload' | 'mapping' | 'results';

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload',  label: 'Subir archivo' },
  { key: 'mapping', label: 'Mapear columnas' },
  { key: 'results', label: 'Resultados' },
];

interface ImportProductsDialogProps {
  open: boolean;
  onClose: () => void;
  branchId: string;
  onImported: () => void;
}

export function ImportProductsDialog({
  open,
  onClose,
  branchId,
  onImported,
}: ImportProductsDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<ProductField[]>([]);

  useEffect(() => {
    if (!open) return;
    getProductFields()
      .then(setFields)
      .catch(() => {});
  }, [open]);

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep('upload');
      setParsed(null);
      setMapping({});
    }, 300);
  };

  const handleParsed = (result: ParseResult) => {
    setParsed(result);
    setStep('mapping');
  };

  const handleMappingConfirmed = (m: Record<string, string>) => {
    setMapping(m);
    setStep('results');
  };

  const handleDone = () => {
    onImported();
    handleClose();
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Importar productos desde Excel
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center mt-2 mb-6 shrink-0">
          {STEPS.map((s, i) => (
            <>
              {/* Circle + label */}
              <div key={s.key} className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors',
                    i < stepIndex
                      ? 'bg-primary text-primary-foreground'
                      : i === stepIndex
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    i === stepIndex ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  key={`line-${i}`}
                  className={cn(
                    'flex-1 h-0.5 mx-3 transition-colors',
                    i < stepIndex ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </>
          ))}
        </div>

        {/* Step content — scrollable, min-height keeps the dialog stable */}
        <div className="flex-1 overflow-y-auto min-h-[380px]">
          {step === 'upload' && (
            <StepUpload onParsed={handleParsed} />
          )}

          {step === 'mapping' && parsed && (
            <StepMapping
              parsed={parsed}
              fields={fields}
              onConfirm={handleMappingConfirmed}
              onBack={() => setStep('upload')}
            />
          )}

          {step === 'results' && parsed && (
            <StepResults
              parsed={parsed}
              mapping={mapping}
              branchId={branchId}
              onDone={handleDone}
              onBack={() => setStep('mapping')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
