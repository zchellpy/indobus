// server/api/stations/index.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)

  const { error } = await client
    .from('stations')
    .insert({
      route_id: body.route_id,
      station_name: body.station_name,
      address: body.address
    })

  if (error) {
    console.error('Err: ', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
