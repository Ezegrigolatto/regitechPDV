import { useRef, useState } from 'react';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { parseExcel, type ParseResult } from '@/services/import.service';

interface StepUploadProps {
  onParsed: (result: ParseResult, file: File) => void;
}

const ACCEPTED = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  '.xlsx',
  '.xls',
];

export function StepUpload({ onParsed }: StepUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'xls'].includes(ext)) {
      setError('Solo se aceptan archivos .xlsx o .xls');
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleParse = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const result = await parseExcel(selectedFile);
      onParsed(result, selectedFile);
    } catch (err: any) {
      setError(err.message ?? 'No se pudo conectar al servidor. Verificá que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold">Subir archivo Excel</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Subí tu planilla con los productos. Luego vas a poder mapear cada columna al campo correspondiente.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer select-none',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          selectedFile && 'border-primary/40 bg-primary/5',
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {selectedFile ? (
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-10 w-10 text-primary" />
            <div>
              <p className="font-semibold">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              className="ml-4 text-muted-foreground hover:text-destructive transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Arrastrá tu archivo aquí</p>
              <p className="text-sm text-muted-foreground">o hacé click para seleccionar</p>
            </div>
            <p className="text-xs text-muted-foreground">.xlsx o .xls</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}

      <div className="flex justify-end">
        <Button
          disabled={!selectedFile || loading}
          onClick={handleParse}
          size="lg"
        >
          {loading ? 'Procesando...' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
