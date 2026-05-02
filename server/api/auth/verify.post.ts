// server/api/auth/register.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)

  const { error } = await client.auth.verifyOtp({
    email: body.email,
    token: body.token,
    type: 'signup'
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})
