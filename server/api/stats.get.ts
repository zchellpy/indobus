// server/api/stats.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { start, end } = getQuery(event)

  // const { data, count, error } = await client
  //   .from('schedules')
  //   .select('*', { count: 'exact' })
  //   .gte('created_at', start as string)
  //   .lte('created_at', end as string)
  //   // .eq('status', 'confirmed') // Sesuaikan status jika perlu

  // if (error) {
  //   throw createError({ statusCode: 500, statusMessage: error.message })
  // }

  // console.log('Result start:', start as string)
  // console.log('Result end:', end as string)
  // console.log('Result Count:', count)
  // console.log('Result Data Length:', data?.length)

  // return [count, 0, 0, 0]

  // Menjalankan kueri secara paralel untuk efisiensi
  const [schedules, bookings, passengers, customers] = await Promise.all([
    // Hitung total baris di tabel schedules
    client.from('schedules').select('*', { count: 'exact', head: true })
      .gte('created_at', start as string).lte('created_at', end as string),

    // Hitung total baris di tabel bookings
    client.from('bookings').select('*', { count: 'exact', head: true })
      .gte('created_at', start as string).lte('created_at', end as string),

    // Hitung total baris di tabel booking_passengers
    client.from('booking_passengers').select('*', { count: 'exact', head: true })
      .gte('created_at', start as string).lte('created_at', end as string),

    // Hitung total baris di tabel profiles (Customers)
    client.from('profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'user') // Menghitung hanya user, bukan admin
      .gte('created_at', start as string).lte('created_at', end as string)
  ])

  // if (schedules.error) console.error('Error Schedules:', schedules.error.message)
  console.log('CS: ', passengers.count)
  console.log('start: ', start)
  console.log('end ', end)

  return [
    schedules.count,
    bookings.count,
    passengers.count,
    customers.count
  ]
})
