import { useState } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { NoteCard } from '@/components/notas/note-card';
import { NoteDrawer } from '@/components/notas/note-drawer';
import { NoteFormDialog } from '@/components/notas/note-form-dialog';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useToggleNoteFavorite,
} from '@/hooks/use-notes';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import type { Note } from '@/services/notes.service';

export default function Notas() {
  const { profile, user } = useAuthStore();
  const branchId = profile?.branch_id ?? '';

  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: notes = [], isLoading } = useNotes({
    search: search || undefined,
    urgency: urgencyFilter !== 'all' ? (urgencyFilter as Note['urgency']) : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const toggleFavorite = useToggleNoteFavorite();

  const handleView = (note: Note) => {
    setViewNote(note);
    setDrawerOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingNote(null);
    setFormOpen(true);
  };

  const handleDeleteRequest = (note: Note) => {
    setDeleteNote(note);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteNote) return;
    setDeleteLoading(true);
    try {
      await deleteNoteMutation.mutateAsync(deleteNote.id);
      toast.success('Nota eliminada');
      setDeleteOpen(false);
      setDeleteNote(null);
    } catch (err: any) {
      toast.error('Error al eliminar nota', { description: err?.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async (data: Partial<Note>) => {
    if (editingNote) {
      await updateNote.mutateAsync({ id: editingNote.id, note: data });
    } else {
      await createNote.mutateAsync({
        ...data,
        created_by: user?.id ?? '',
        branch_id: branchId,
        is_favorite: false,
      } as any);
    }
  };

  const handleToggleFavorite = async (note: Note) => {
    try {
      await toggleFavorite.mutateAsync({
        id: note.id,
        is_favorite: !note.is_favorite,
      });
      if (viewNote?.id === note.id) {
        setViewNote({ ...viewNote, is_favorite: !note.is_favorite });
      }
    } catch (err: any) {
      toast.error('Error al actualizar favorito');
    }
  };

  return (
    <div className="w-full px-8 py-8 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Notas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Notas compartidas de tu sucursal
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Nota
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título, contenido o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Urgencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">Normal</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Urgente</SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          mode="popover"
          placeholder="Fecha desde"
          value={dateFrom ? new Date(dateFrom + 'T00:00:00') : undefined}
          onDateChange={(date) => setDateFrom(format(date, 'yyyy-MM-dd'))}
        />

        <DatePicker
          mode="popover"
          placeholder="Fecha hasta"
          value={dateTo ? new Date(dateTo + 'T00:00:00') : undefined}
          onDateChange={(date) => setDateTo(format(date, 'yyyy-MM-dd'))}
        />

        {(search || urgencyFilter !== 'all' || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch('');
              setUrgencyFilter('all');
              setDateFrom('');
              setDateTo('');
            }}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Contador */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          Cargando notas...
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-muted-foreground">No hay notas para mostrar</p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primera nota
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              currentUserId={user?.id ?? ''}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Drawer ver nota */}
      <NoteDrawer
        open={drawerOpen}
        onClose={() => {
          if (!formOpen && !deleteOpen) {
            setDrawerOpen(false);
            setViewNote(null);
          }
        }}
        note={viewNote}
        currentUserId={user?.id ?? ''}
        onEdit={handleEdit}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Dialog crear/editar */}
      <NoteFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSave}
        note={editingNote}
        isLoading={createNote.isPending || updateNote.isPending}
      />

      {/* Dialog eliminar */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            setDeleteOpen(false);
            setDeleteNote(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar nota?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La nota{' '}
              <strong>{deleteNote?.title}</strong> será eliminada permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteNote(null);
              }}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </span>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
