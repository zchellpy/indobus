// server/api/routes/index.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)

  const { error } = await client
    .from('expedition_rates')
    .insert({
      destination: body.destination,
      category: body.category,
      sub_category: body.sub_category,
      base_price: body.base_price
    })

  if (error) {
    console.error('Err: ', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
