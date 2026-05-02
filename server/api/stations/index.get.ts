// server/api/stations/index.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('stations')
    .select(`
      *,
      routes (
        origin,
        destination
      )
    `)
    .order('station_name', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})
