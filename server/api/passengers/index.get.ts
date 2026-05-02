// server/api/passengers/index.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('booking_passengers')
    .select(`
      *,
      bookings (
        booking_date,
        booking_code,
        status,
        bus_type,
        origin,
        destination,
        departure_time,
        profiles!inner (
          full_name,
          phone_number,
          avatar_url,
          role
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  // console.log('Data: ', data)

  return data
})
