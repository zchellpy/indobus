<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
// import type { User } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'destination',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

type BaseSchedule = Database['public']['Tables']['schedules']['Row']

interface Schedule extends BaseSchedule {
  routes: {
    origin: string
    destination: string
  } | null
  passengers_amount: number | null
}

const selectedSchedule = ref<BaseSchedule | null>(null)

const { data, status, refresh } = await useFetch<Schedule[]>('/api/schedules', {
  key: 'table-schedules',
  headers: useRequestHeaders(['cookie']),
  lazy: true
})

function getRowItems(row: Row<Schedule>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy schedule ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Schedule ID copied to clipboard'
        })
      }
    },
    {
      label: 'Edit schedule',
      icon: 'i-lucide-pencil',
      onSelect() {
        const { routes, ...stationData } = row.original
        selectedSchedule.value = stationData
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete schedule',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        table?.value?.tableApi?.resetRowSelection()
        row.toggleSelected(true)
      }
    }
  ]
}

const columns: TableColumn<Schedule>[] = [
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
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.index + 1
  },
  {
    id: 'origin',
    header: 'Asal',
    cell: ({ row }) => {
      return h('span', { class: 'text-md text-highlighted' }, row.original.routes?.origin)
    }
  },
  {
    id: 'destination',
    header: 'Tujuan',
    accessorFn: row => row.routes?.destination,
    cell: ({ row }) => {
      return h('span', { class: 'text-md text-highlighted' }, row.original.routes?.destination)
    }
  },
  {
    id: 'departure_time',
    header: 'Berangkat',
    cell: ({ row }) => {
      const rawDate = row.original.departure_time
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
    id: 'type',
    header: 'Jenis Bus',
    cell: ({ row }) => {
      // return h('span', { class: 'text-highlighted' }, row.original.bus_type)
      return h('div', { class: 'flex flex-col' }, [
      // Baris Atas: Jam (Lebih menonjol karena krusial bagi penumpang)
        h('span', { class: 'text-highlighted' }, row.original.bus_type),
        h('span', { class: 'text-sm text-dimmed' }, row.original.total_seats)
      ])
    }
  },
  {
    id: 'passenger',
    header: () => h('div', { class: 'text-right' }, 'Penumpang'),
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex justify-center' }, h(UButton, {
          label: `${row.original.passengers_amount || 0}`,
          class: 'rounded-full size-8 items-center justify-center p-0',
          color: 'primary',
          variant: 'subtle'
        })
      )
    }
  },
  {
    id: 'price',
    header: () => h('div', { class: 'text-right' }, 'Harga Tiket'),
    cell: ({ row }) => {
      const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(row.original.price_per_seat)

      return h('div', { class: 'text-right text-highlighted' }, formattedPrice)
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

const destination = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('destination')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn('destination')?.setFilterValue(value || undefined)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const handleSuccessSubmit = async () => {
  await refresh()
  selectedSchedule.value = null
}

const handleSuccessDelete = async () => {
  await refresh()
  table?.value?.tableApi?.resetRowSelection()
}
</script>

<template>
  <UDashboardPanel id="schedules">
    <template #header>
      <UDashboardNavbar title="Daftar Jadwal" :ui="{ right: 'gap-4' }">
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
          <SchedulesSubmitModal :schedule="selectedSchedule" :on-success="handleSuccessSubmit" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="destination"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Ketik tujuan..."
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <SchedulesDeleteModal
            :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
            :selected-ids="table?.tableApi?.getFilteredSelectedRowModel().rows.map(row => row.original.id)"
            :on-success="handleSuccessDelete"
          >
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
          </SchedulesDeleteModal>

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
