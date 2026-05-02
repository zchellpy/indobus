<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type BaseBooking = Database['public']['Tables']['bookings']['Row']

interface Booking extends BaseBooking {
  schedules: {
    total_seats: number
  } | null
}

const headers = useRequestHeaders(['cookie'])

const { data, pending, refresh } = await useAsyncData<Booking[]>('bookings', async () => {
  return await $fetch<Booking[]>('/api/bookings', { headers })
}, {
  lazy: true,
  default: () => []
})

const columns: TableColumn<Booking>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => row.index + 1
  },
  {
    accessorKey: 'booking_code',
    header: 'Kode Booking'
  },
  {
    id: 'origin_destination',
    header: 'Tujuan',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('span', { class: 'font-bold' }, row.original.origin || '-'),
      h('span', { class: 'text-primary' }, '→'),
      h('span', { class: 'font-bold' }, row.original.destination || '-')
    ])
  },
  {
    accessorKey: 'departure_time',
    header: 'Keberangkatan',
    cell: ({ row }) => {
      const date = new Date(row.getValue('departure_time'))
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      })
    }
  },
  {
    id: 'bus_info',
    header: 'Tipe Bus',
    cell: ({ row }) => {
      const type = row.original.bus_type ?? '-'
      const seats = row.original.schedules?.total_seats ?? 0

      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, type),
        h('span', { class: 'text-xs text-zinc-500' }, `(${seats} kursi)`)
      ])
    }
  },
  {
    accessorKey: 'passengers_amount',
    header: 'Penumpang',
    cell: ({ row }) => `${row.original.passengers_amount} Org`
  },
  {
    accessorKey: 'total_price',
    header: () => h('div', { class: 'text-right' }, 'Total Bayar'),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('total_price'))

      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)

      return h('div', { class: 'text-right font-medium' }, formatted)
    }
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]
</script>

<template>
  <UTable
    :data="data"
    :columns="columns"
    :loading="pending"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }"
  >
    <template #loading-state>
      <div class="flex items-center justify-center h-32">
        <UIcon name="i-lucide-loader-2" class="animate-spin size-6 text-primary" />
      </div>
    </template>

    <template #empty-state>
      <div class="flex flex-col items-center justify-center py-10 gap-2">
        <p class="text-sm text-zinc-500">
          Belum ada data rute.
        </p>
        <UButton
          label="Refresh"
          variant="subtle"
          size="xs"
          icon="i-lucide-refresh-cw"
          @click="refresh()"
        />
      </div>
    </template>
  </UTable>
</template>
