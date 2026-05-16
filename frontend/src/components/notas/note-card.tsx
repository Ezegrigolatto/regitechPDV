import { Star, Pencil, Trash2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Note } from '@/services/notes.service';

interface NoteCardProps {
  note: Note;
  currentUserId: string;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleFavorite: (note: Note) => void;
}

const URGENCY_CONFIG = {
  low: {
    label: 'Normal',
    icon: Info,
    class: 'text-muted-foreground',
    border: 'border-border',
    badge: 'bg-muted text-muted-foreground',
  },
  medium: {
    label: 'Media',
    icon: AlertTriangle,
    class: 'text-yellow-600',
    border: 'border-yellow-400',
    badge: 'bg-yellow-500/10 text-yellow-700',
  },
  high: {
    label: 'Urgente',
    icon: AlertCircle,
    class: 'text-destructive',
    border: 'border-destructive',
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

export function NoteCard({
  note,
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
}: NoteCardProps) {
  const urgency = URGENCY_CONFIG[note.urgency];
  const UrgencyIcon = urgency.icon;
  const isOwner = note.created_by === currentUserId;
  const wasEdited = note.content_updated_at !== note.created_at;

  return (
    <div
      className={`relative group rounded-2xl border-2 ${urgency.border} ${getBgClass(
        note.color
      )} p-5 cursor-pointer transition-all hover:shadow-md flex flex-col gap-3`}
      onClick={() => onView(note)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <UrgencyIcon className={`h-4 w-4 shrink-0 ${urgency.class}`} />
          <h3 className="text-black font-bold text-sm truncate">{note.title}</h3>
        </div>
        <button
          className={`shrink-0 transition-colors ${
            note.is_favorite
              ? 'text-yellow-500'
              : 'text-muted-foreground/40 hover:text-yellow-400'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(note);
          }}
        >
          <Star className="h-4 w-4" fill={note.is_favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      {note.content && (
        <p className="text-xs text-black line-clamp-3 flex-1">
          {note.content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-black">
            {note.profiles?.full_name ?? 'Usuario'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-black">
              {new Date(note.created_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
            {wasEdited && (
              <span className="text-[10px] text-muted-foreground italic">· editada</span>
            )}
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${urgency.badge}`}
        >
          {urgency.label}
        </span>
      </div>

      {/* Acciones — solo si es owner */}
      {isOwner && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 bg-white/80 hover:bg-white text-primary hover:text-primary shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 bg-white/80 hover:bg-white text-destructive hover:text-destructive shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
