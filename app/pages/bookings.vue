<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
// import type { User } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'booking_code',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

type BaseBooking = Database['public']['Tables']['bookings']['Row']

interface Booking extends BaseBooking {
  schedules: {
    total_seats: number
  } | null
}

const { data, status } = await useFetch<Booking[]>('/api/bookings', {
  key: 'table-bookings',
  headers: useRequestHeaders(['cookie']),
  lazy: true
})

function getRowItems(row: Row<Booking>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy booking ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Booking ID copied to clipboard'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'View booking details',
      icon: 'i-lucide-list'
    },
    {
      label: 'View booking payments',
      icon: 'i-lucide-wallet'
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete booking',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toast.add({
          title: 'Booking deleted',
          description: 'The booking has been deleted.'
        })
      }
    }
  ]
}

const columns: TableColumn<Booking>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    id: 'id',
    header: 'ID',
    cell: ({ row }) => row.index + 1
  },
  {
    accessorKey: 'booking_code',
    header: 'Kode Booking'
  },
  {
    id: 'destination',
    header: 'Tujuan',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('span', { class: 'font-bold' }, row.original.origin || '-'),
      h('span', { class: 'text-primary' }, '→'),
      h('span', { class: 'font-bold' }, row.original.destination || '-')
    ])
  },
  {
    id: 'departure',
    header: 'Keberangkatan',
    cell: ({ row }) => {
      const rawDate = row.original.departure_time
      if (!rawDate) return h('span', { class: 'text-dimmed' }, '-')

      const date = new Date(rawDate)
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
    id: 'tipe',
    header: 'Tipe',
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
    id: 'passengers',
    header: 'Penumpang',
    cell: ({ row }) => `${row.original.passengers_amount} Org`
  },
  {
    id: 'total_amount',
    header: () => h('div', { class: 'text-right' }, 'Total Bayar'),
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(row.original.total_price)

      return h('div', { class: 'text-right font-medium' }, formatted)
    }
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: row => row.status,
    filterFn: 'equals',
    cell: ({ row }) => {
      const status = row.original.status
      if (!status) return '-'

      const colorMap = {
        pending: 'warning',
        payout: 'success',
        cancelled: 'error',
        failed: 'error'
      } as const

      return h(UBadge, {
        class: 'capitalize',
        variant: 'subtle',
        color: colorMap[status] || 'neutral'
      }, () => status)
    }
  },
  {
    id: 'created_at',
    header: 'Dibuat',
    cell: ({ row }) => {
      const rawDate = row.original.created_at
      if (!rawDate) return h('span', { class: 'text-dimmed' }, '-')

      const date = new Date(rawDate)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      })
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const statusColumn = table.value.tableApi.getColumn('status')
  if (!statusColumn) return

  if (newVal === 'all') {
    statusColumn.setFilterValue(undefined)
  } else {
    statusColumn.setFilterValue(newVal)
  }
})

const bookingCode = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('booking_code')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn('booking_code')?.setFilterValue(value || undefined)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="bookings">
    <template #header>
      <UDashboardNavbar title="Daftar Pemesanan" :ui="{ right: 'gap-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip
            text="Notifications"
            :shortcuts="['N']"
          >
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip
                color="primary"
                inset
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </UChip>
            </UButton>
          </UTooltip>
          <BookingsAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="bookingCode"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Ketik kode booking..."
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <BookingsDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Delete"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </BookingsDeleteModal>

          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Payout', value: 'payout' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Failed', value: 'failed' }
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status"
            class="min-w-28"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />

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
    </template>
  </UDashboardPanel>
</template>
