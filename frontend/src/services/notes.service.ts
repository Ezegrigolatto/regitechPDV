import supabase from '../../supabase-config';

export interface Note {
  id: string;
  created_by: string;
  title: string;
  content: string | null;
  color: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteFilters {
  search?: string;
  is_favorite?: boolean;
}

// Obtener notas del usuario autenticado
export async function getNotes(filters?: NoteFilters): Promise<Note[]> {
  let query = supabase
    .from('notes')
    .select('*')
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  if (filters?.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Obtener una nota por ID
export async function getNoteById(id: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Crear nota
export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Actualizar nota
export async function updateNote(id: string, note: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(note)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Eliminar nota
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Togglear favorito
export async function toggleNoteFavorite(id: string, is_favorite: boolean): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_favorite })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}