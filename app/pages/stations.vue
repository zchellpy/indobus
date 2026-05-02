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

const columnVisibility = ref()
const rowSelection = ref({})

type BaseStation = Database['public']['Tables']['stations']['Row']

interface Station extends BaseStation {
  routes: {
    origin: string
    destination: string
  } | null
}

const selectedStation = ref<BaseStation | null>(null)

const { data, status, refresh } = await useFetch<Station[]>('/api/stations', {
  key: 'table-stations',
  headers: useRequestHeaders(['cookie']),
  lazy: true
})

function getRowItems(row: Row<Station>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy station ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Station ID copied to clipboard'
        })
      }
    },
    {
      label: 'Edit station',
      icon: 'i-lucide-pencil',
      onSelect() {
        const { routes, ...stationData } = row.original
        selectedStation.value = stationData
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete station',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        table?.value?.tableApi?.resetRowSelection()
        row.toggleSelected(true)
      }
    }
  ]
}

const columns: TableColumn<Station>[] = [
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
    cell: ({ row }) => row.original.routes?.origin || '-'
  },
  {
    id: 'destination',
    header: 'Tujuan',
    cell: ({ row }) => row.original.routes?.destination || '-'
  },
  {
    id: 'station',
    header: 'Nama Stasiun',
    cell: ({ row }) => row.original.station_name
  },
  {
    id: 'address',
    header: 'Alamat',
    cell: ({ row }) => row.original.address
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

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const handleSuccessSubmit = async () => {
  await refresh()
  selectedStation.value = null
}

const handleSuccessDelete = async () => {
  await refresh()
  table?.value?.tableApi?.resetRowSelection()
}
</script>

<template>
  <UDashboardPanel id="stations">
    <template #header>
      <UDashboardNavbar title="Daftar Stasiun" :ui="{ right: 'gap-4' }">
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
          <StationsSubmitModal :station="selectedStation" :on-success="handleSuccessSubmit" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-end gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <StationsDeleteModal
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
          </StationsDeleteModal>

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
