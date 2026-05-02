// server/api/routes/index.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)

  const { error } = await client
    .from('routes')
    .insert({
      origin: body.origin,
      destination: body.destination
    })

  if (error) {
    console.error('Err: ', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
