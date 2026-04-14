import supabase from '../../supabase-config';

export interface Note {
  id: string;
  created_by: string;
  branch_id: string;
  title: string;
  content: string | null;
  color: string;
  is_favorite: boolean;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  content_updated_at: string;
  // relaciones
  profiles?: { id: string; full_name: string };
}

export interface NoteFilters {
  search?: string;
  is_favorite?: boolean;
  urgency?: 'low' | 'medium' | 'high';
  date_from?: string;
  date_to?: string;
}

export async function getNotes(filters?: NoteFilters): Promise<Note[]> {
  let query = supabase
    .from('notes')
    .select('*, profiles(id, full_name)')
    .order('is_favorite', { ascending: false })
    .order('updated_at', { ascending: false });

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%`
    );
  }

  if (filters?.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite);
  }

  if (filters?.urgency) {
    query = query.eq('urgency', filters.urgency);
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getNoteById(id: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .select('*, profiles(id, full_name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createNote(
  note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'profiles'>
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select('*, profiles(id, full_name)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateNote(id: string, note: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(note)
    .eq('id', id)
    .select('*, profiles(id, full_name)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleNoteFavorite(id: string, is_favorite: boolean): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_favorite })
    .eq('id', id)
    .select('*, profiles(id, full_name)')
    .single();

  if (error) throw error;
  return data;
}