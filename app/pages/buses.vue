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

type Bus = Database['public']['Tables']['buses']['Row']

const selectedBus = ref<Bus | null>(null)

const { data, status, refresh } = await useFetch<Bus[]>('/api/buses', {
  key: 'table-buses',
  headers: useRequestHeaders(['cookie']),
  lazy: true
})

function getRowItems(row: Row<Bus>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy bus',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Buses ID copied to clipboard'
        })
      }
    },
    {
      label: 'Edit bus',
      icon: 'i-lucide-pencil',
      onSelect() {
        // selectedBus.value = { ...row.original }
        toast.add({
          title: 'Warning',
          description: 'Fitur edit data tidak diijinkan'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete bus',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        table?.value?.tableApi?.resetRowSelection()
        row.toggleSelected(true)
      }
    }
  ]
}

const columns: TableColumn<Bus>[] = [
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
    id: 'name',
    header: 'Nama Bus',
    cell: ({ row }) => row.original.name
  },
  {
    id: 'type',
    header: 'Jenis Bus',
    cell: ({ row }) => row.original.type
  },
  {
    id: 'capacity',
    header: 'Kapasitas',
    cell: ({ row }) => row.original.capacity
  },
  {
    id: 'plate_number',
    header: 'Nomor Plat',
    cell: ({ row }) => row.original.plate_number
  },
  {
    id: 'created',
    header: 'Dibuat',
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
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
  selectedBus.value = null
}

const handleSuccessDelete = async () => {
  await refresh()
  table?.value?.tableApi?.resetRowSelection()
}
</script>

<template>
  <UDashboardPanel id="buses">
    <template #header>
      <UDashboardNavbar title="Daftar Bus" :ui="{ right: 'gap-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="primary" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
          <BusesSubmitModal :bus="selectedBus" :on-success="handleSuccessSubmit" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-end gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <BusesDeleteModal
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
          </BusesDeleteModal>

          <UDropdownMenu
            :items="table?.tableApi
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
