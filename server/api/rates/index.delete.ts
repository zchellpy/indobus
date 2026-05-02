// server/api/routes/index.delete.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!query.ids) {
    throw createError({ statusCode: 400, statusMessage: 'ID wajib disertakan.' })
  }

  const { error } = await client
    .from('expedition_rates')
    .delete()
    .in('id', (query.ids as string).split(','))

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
