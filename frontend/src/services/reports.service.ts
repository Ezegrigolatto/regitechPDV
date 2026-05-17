import supabase from '../../supabase-config';

export interface DateRange {
  from: string;
  to: string;
}

// ─── VENTAS ───────────────────────────────────────────────────────────────────

export async function getSalesStats(branchId: string, range: DateRange, categoryId?: string) {
  // Órdenes completadas en el rango
  let query = supabase
    .from('sale_orders')
    .select(`
      id, total, subtotal, tax_total, created_at, type,
      items,
      payments(amount, payment_methods(name))
    `)
    .eq('branch_id', branchId)
    .eq('status', 'completed')
    .gte('created_at', range.from)
    .lte('created_at', range.to);

  const { data: orders, error } = await query;
  if (error) throw error;

  let filteredOrders = orders ?? [];

  // Filtrar por categoría: los items solo tienen product_id, hay que resolver por productos
  if (categoryId) {
    const { data: catProducts } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', categoryId);

    const productIds = new Set((catProducts ?? []).map((p) => p.id));
    filteredOrders = filteredOrders.filter((o) =>
      (o.items as any[]).some((item) => productIds.has(item.product_id))
    );
  }

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Desglose por método de pago
  const paymentBreakdown: Record<string, number> = {};
  filteredOrders.forEach((o) => {
    (o.payments as any[]).forEach((p) => {
      const name = p.payment_methods?.name ?? 'otro';
      paymentBreakdown[name] = (paymentBreakdown[name] ?? 0) + p.amount;
    });
  });

  // Ventas por día
  const salesByDay: Record<string, number> = {};
  filteredOrders.forEach((o) => {
    const day = o.created_at.slice(0, 10);
    salesByDay[day] = (salesByDay[day] ?? 0) + o.total;
  });

  // Productos más vendidos
  const productMap: Record<string, { name: string; quantity: number; total: number; category: string }> = {};
  filteredOrders.forEach((o) => {
    (o.items as any[]).forEach((item) => {
      if (!productMap[item.product_id]) {
        productMap[item.product_id] = {
          name: item.name,
          quantity: 0,
          total: 0,
          category: item.category ?? '',
        };
      }
      productMap[item.product_id].quantity += item.quantity;
      productMap[item.product_id].total += item.subtotal;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Ventas por tipo de orden
  const byType = {
    sale: filteredOrders.filter((o) => o.type === 'sale').reduce((sum, o) => sum + o.total, 0),
    remito: filteredOrders.filter((o) => o.type === 'remito').reduce((sum, o) => sum + o.total, 0),
    presupuesto: filteredOrders.filter((o) => o.type === 'presupuesto').reduce((sum, o) => sum + o.total, 0),
  };

  return {
    totalRevenue,
    totalOrders,
    avgTicket,
    paymentBreakdown,
    salesByDay,
    topProducts,
    byType,
  };
}

// Período anterior para comparativas
export async function getPreviousPeriodRevenue(branchId: string, range: DateRange) {
  const from = new Date(range.from);
  const to = new Date(range.to);
  const diff = to.getTime() - from.getTime();

  const prevFrom = new Date(from.getTime() - diff).toISOString();
  const prevTo = new Date(to.getTime() - diff).toISOString();

  const { data, error } = await supabase
    .from('sale_orders')
    .select('total')
    .eq('branch_id', branchId)
    .eq('status', 'completed')
    .gte('created_at', prevFrom)
    .lte('created_at', prevTo);

  if (error) throw error;
  return (data ?? []).reduce((sum, o) => sum + o.total, 0);
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export async function getCustomersStats(branchId: string, range: DateRange) {
  // Clientes nuevos en el rango
  const { data: newCustomers, error: newError } = await supabase
    .from('customers')
    .select('id, full_name, created_at')
    .eq('is_active', true)
    .gte('created_at', range.from)
    .lte('created_at', range.to);

  if (newError) throw newError;

  // Clientes por día
  const newByDay: Record<string, number> = {};
  (newCustomers ?? []).forEach((c) => {
    const day = c.created_at.slice(0, 10);
    newByDay[day] = (newByDay[day] ?? 0) + 1;
  });

  // Top clientes por compras en el rango
  const { data: orders, error: ordersError } = await supabase
    .from('sale_orders')
    .select('customer_id, total, customers(id, full_name)')
    .eq('branch_id', branchId)
    .eq('status', 'completed')
    .gte('created_at', range.from)
    .lte('created_at', range.to)
    .not('customer_id', 'is', null);

  if (ordersError) throw ordersError;

  const customerMap: Record<string, { name: string; total: number; orders: number }> = {};
  (orders ?? []).forEach((o) => {
    const id = o.customer_id!;
    const name = (o.customers as any)?.full_name ?? 'Desconocido';
    if (!customerMap[id]) customerMap[id] = { name, total: 0, orders: 0 };
    customerMap[id].total += o.total;
    customerMap[id].orders += 1;
  });

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Recurrentes vs nuevos
  const newIds = new Set((newCustomers ?? []).map((c) => c.id));
  const recurringIds = new Set(
    (orders ?? [])
      .filter((o) => o.customer_id && !newIds.has(o.customer_id))
      .map((o) => o.customer_id!)
  );

  return {
    newCustomers: newCustomers?.length ?? 0,
    recurringCustomers: recurringIds.size,
    newByDay,
    topCustomers,
  };
}

// ─── STOCK ────────────────────────────────────────────────────────────────────

export async function getStockStats(branchId: string) {
  const { data: stockData, error } = await supabase
    .from('branch_stock')
    .select(`
      quantity,
      products(
        id, name, cost_price, stock_min, is_active,
        categories(id, name)
      )
    `)
    .eq('branch_id', branchId);

  if (error) throw error;

  const items = (stockData ?? []).filter((s) => (s.products as any)?.is_active);

  const totalProducts = items.length;
  const totalUnits = items.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = items.reduce((sum, s) => {
    const cost = (s.products as any)?.cost_price ?? 0;
    return sum + s.quantity * cost;
  }, 0);
  const lowStock = items.filter((s) => s.quantity <= (s.products as any)?.stock_min).length;

  // Por categoría
  const categoryMap: Record<string, { name: string; units: number; value: number }> = {};
  items.forEach((s) => {
    const cat = (s.products as any)?.categories?.name ?? 'Sin categoría';
    const catId = (s.products as any)?.categories?.id ?? 'none';
    if (!categoryMap[catId]) categoryMap[catId] = { name: cat, units: 0, value: 0 };
    categoryMap[catId].units += s.quantity;
    categoryMap[catId].value += s.quantity * ((s.products as any)?.cost_price ?? 0);
  });

  const byCategory = Object.values(categoryMap).sort((a, b) => b.value - a.value);

  // Movimientos de stock recientes para el gráfico de evolución
  const { data: movements, error: movError } = await supabase
    .from('stock_movements')
    .select('quantity, type, created_at')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (movError) throw movError;

  return {
    totalProducts,
    totalUnits,
    totalValue,
    lowStock,
    byCategory,
    movements: movements ?? [],
  };
}