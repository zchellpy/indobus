// server/api/routes/index.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)

  const { error } = await client
    .from('buses')
    .insert({
      name: body.name,
      type: body.type,
      capacity: body.capacity,
      plate_number: body.plate_number
    })

  if (error) {
    console.error('Err: ', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
