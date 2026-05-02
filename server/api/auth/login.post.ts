// server/api/auth/login.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client.auth.signInWithPassword({
    email: body.email,
    password: body.password
  })

  if (error) {
    throw createError({
      statusCode: 401,
      statusMessage: error.message
    })
  }

  return data
})
