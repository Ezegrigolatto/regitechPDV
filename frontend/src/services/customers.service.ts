import supabase from '../../supabase-config';

export interface Customer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  customer_type: 'retail' | 'wholesale';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerFilters {
  search?: string;
  customer_type?: 'retail' | 'wholesale';
  is_active?: boolean;
}

// Obtener todos los clientes
export async function getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
  let query = supabase
    .from('customers')
    .select('*')
    .order('full_name');

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%`);
  }

  if (filters?.customer_type) {
    query = query.eq('customer_type', filters.customer_type);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Obtener un cliente por ID
export async function getCustomerById(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Crear cliente
export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Actualizar cliente
export async function updateCustomer(id: string, customer: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Desactivar cliente
export async function deactivateCustomer(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}