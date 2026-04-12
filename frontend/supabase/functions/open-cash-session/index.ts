import { supabaseAdmin, corsHeaders, getAuthUser, errorResponse, successResponse } from '../_shared/client.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const profile = await getAuthUser(req)

    if (!['admin', 'cajero'].includes(profile.role)) {
      return errorResponse('Sin permisos para abrir caja', 403)
    }

    const { opening_amount, reminder_time } = await req.json()
    const branch_id = profile.branch_id

    if (!branch_id) return errorResponse('El usuario no tiene sucursal asignada')

    // 1. Verificar que no haya una caja ya abierta en esa sucursal
    const { data: existing } = await supabaseAdmin
      .from('cash_sessions')
      .select('id')
      .eq('branch_id', branch_id)
      .eq('status', 'open')
      .single()

    if (existing) return errorResponse('Ya existe una sesión de caja abierta en esta sucursal')

    // 2. Crear la sesión
    const { data: session, error } = await supabaseAdmin
      .from('cash_sessions')
      .insert({
        branch_id,
        opened_by: profile.id,
        opening_amount,
        reminder_time: reminder_time ?? null,
        status: 'open',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return successResponse({ cash_session: session })

  } catch (err) {
    return errorResponse(err.message, 500)
  }
})