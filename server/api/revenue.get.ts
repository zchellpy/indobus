// server/api/revenue.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { start, end } = getQuery(event)

  // Fetch data bookings dari database
  const { data: bookings, error } = await client
    .from('bookings')
    .select('created_at, total_price')
    .gte('created_at', start as string)
    .lte('created_at', end as string)
    // .eq('status', 'confirmed') // Sesuaikan status jika perlu

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return bookings
})
