import { supabaseAdmin, corsHeaders, getAuthUser, errorResponse, successResponse } from '../_shared/client.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const profile = await getAuthUser(req)

    if (profile.role !== 'admin') return errorResponse('Solo administradores pueden cancelar órdenes', 403)

    const { sale_order_id, reason } = await req.json()

    // 1. Obtener la orden
    const { data: order, error } = await supabaseAdmin
      .from('sale_orders')
      .select('*')
      .eq('id', sale_order_id)
      .eq('status', 'completed')
      .single()

    if (error || !order) return errorResponse('Orden no encontrada o no se puede cancelar')

    // 2. Si movía stock, revertirlo
    if (order.moves_stock) {
      const items = order.items as any[]

      const movementRows = items.map(item => ({
        product_id: item.product_id,
        branch_id: order.branch_id,
        type: 'return',
        quantity: Math.abs(item.quantity),
        reference_id: order.id,
        reference_type: 'sale_order',
        notes: `Cancelación: ${reason ?? 'sin motivo'}`,
        created_by: profile.id,
      }))

      const { error: movError } = await supabaseAdmin
        .from('stock_movements')
        .insert(movementRows)

      if (movError) throw new Error(`Error revirtiendo stock: ${movError.message}`)

      for (const item of items) {
        await supabaseAdmin.rpc('increment_stock', {
          p_product_id: item.product_id,
          p_branch_id: order.branch_id,
          p_quantity: item.quantity,
        })
      }
    }

    // 3. Cambiar status de la orden
    const { data: updated } = await supabaseAdmin
      .from('sale_orders')
      .update({ status: 'cancelled' })
      .eq('id', sale_order_id)
      .select()
      .single()

    return successResponse({ sale_order: updated })

  } catch (err) {
    return errorResponse(err.message, 500)
  }
})