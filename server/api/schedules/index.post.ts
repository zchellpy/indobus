// server/api/stations/index.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)

  const { error } = await client
    .from('schedules')
    .insert({
      route_id: body.route_id,
      departure_time: body.departure_time,
      bus_type: body.bus_type,
      total_seats: body.total_seats,
      price_per_seat: body.price_per_seat
    })

  if (error) {
    console.error('Err: ', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
