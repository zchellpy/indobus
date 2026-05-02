<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Period, Range } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

type BasePassenger = Database['public']['Tables']['booking_passengers']['Row']

interface BookingPassenger extends BasePassenger {
  bookings: {
    booking_date: string
    booking_code: string
    status: 'pending' | 'payout' | 'cancelled' | 'failed'
    bus_type: string
    origin: string
    destination: string
    departure_time: string
    profiles: {
      full_name: string
      phone_number: string | null
      avatar_url: string | null
      role: 'agent' | 'user'
    } | null
  } | null
}

const { data, status } = await useFetch<BookingPassenger[]>('/api/passengers', {
  query: {
    start: computed(() => props.range.start.toISOString()),
    end: computed(() => props.range.end.toISOString())
  },
  key: 'last-passengers',
  lazy: true,
  transform: (data: BookingPassenger[]) => data.slice(0, 5),
  watch: [() => props.range, () => props.period]
})

const columns: TableColumn<BookingPassenger>[] = [
  {
    accessorKey: 'passenger_code',
    header: 'Kode Penumpang'
  },
  {
    id: 'departure_time',
    header: 'Berangkat',
    cell: ({ row }) => {
      const departureTime = row.original.bookings?.departure_time || '-'
      return new Date(departureTime).toLocaleString('id-ID', {
        day: 'numeric',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
  {
    accessorKey: 'passenger_name',
    header: 'Nama'
  },
  {
    accessorKey: 'pick_up_point',
    header: 'PickUp'
  },
  {
    accessorKey: 'destination',
    header: 'Tujuan',
    cell: ({ row }) => {
      const destination = row.original.bookings?.destination || '-'
      return h('span', undefined, destination)
    }
  }
]
</script>

<template>
  <UCard class="shrink-0" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div class="flex justify-between">
        <p class="text-lg text-highlighted font-semibold">
          Last passengers
        </p>
        <UButton
          variant="subtle"
          color="primary"
          icon="i-lucide-arrow-right"
          to="/passengers"
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
