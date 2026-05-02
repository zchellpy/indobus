<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Period, Range } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

type BaseBooking = Database['public']['Tables']['bookings']['Row']

interface Booking extends BaseBooking {
  schedules: {
    total_seats: number
  } | null
}

const { data, status } = await useFetch<Booking[]>('/api/bookings', {
  query: {
    start: computed(() => props.range.start.toISOString()),
    end: computed(() => props.range.end.toISOString())
  },
  key: 'last-booking',
  lazy: true,
  transform: (data: Booking[]) => data.slice(0, 5),
  watch: [() => props.range, () => props.period]
})
// const sampleEmails = [
//   'james.anderson@example.com',
//   'mia.white@example.com',
//   'william.brown@example.com',
//   'emma.davis@example.com',
//   'ethan.harris@example.com'
// ]

// const { data } = await useAsyncData('sales', async () => {
//   const sales: Sale[] = []
//   const currentDate = new Date()

//   for (let i = 0; i < 5; i++) {
//     const hoursAgo = randomInt(0, 48)
//     const date = new Date(currentDate.getTime() - hoursAgo * 3600000)

//     sales.push({
//       id: (4600 - i).toString(),
//       date: date.toISOString(),
//       status: randomFrom(['paid', 'failed', 'refunded']),
//       email: randomFrom(sampleEmails),
//       amount: randomInt(100, 1000)
//     })
//   }

//   return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
// }, {
//   watch: [() => props.period, () => props.range],
//   default: () => []
// })

const columns: TableColumn<Booking>[] = [
  {
    accessorKey: 'booking_code',
    header: 'Kode Booking'
  },
  {
    accessorKey: 'booking_date',
    header: 'Tanggal',
    cell: ({ row }) => {
      return new Date(row.getValue('booking_date')).toLocaleString('id-ID', {
        day: 'numeric',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
  {
    accessorKey: 'passengers_amount',
    header: 'Penumpang'
  },
  {
    accessorKey: 'destination',
    header: 'Tujuan'
  }
]
</script>

<template>
  <UCard class="shrink-0" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div class="flex justify-between">
        <p class="text-lg text-highlighted font-semibold">
          Last bookings
        </p>
        <UButton
          variant="subtle"
          color="primary"
          icon="i-lucide-arrow-right"
          to="/bookings"
        />
      </div>
    </template>

    <UTable
      :data="data"
      :columns="columns"
      :loading="status === 'pending'"
      class="shrink-0"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'border-0',
        td: 'border-b border-default'
      }"
    />
  </UCard>
</template>
