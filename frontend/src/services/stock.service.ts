import supabase from '../../supabase-config';

export interface BranchStock {
  id: string;
  product_id: string;
  branch_id: string;
  quantity: number;
  updated_at: string;
  // relaciones
  products?: {
    id: string;
    name: string;
    sku: string | null;
    stock_min: number;
    categories?: { id: string; name: string };
    units_of_measure?: { id: string; name: string; abbreviation: string };
  };
  branches?: { id: string; name: string };
}

export interface StockMovement {
  id: string;
  product_id: string;
  branch_id: string;
  type: 'sale' | 'purchase' | 'manual_in' | 'manual_out' | 'return' | 'adjustment';
  quantity: number;
  reference_id: string | null;
  reference_type: 'sale_order' | 'purchase_order' | 'manual' | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // relaciones
  products?: { id: string; name: string; sku: string | null };
  profiles?: { id: string; full_name: string };
}

export interface StockMovementFilters {
  branch_id?: string;
  product_id?: string;
  type?: StockMovement['type'];
  date_from?: string;
  date_to?: string;
}

// Obtener stock por sucursal
export async function getBranchStock(branch_id: string): Promise<BranchStock[]> {
  const { data, error } = await supabase
    .from('branch_stock')
    .select(`
      *,
      products(
        id,
        name,
        sku,
        stock_min,
        categories(id, name),
        units_of_measure(id, name, abbreviation)
      ),
      branches(id, name)
    `)
    .eq('branch_id', branch_id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Obtener stock bajo mínimo de una sucursal
export async function getLowStock(branch_id: string): Promise<BranchStock[]> {
  const { data, error } = await supabase
    .from('branch_stock')
    .select(`
      *,
      products(
        id,
        name,
        sku,
        stock_min,
        categories(id, name),
        units_of_measure(id, name, abbreviation)
      ),
      branches(id, name)
    `)
    .eq('branch_id', branch_id);

  if (error) throw error;

  // Filtrar los que están por debajo del mínimo
  return (data ?? []).filter(
    (item) => item.products && item.quantity <= item.products.stock_min
  );
}

// Obtener movimientos de stock con filtros
export async function getStockMovements(filters?: StockMovementFilters): Promise<StockMovement[]> {
  let query = supabase
    .from('stock_movements')
    .select(`
      *,
      products(id, name, sku),
      profiles(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.branch_id) {
    query = query.eq('branch_id', filters.branch_id);
  }

  if (filters?.product_id) {
    query = query.eq('product_id', filters.product_id);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
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

// Ajuste manual de stock (entrada o salida)
export async function manualStockAdjustment({
  product_id,
  branch_id,
  quantity,
  type,
  notes,
  created_by,
}: {
  product_id: string;
  branch_id: string;
  quantity: number;
  type: 'manual_in' | 'manual_out' | 'adjustment';
  notes?: string;
  created_by: string;
}): Promise<StockMovement> {
  const { data, error } = await supabase
    .from('stock_movements')
    .insert({
      product_id,
      branch_id,
      type,
      quantity: type === 'manual_out' ? -Math.abs(quantity) : Math.abs(quantity),
      reference_type: 'manual',
      notes: notes ?? null,
      created_by,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}