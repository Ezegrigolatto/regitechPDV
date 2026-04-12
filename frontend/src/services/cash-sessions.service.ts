import supabase from '../../supabase-config';

export interface CashSession {
  id: string;
  branch_id: string;
  opened_by: string | null;
  closed_by: string | null;
  opening_amount: number;
  closing_amount: number | null;
  expected_amount: number | null;
  difference: number | null;
  reminder_time: string | null;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
  // relaciones
  branches?: { id: string; name: string };
  opener?: { id: string; full_name: string };
  closer?: { id: string; full_name: string } | null;
}

// Obtener sesión de caja abierta de una sucursal
export async function getOpenCashSession(branch_id: string): Promise<CashSession | null> {
  const { data, error } = await supabase
    .from('cash_sessions')
    .select(`
      *,
      branches(id, name),
      opener:opened_by(id, full_name),
      closer:closed_by(id, full_name)
    `)
    .eq('branch_id', branch_id)
    .eq('status', 'open')
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data ?? null;
}

// Obtener historial de sesiones de una sucursal
export async function getCashSessionHistory(branch_id: string): Promise<CashSession[]> {
  const { data, error } = await supabase
    .from('cash_sessions')
    .select(`
      *,
      branches(id, name),
      opener:opened_by(id, full_name),
      closer:closed_by(id, full_name)
    `)
    .eq('branch_id', branch_id)
    .order('opened_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}