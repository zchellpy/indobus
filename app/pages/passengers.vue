<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
// import type { User } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()
const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'booking_passanger',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

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
  key: 'table-passengers',
  headers: useRequestHeaders(['cookie']),
  lazy: true
})

function getRowItems(row: Row<BookingPassenger>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy passenger ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Passenger ID copied to clipboard'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'View customer details',
      icon: 'i-lucide-list'
    },
    {
      label: 'View customer payments',
      icon: 'i-lucide-wallet'
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete customer',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toast.add({
          title: 'Customer deleted',
          description: 'The customer has been deleted.'
        })
      }
    }
  ]
}

const columns: TableColumn<BookingPassenger>[] = [
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
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.index + 1
  },
  {
    id: 'booking_info',
    header: 'Pemesan',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          src: row.original.bookings?.profiles?.avatar_url || undefined,
          alt: row.original.bookings?.profiles?.full_name,
          size: 'md',
          chipColor: row.original.bookings?.profiles?.role === 'agent' ? 'primary' : undefined
        }),
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'text-md' }, row.original.bookings?.profiles?.full_name),
          h('span', { class: 'text-sm text-dimmed' }, row.original.bookings?.profiles?.phone_number || '-')
        ])
      ])
    }
  },
  {
    id: 'booking_detail',
    header: 'Kode',
    accessorFn: row => row.passenger_code,
    cell: ({ row }) => {
      const rawDate = row.original.bookings?.booking_date
      if (!rawDate) return h('span', { class: 'text-dimmed' }, '-')

      const date = new Date(rawDate)
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      })

      // 2. Render dengan fungsi h()
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-md text-highlighted' }, row.original.passenger_code || '-'),
        h('span', { class: 'text-sm text-dimmed' }, formattedDate)
      ])
    }
  },
  {
    id: 'booking_passanger',
    header: 'Penumpang',
    accessorFn: row => row.passenger_name,
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'text-md text-highlighted uppercase' }, row.original.passenger_name),
          h('span', { class: 'text-sm text-dimmed' }, `${row.original.gender} - K${row.original.seat_number}`)
        ])
      ])
    }
  },
  {
    id: 'bus',
    header: 'Bus',
    cell: ({ row }) => {
      const busType = row.original.bookings?.bus_type || '-'
      const origin = row.original.bookings?.origin || '-'
      const destination = row.original.bookings?.destination || '-'

      return h('div', { class: 'flex flex-col gap-0.5' }, [
        h('span', { class: 'text-md text-highlighted' }, busType),
        h('div', { class: 'flex items-center gap-1.5 text-sm text-dimmed' }, [
          h('span', undefined, origin),
          h('span', { class: 'text-primary' }, '→'),
          h('span', undefined, destination)
        ])
      ])
    }
  },
  {
    accessorKey: 'pick_up_point',
    header: 'PickUp',
    cell: ({ row }) => {
      const pickUpPoint = row.original.pick_up_point || '-'
      const words = pickUpPoint.split(' ')

      if (words.length > 1) {
        const firstWord = words[0]
        const remainingWords = words.slice(1).join(' ')

        return h('div', { class: 'flex flex-col text-sm' }, [
          h('span', undefined, firstWord),
          h('span', undefined, remainingWords)
        ])
      }

      // Jika hanya 1 kata, tampilkan standar
      return h('span', { class: 'text-sm' }, pickUpPoint)
    }
  },
  {
    id: 'departure_time',
    header: 'Berangkat',
    cell: ({ row }) => {
      const rawDate = row.original.bookings?.departure_time
      if (!rawDate) return h('span', { class: 'text-dimmed' }, '-')

      const date = new Date(rawDate)

      // Format Jam (Misal: 14:30)
      const timeStr = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\./g, ':')

      // Format Tanggal (Misal: 25 Jan 2026)
      const dateStr = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })

      const isToday = new Date().toDateString() === date.toDateString()

      return h('div', { class: 'flex flex-col' }, [
      // Baris Atas: Jam (Lebih menonjol karena krusial bagi penumpang)
        h('span', { class: 'text-md text-highlighted' }, timeStr),

        // Baris Bawah: Tanggal (Lebih kecil dan redup)
        h('span', {
          class: [
            'text-xs uppercase tracking-wider',
            isToday ? 'text-primary font-medium' : 'text-dimmed'
          ]
        }, isToday ? 'Hari Ini' : dateStr)
      ])
    }
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: row => row.bookings?.status,
    filterFn: 'equals',
    cell: ({ row }) => {
      const status = row.original.bookings?.status
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
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      })

      return h('span', { class: 'text-xs' }, formattedDate)
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

// watch(() => statusFilter.value, (newVal) => {
//   if (!table.value?.tableApi) return

//   const statusColumn = table.value.tableApi.getColumn('status')
//   if (statusColumn) {
//     // PENTING: Tanstack Table butuh 'undefined' untuk mereset filter
//     const filterValue = newVal === 'all' ? undefined : newVal
//     statusColumn.setFilterValue(filterValue)

//     // console.log('Filtering status by:', filterValue) // Cek di console log browser
//   }
// })

const bookingPassanger = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('booking_passanger')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn('booking_passanger')?.setFilterValue(value || undefined)
  }
})

const bookingDetail = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('booking_detail')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn('booking_detail')?.setFilterValue(value || undefined)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="passengers">
    <template #header>
      <UDashboardNavbar title="Daftar Penumpang" :ui="{ right: 'gap-4' }">
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
          <PassengersAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <UInput
            v-model="bookingDetail"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Kode booking..."
          />
          <UInput
            v-model="bookingPassanger"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Nama penumpang..."
          />
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <PassengersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
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
          </PassengersDeleteModal>

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
                // .map((column: any) => ({
                //   label: upperFirst(column.id),
                //   type: 'checkbox' as const,
                //   checked: column.getIsVisible(),
                //   onUpdateChecked(checked: boolean) {
                //     table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                //   },
                //   onSelect(e?: Event) {
                //     e?.preventDefault()
                //   }
                // }))
                .map((column: any) => {
                  const header = column.columnDef.header
                  const label = typeof header === 'string'
                    ? header
                    : upperFirst(column.id).replace(/_/g, ' ')

                  return {
                    label: label,
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    }
                  }
                })
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
        sticky
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
