import supabase from '../../supabase-config';

export interface SupplierPurchase {
  id: string;
  supplier_id: string;
  branch_id: string;
  date: string;
  amount: number;
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { id: string; full_name: string } | null;
}

export async function getSupplierPurchases(supplier_id: string): Promise<SupplierPurchase[]> {
  const { data, error } = await supabase
    .from('supplier_purchases')
    .select('*, profiles(id, full_name)')
    .eq('supplier_id', supplier_id)
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createSupplierPurchase(
  purchase: Omit<SupplierPurchase, 'id' | 'created_at' | 'updated_at' | 'profiles'>
): Promise<SupplierPurchase> {
  const { data, error } = await supabase
    .from('supplier_purchases')
    .insert(purchase)
    .select('*, profiles(id, full_name)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateSupplierPurchase(
  id: string,
  purchase: Partial<SupplierPurchase>
): Promise<SupplierPurchase> {
  const { data, error } = await supabase
    .from('supplier_purchases')
    .update(purchase)
    .eq('id', id)
    .select('*, profiles(id, full_name)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSupplierPurchase(id: string): Promise<void> {
  const { error } = await supabase
    .from('supplier_purchases')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadPurchaseFile(
  supplierId: string,
  file: File
): Promise<{ url: string; name: string }> {
  const ext = file.name.split('.').pop();
  const path = `supplier-purchases/${supplierId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('purchases')
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('purchases').getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
}