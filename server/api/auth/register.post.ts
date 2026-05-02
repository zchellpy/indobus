// server/api/auth/register.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await serverSupabaseClient<Database>(event)
  // console.log('Data diterima di server:', body)

  const { data, error } = await client.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        full_name: body.full_name || 'User Baru',
        role: 'owner'
      }
    }
  })

  if (error) {
    console.error('Error dari Supabase Auth:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return { register: data }
})
