import { supabaseAdmin, corsHeaders, getAuthUser, errorResponse, successResponse } from '../_shared/client.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const profile = await getAuthUser(req)

    if (!['admin', 'cajero'].includes(profile.role)) {
      return errorResponse('Sin permisos para cerrar caja', 403)
    }

    const { session_id, closing_amount } = await req.json()

    // 1. Obtener la sesión abierta
    const { data: session, error } = await supabaseAdmin
      .from('cash_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('status', 'open')
      .single()

    if (error || !session) return errorResponse('Sesión de caja no encontrada o ya cerrada')

    // 2. Calcular el monto esperado sumando pagos en efectivo del período
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('amount, payment_methods!inner(name)')
      .gte('created_at', session.opened_at)
      .eq('payment_methods.name', 'efectivo')

    const totalEfectivo = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)
    const expected_amount = session.opening_amount + totalEfectivo
    const difference = closing_amount - expected_amount

    // 3. Cerrar la sesión
    const { data: closed, error: closeError } = await supabaseAdmin
      .from('cash_sessions')
      .update({
        closed_by: profile.id,
        closing_amount,
        expected_amount,
        difference,
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', session_id)
      .select()
      .single()

    if (closeError) throw new Error(closeError.message)

    return successResponse({ cash_session: closed })

  } catch (err) {
    return errorResponse(err.message, 500)
  }
})