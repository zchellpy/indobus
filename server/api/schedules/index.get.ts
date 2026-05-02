// server/api/stations/index.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('schedules')
    .select(`
      *,
      routes (
        origin,
        destination
      ),
      bookings (
        passengers_amount
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  const resultData = data?.map((schedule) => {
    // hitung total penumpang
    const totalPassengers = schedule.bookings?.reduce((acc, curr) => {
      return acc + (curr.passengers_amount || 0)
    }, 0) || 0

    // keluarkan data bookings
    const { bookings, ...finalData } = schedule

    return {
      ...finalData,
      passengers_amount: totalPassengers
    }
  })

  return resultData
})
