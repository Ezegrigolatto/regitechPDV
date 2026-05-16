import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Star, Pencil, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Note } from '@/services/notes.service';

interface NoteDrawerProps {
  open: boolean;
  onClose: () => void;
  note: Note | null;
  currentUserId: string;
  onEdit: (note: Note) => void;
  onToggleFavorite: (note: Note) => void;
}

const URGENCY_CONFIG = {
  low: {
    label: 'Normal',
    icon: Info,
    class: 'text-black',
    badge: 'bg-muted text-black',
  },
  medium: {
    label: 'Media',
    icon: AlertTriangle,
    class: 'text-yellow-600',
    badge: 'bg-yellow-500/10 text-yellow-700',
  },
  high: {
    label: 'Urgente',
    icon: AlertCircle,
    class: 'text-destructive',
    badge: 'bg-destructive/10 text-destructive',
  },
};

const NOTE_COLORS: Record<string, string> = {
  '#ffffff': 'bg-white',
  '#fef9c3': 'bg-yellow-50',
  '#dcfce7': 'bg-green-50',
  '#dbeafe': 'bg-blue-50',
  '#fce7f3': 'bg-pink-50',
  '#f3e8ff': 'bg-purple-50',
  '#ffedd5': 'bg-orange-50',
};

function getBgClass(color: string) {
  return NOTE_COLORS[color] ?? 'bg-white';
}

export function NoteDrawer({
  open,
  onClose,
  note,
  currentUserId,
  onEdit,
  onToggleFavorite,
}: NoteDrawerProps) {
  if (!note) return null;

  const urgency = URGENCY_CONFIG[note.urgency];
  const UrgencyIcon = urgency.icon;
  const isOwner = note.created_by === currentUserId;
const wasEdited = note.content_updated_at !== note.created_at;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className={`w-[480px] sm:w-[480px] flex flex-col p-0 gap-0 ${getBgClass(
          note.color
        )}`}
      >
        {/* Header */}
        <SheetHeader className="p-8 border-b border-black/5">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${urgency.badge}`}
            >
              <UrgencyIcon className="h-3 w-3" />
              {urgency.label}
            </span>
            <button
              className={`transition-colors ${
                note.is_favorite
                  ? 'text-yellow-500'
                  : 'text-black hover:text-yellow-400'
              }`}
              onClick={() => onToggleFavorite(note)}
            >
              <Star
                className="h-5 w-5"
                fill={note.is_favorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>
          <SheetTitle className="text-2xl text-black font-extrabold text-left leading-tight">
            {note.title}
          </SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-black">
              {note.profiles?.full_name ?? 'Usuario'}
            </span>
            <span className="text-black">·</span>
            <span className="text-xs text-black">
              {new Date(note.created_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {wasEdited && (
              <>
                <span className="text-black">·</span>
                <span className="text-xs text-black italic">
                  editada{' '}
                  {new Date(note.updated_at).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </>
            )}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {note.content ? (
            <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{note.content}</p>
          ) : (
            <p className="text-sm text-black italic">Sin contenido</p>
          )}
        </div>

        {/* Footer — solo si es owner */}
        {isOwner && (
          <div className="p-8 border-t border-black/5">
            <Button className="w-full" onClick={() => onEdit(note)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar nota
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
