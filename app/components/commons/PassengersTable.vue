<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
// import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
// import type { Row } from '@tanstack/table-core'

type BasePassenger = Database['public']['Tables']['booking_passengers']['Row']

interface BookingPassenger extends BasePassenger {
  bookings: {
    booking_date: string
    booking_code: string
    status: string
    bus_type: string
    origin: string
    destination: string
    departure_time: string
    profiles: {
      full_name: string
      phone_number: string | null
      avatar_url: string | null
      role: 'agent' | 'user' | 'operator'
    } | null
  } | null
}

const table = useTemplateRef('table')
// const UAvatar = resolveComponent('UAvatar')
const headers = useRequestHeaders(['cookie'])

const { data, pending, refresh } = await useAsyncData<BookingPassenger[]>('passengers', async () => {
  return await $fetch<BookingPassenger[]>('/api/passengers', { headers })
}, {
  lazy: true,
  default: () => []
})

const columns: TableColumn<BookingPassenger>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => row.index + 1
  },
  {
    accessorKey: 'passenger_code',
    header: 'Kode Booking'
  },
  {
    accessorKey: 'booking_date',
    header: 'Tgl Booking',
    cell: ({ row }) => {
      const date = new Date(row.original.bookings?.booking_date || '')
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
    id: 'booking_info',
    header: 'Pemesan',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        // h(UAvatar, {
        //   src: row.original.bookings?.profiles?.avatar_url || undefined,
        //   alt: row.original.bookings?.profiles?.full_name,
        //   size: 'sm', // lg mungkin terlalu besar untuk baris tabel
        //   chipColor: row.original.bookings?.profiles?.role === 'agent' ? 'primary' : undefined
        // }),
        h('div', { class: 'flex flex-col' }, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.bookings?.profiles?.full_name),
          h('p', { class: 'text-xs text-dimmed' }, row.original.bookings?.profiles?.phone_number || '-')
        ])
      ])
    }
  },
  {
    accessorKey: 'passenger_name',
    header: 'Penumpang',
    cell: ({ row }) => h('div', { class: 'uppercase' }, row.getValue('passenger_name'))
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => h('div', { class: 'text-center' }, row.getValue('gender'))
  },
  {
    id: 'bus_type',
    header: 'Tipe Bus',
    cell: ({ row }) => row.original.bookings?.bus_type || '-'
  },
  {
    id: 'origin_destination',
    header: 'Tujuan',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('span', { class: 'font-bold' }, row.original.bookings?.origin || '-'),
      h('span', { class: 'text-primary' }, '→'),
      h('span', { class: 'font-bold' }, row.original.bookings?.destination || '-')
    ])
  },
  {
    accessorKey: 'departure_time',
    header: 'Berangkat',
    cell: ({ row }) => {
      const date = new Date(row.original.bookings?.departure_time || '')
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
    accessorKey: 'booking_status',
    header: 'Status',
    cell: ({ row }) => row.original.bookings?.status || '-'
  },
  {
    accessorKey: 'created_at',
    header: 'Dibuat pada',
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

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-1.5">
    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="data"
      :columns="columns"
      :loading="pending"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      class="shrink-0"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0'
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
    <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
      <div class="text-sm text-muted">
        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
      </div>

      <div class="flex items-center gap-1.5">
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>
  </div>
</template>
