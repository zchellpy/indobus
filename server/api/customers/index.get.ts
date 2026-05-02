// server/api/station.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .in('role', ['user', 'agent'])
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  console.log('Data: ', data)

  return data
})
