import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { Note } from '@/services/notes.service';

interface NoteFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Note>) => Promise<void>;
  note?: Note | null;
  isLoading?: boolean;
}

const COLORS = [
  { value: '#ffffff', label: 'Blanco', class: 'bg-white' },
  { value: '#fef9c3', label: 'Amarillo', class: 'bg-yellow-50' },
  { value: '#dcfce7', label: 'Verde', class: 'bg-green-50' },
  { value: '#dbeafe', label: 'Azul', class: 'bg-blue-50' },
  { value: '#fce7f3', label: 'Rosa', class: 'bg-pink-50' },
  { value: '#f3e8ff', label: 'Violeta', class: 'bg-purple-50' },
  { value: '#ffedd5', label: 'Naranja', class: 'bg-orange-50' },
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Normal', class: 'bg-muted text-muted-foreground' },
  { value: 'medium', label: 'Media', class: 'bg-yellow-500/10 text-yellow-700' },
  { value: 'high', label: 'Urgente', class: 'bg-destructive/10 text-destructive' },
];

const EMPTY_FORM = {
  title: '',
  content: '',
  color: '#ffffff',
  urgency: 'low' as 'low' | 'medium' | 'high',
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function NoteFormDialog({ open, onClose, onSave, note }: NoteFormDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formState, setFormState] = useState<FormState>('idle');
  const isEditing = !!note;

  useEffect(() => {
    if (open) {
      setFormState('idle');
      if (note) {
        setForm({
          title: note.title ?? '',
          content: note.content ?? '',
          color: note.color ?? '#ffffff',
          urgency: note.urgency ?? 'low',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [note, open]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setFormState('loading');
    try {
      await onSave({
        title: form.title,
        content: form.content || null,
        color: form.color,
        urgency: form.urgency,
      });
      setFormState('success');
    } catch {
      setFormState('error');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && formState !== 'loading') onClose();
      }}
    >
      <DialogContent showCloseButton={formState !== 'loading'} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">
            {formState === 'success'
              ? isEditing
                ? '¡Nota actualizada!'
                : '¡Nota creada!'
              : isEditing
              ? 'Editar nota'
              : 'Nueva nota'}
          </DialogTitle>
        </DialogHeader>

        {formState === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="p-4 bg-green-500/10 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <Button className="w-full" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-5 mt-2">
              {/* Título */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Título *
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Título de la nota..."
                  disabled={formState === 'loading'}
                  autoFocus
                />
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Contenido
                </Label>
                <textarea
                  className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  rows={5}
                  placeholder="Escribí el contenido de la nota..."
                  value={form.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  disabled={formState === 'loading'}
                />
              </div>

              {/* Urgencia */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Urgencia
                </Label>
                <div className="flex gap-2">
                  {URGENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                        form.urgency === option.value
                          ? `${option.class} border-current`
                          : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                      onClick={() => handleChange('urgency', option.value)}
                      disabled={formState === 'loading'}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Color
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color.class
                      } ${
                        form.color === color.value
                          ? 'border-primary scale-110 shadow-md'
                          : 'border-border hover:scale-105'
                      }`}
                      onClick={() => handleChange('color', color.value)}
                      disabled={formState === 'loading'}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={formState === 'loading'}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={formState === 'loading' || !form.title.trim()}
              >
                {formState === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </span>
                ) : isEditing ? (
                  'Guardar cambios'
                ) : (
                  'Crear nota'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
