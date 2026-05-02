// server/api/stations/index.patch.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const query = getQuery(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!query.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID wajib disertakan.' })
  }

  const { error } = await client
    .from('stations')
    .update({
      route_id: body.route_id,
      station_name: body.station_name,
      address: body.address
    })
    .eq('id', query.id as string)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
