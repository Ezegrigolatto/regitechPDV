import supabase from '../../supabase-config';

export interface TicketItem {
  product_id: string;
  sku: string | null;
  name: string;
  unit: string | null;
  quantity: number;
  unit_price: number;
  retail_price: number;
  cost_price: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
}

export interface Ticket {
  id: string;
  branch_id: string;
  created_by: string | null;
  customer_id: string | null;
  price_list: 'retail' | 'wholesale';
  items: TicketItem[];
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  subtotal: number;
  tax_total: number;
  total: number;
  notes: string | null;
  status: 'open' | 'converted' | 'discarded';
  converted_to_id: string | null;
  created_at: string;
  updated_at: string;
  // relaciones
  customers?: { id: string; full_name: string } | null;
  profiles?: { id: string; full_name: string } | null;
}

// Obtener tickets abiertos de una sucursal
export async function getOpenTickets(branch_id: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      customers(id, full_name),
      profiles(id, full_name)
    `)
    .eq('branch_id', branch_id)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Obtener un ticket por ID
export async function getTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      customers(id, full_name),
      profiles(id, full_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Crear ticket
export async function createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'customers' | 'profiles'>): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .insert(ticket)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Actualizar ticket (agregar/quitar items, cambiar descuento, etc.)
export async function updateTicket(id: string, ticket: Partial<Ticket>): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .update(ticket)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Descartar ticket
export async function discardTicket(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: 'discarded' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Calcular totales del ticket en base a los items y descuento
export function calculateTicketTotals(
  items: TicketItem[],
  discount_type: 'percentage' | 'fixed' | null,
  discount_value: number | null
) {
  const subtotalBruto = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxTotal = items.reduce((sum, item) => sum + (item.tax_amount ?? 0), 0);

  let descuento = 0;
  if (discount_type === 'percentage' && discount_value) {
    descuento = subtotalBruto * (discount_value / 100);
  } else if (discount_type === 'fixed' && discount_value) {
    descuento = discount_value;
  }

  const subtotal = subtotalBruto - descuento;
  const total = subtotal + taxTotal;

  return { subtotal, tax_total: taxTotal, total };
}

// Calcular subtotal de un item individual
export function calculateItemSubtotal(
  quantity: number,
  unit_price: number,
  discount_type: 'percentage' | 'fixed' | null,
  discount_value: number | null,
  tax_rate: number | null
) {
  let precio = unit_price * quantity;

  if (discount_type === 'percentage' && discount_value) {
    precio = precio * (1 - discount_value / 100);
  } else if (discount_type === 'fixed' && discount_value) {
    precio = precio - discount_value;
  }

  const tax_amount = tax_rate ? precio * tax_rate : 0;

  return {
    subtotal: precio,
    tax_amount,
  };
}