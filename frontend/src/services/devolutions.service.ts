import type { TicketItem } from './tickets.service';

export interface Devolution {
  id: string;
  original_order_id: string;
  branch_id: string;
  customer_id: string | null;
  created_by: string | null;
  items: TicketItem[];
  subtotal: number;
  tax_total: number;
  total: number;
  notes: string | null;
  created_at: string;
}

export async function createDevolution({
  original_order_id,
  notes,
  session_token,
}: {
  original_order_id: string;
  notes?: string;
  session_token: string;
}) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-sale-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        sale_order_id: original_order_id,
        reason: notes ?? 'Devolución',
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? 'Error al procesar devolución');
  return data;
}