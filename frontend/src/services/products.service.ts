import supabase from '../../supabase-config';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  category_id: string;
  unit_id: string | null;
  tax_id: string | null;
  cost_price: number;
  retail_price: number;
  wholesale_price: number;
  stock_min: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // relaciones
  categories?: { id: string; name: string };
  units_of_measure?: { id: string; name: string; abbreviation: string };
  taxes?: { id: string; name: string; rate: number };
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  is_active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Obtener todos los productos con filtros opcionales
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      units_of_measure(id, name, abbreviation),
      taxes(id, name, rate)
    `)
    .order('name');

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`);
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Obtener un producto por ID
export async function getProductById(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      units_of_measure(id, name, abbreviation),
      taxes(id, name, rate)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Obtener categorías
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// Obtener unidades de medida
export async function getUnitsOfMeasure() {
  const { data, error } = await supabase
    .from('units_of_measure')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// Obtener impuestos
export async function getTaxes() {
  const { data, error } = await supabase
    .from('taxes')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// Crear producto
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories' | 'units_of_measure' | 'taxes'>) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Actualizar producto
export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Desactivar producto (soft delete)
export async function deactivateProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}