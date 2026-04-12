import { supabaseAdmin, corsHeaders, getAuthUser, errorResponse, successResponse } from '../_shared/client.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const profile = await getAuthUser(req)

    if (!['admin', 'vendedor'].includes(profile.role)) {
      return errorResponse('Sin permisos', 403)
    }

    const { purchase_order_id } = await req.json()

    // 1. Obtener la orden de compra
    const { data: order, error } = await supabaseAdmin
      .from('purchase_orders')
      .select('*')
      .eq('id', purchase_order_id)
      .eq('status', 'confirmed')
      .single()

    if (error || !order) return errorResponse('Orden no encontrada o no está confirmada')

    if (profile.role !== 'admin' && order.branch_id !== profile.branch_id) {
      return errorResponse('Sin permisos para esta sucursal', 403)
    }

    const items = order.items as any[]

    // 2. Crear movimientos de stock (entradas)
    const movementRows = items.map(item => ({
      product_id: item.product_id,
      branch_id: order.branch_id,
      type: 'purchase',
      quantity: Math.abs(item.quantity),
      reference_id: order.id,
      reference_type: 'purchase_order',
      created_by: profile.id,
    }))

    const { error: movError } = await supabaseAdmin
      .from('stock_movements')
      .insert(movementRows)

    if (movError) throw new Error(`Error en movimientos: ${movError.message}`)

    // 3. Actualizar branch_stock
    for (const item of items) {
      const { error: stockError } = await supabaseAdmin.rpc('increment_stock', {
        p_product_id: item.product_id,
        p_branch_id: order.branch_id,
        p_quantity: item.quantity,
      })

      if (stockError) throw new Error(`Error actualizando stock: ${stockError.message}`)
    }

    // 4. Marcar la orden como recibida
    const { data: updated } = await supabaseAdmin
      .from('purchase_orders')
      .update({ status: 'received', received_at: new Date().toISOString() })
      .eq('id', purchase_order_id)
      .select()
      .single()

    return successResponse({ purchase_order: updated })

  } catch (err) {
    return errorResponse(err.message, 500)
  }
})