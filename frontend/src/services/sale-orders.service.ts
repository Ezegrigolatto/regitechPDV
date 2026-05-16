import supabase from '../../supabase-config';
import type { TicketItem } from './tickets.service';

export interface SaleOrder {
  id: string;
  type: 'sale' | 'remito' | 'presupuesto';
  branch_id: string;
  customer_id: string | null;
  created_by: string | null;
  ticket_id: string | null;
  price_list: 'retail' | 'wholesale';
  items: TicketItem[];
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  subtotal: number;
  tax_total: number;
  total: number;
  moves_stock: boolean;
  status: 'pending' | 'completed' | 'cancelled' | 'returned';
  afip_cae: string | null;
  afip_voucher_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // relaciones
  customers?: { id: string; full_name: string } | null;
  profiles?: { id: string; full_name: string } | null;
  branches?: { id: string; name: string } | null;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  sale_order_id: string;
  payment_method_id: string;
  amount: number;
  reference: string | null;
  created_at: string;
  payment_methods?: { id: string; name: string };
}

export interface PaymentMethod {
  id: string;
  name: 'efectivo' | 'debito' | 'credito' | 'transferencia' | 'qr';
  is_active: boolean;
  requires_reference: boolean;
}

export interface SaleOrderFilters {
  branch_id?: string;
  type?: 'sale' | 'remito' | 'presupuesto';
  status?: 'pending' | 'completed' | 'cancelled' | 'returned';
  customer_id?: string;
  date_from?: string;
  date_to?: string;
}

// Obtener órdenes de venta con filtros
export async function getSaleOrders(filters?: SaleOrderFilters): Promise<SaleOrder[]> {
  let query = supabase
    .from('sale_orders')
    .select(`
      *,
      customers(id, full_name),
      profiles(id, full_name),
      branches(id, name),
      payments(
        id,
        amount,
        reference,
        payment_methods(id, name)
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.branch_id) {
    query = query.eq('branch_id', filters.branch_id);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
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

// Obtener una orden por ID
export async function getSaleOrderById(id: string): Promise<SaleOrder> {
  const { data, error } = await supabase
    .from('sale_orders')
    .select(`
      *,
      customers(id, full_name),
      profiles(id, full_name),
      branches(id, name),
      payments(
        id,
        amount,
        reference,
        payment_methods(id, name)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Obtener métodos de pago activos
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}