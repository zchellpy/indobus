<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type BaseSchedule = Database['public']['Tables']['schedules']['Row']

interface Schedule extends BaseSchedule {
  routes: {
    origin: string
    destination: string
  } | null
  passengers_amount: number | null
}

const headers = useRequestHeaders(['cookie'])

const { data, pending, refresh } = await useAsyncData<Schedule[]>('schedules', async () => {
  return await $fetch<Schedule[]>('/api/schedules', { headers })
}, {
  lazy: true,
  default: () => []
})

const columns: TableColumn<Schedule>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => row.index + 1
  },
  {
    accessorKey: 'departure_time',
    header: 'Jadwal Berangkat',
    cell: ({ row }) => {
      const date = new Date(row.getValue('departure_time'))
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      })
    }
  },
  {
    id: 'origin',
    header: 'Asal / From',
    cell: ({ row }) => row.original.routes?.origin || '-'
  },
  {
    id: 'destination',
    header: 'Tujuan / Destination',
    cell: ({ row }) => row.original.routes?.destination || '-'
  },
  {
    accessorKey: 'bus_type',
    header: 'Jenis Bus',
    cell: ({ row }) => row.getValue('bus_type')
  },
  {
    accessorKey: 'total_seats',
    header: 'Jml Kursi',
    cell: ({ row }) => row.getValue('total_seats')
  },
  {
    id: 'passenger_amount',
    header: 'Jml Penumpang',
    cell: ({ row }) => row.original?.passengers_amount || 0
  },
  {
    accessorKey: 'price_per_seat',
    header: () => h('div', { class: 'text-right' }, 'Harga Tiket'),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('price_per_seat'))

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
    accessorKey: 'created_at',
    header: 'Dibuat',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      })
    }
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
