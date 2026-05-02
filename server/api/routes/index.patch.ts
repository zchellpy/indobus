// server/api/routes/index.patch.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const query = getQuery(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!query.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID wajib disertakan.' })
  }

  const { error } = await client
    .from('routes')
    .update({
      origin: body.origin,
      destination: body.destination
    })
    .eq('id', query.id as string)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
