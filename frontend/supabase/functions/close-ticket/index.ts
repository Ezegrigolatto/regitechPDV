import { supabaseAdmin, corsHeaders, getAuthUser, errorResponse, successResponse } from '../_shared/client.ts'

interface CloseTicketPayload {
  ticket_id: string
  order_type: 'sale' | 'remito' | 'presupuesto'
  payments: {
    payment_method_id: string
    amount: number
    reference?: string
  }[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const profile = await getAuthUser(req)
    const body: CloseTicketPayload = await req.json()
    const { ticket_id, order_type, payments } = body

    // 1. Obtener el ticket y validar que está abierto
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticket_id)
      .eq('status', 'open')
      .single()

    if (ticketError || !ticket) return errorResponse('Ticket no encontrado o ya cerrado')

    // 2. Validar que el usuario pertenece a la sucursal del ticket
    if (profile.role !== 'admin' && ticket.branch_id !== profile.branch_id) {
      return errorResponse('Sin permisos para esta sucursal', 403)
    }

    // 3. Validar que los pagos sumen el total (solo para sale y remito)
    if (order_type !== 'presupuesto') {
      const totalPagado = payments.reduce((sum, p) => sum + p.amount, 0)
      if (Math.abs(totalPagado - ticket.total) > 0.01) {
        return errorResponse(`El total pagado (${totalPagado}) no coincide con el total del ticket (${ticket.total})`)
      }
    }

    // 4. Crear la orden de venta
    const { data: saleOrder, error: orderError } = await supabaseAdmin
      .from('sale_orders')
      .insert({
        type: order_type,
        branch_id: ticket.branch_id,
        customer_id: ticket.customer_id,
        created_by: profile.id,
        ticket_id: ticket.id,
        price_list: ticket.price_list,
        items: ticket.items,
        discount_type: ticket.discount_type,
        discount_value: ticket.discount_value,
        subtotal: ticket.subtotal,
        tax_total: ticket.tax_total,
        total: ticket.total,
        status: 'completed',
      })
      .select()
      .single()

    if (orderError) throw new Error(`Error creando orden: ${orderError.message}`)

    // 5. Registrar pagos (solo si no es presupuesto)
    if (order_type !== 'presupuesto' && payments.length > 0) {
      const paymentRows = payments.map(p => ({
        sale_order_id: saleOrder.id,
        payment_method_id: p.payment_method_id,
        amount: p.amount,
        reference: p.reference ?? null,
      }))

      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert(paymentRows)

      if (paymentError) throw new Error(`Error registrando pagos: ${paymentError.message}`)
    }

    // 6. Mover stock (solo sale y remito)
    if (order_type !== 'presupuesto') {
      const items = ticket.items as any[]
      const movementRows = items.map(item => ({
        product_id: item.product_id,
        branch_id: ticket.branch_id,
        type: 'sale',
        quantity: -Math.abs(item.quantity),
        reference_id: saleOrder.id,
        reference_type: 'sale_order',
        created_by: profile.id,
      }))

      const { error: movError } = await supabaseAdmin
        .from('stock_movements')
        .insert(movementRows)

      if (movError) throw new Error(`Error registrando movimientos: ${movError.message}`)

      for (const item of items) {
        const { error: stockError } = await supabaseAdmin.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_branch_id: ticket.branch_id,
          p_quantity: item.quantity,
        })

        if (stockError) throw new Error(`Error actualizando stock de ${item.name}: ${stockError.message}`)
      }
    }

    // 7. Marcar el ticket como convertido
    await supabaseAdmin
      .from('tickets')
      .update({
        status: 'converted',
        converted_to_id: saleOrder.id,
      })
      .eq('id', ticket_id)

    return successResponse({ sale_order: saleOrder })

  } catch (err) {
    return errorResponse(err.message, 500)
  }
})