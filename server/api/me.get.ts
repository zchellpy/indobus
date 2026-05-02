// server/api/me.get.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  // if (!user) return {} as unknown
  if (!user) {
    console.error('Id user tidak ditemukan')
    throw createError({
      statusCode: 500,
      statusMessage: 'Id user tidak ditemukan'
    })
  }

  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.sub)
    .single()

  if (error) {
    console.error('Error Database Profiles:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})
