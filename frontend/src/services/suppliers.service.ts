import supabase from '../../supabase-config';

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  branch_id: string;
  status: 'draft' | 'confirmed' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax_total: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
  // relaciones
  suppliers?: { id: string; name: string };
  branches?: { id: string; name: string };
}

export interface PurchaseOrderItem {
  product_id: string;
  sku: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
}

export interface SupplierFilters {
  search?: string;
  is_active?: boolean;
}

// Obtener todos los proveedores
export async function getSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
  let query = supabase
    .from('suppliers')
    .select('*')
    .order('name');

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%`);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Obtener un proveedor por ID
export async function getSupplierById(id: string): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Obtener órdenes de compra de un proveedor
export async function getPurchaseOrdersBySupplier(supplier_id: string): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      suppliers(id, name),
      branches(id, name)
    `)
    .eq('supplier_id', supplier_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Obtener todas las órdenes de compra
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      suppliers(id, name),
      branches(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Crear proveedor
export async function createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Actualizar proveedor
export async function updateSupplier(id: string, supplier: Partial<Supplier>) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplier)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Crear orden de compra
export async function createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'suppliers' | 'branches'>) {
  const { data, error } = await supabase
    .from('purchase_orders')
    .insert(order)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Actualizar orden de compra
export async function updatePurchaseOrder(id: string, order: Partial<PurchaseOrder>) {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(order)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Desactivar proveedor
export async function deactivateSupplier(id: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}