<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

type Route = Database['public']['Tables']['routes']['Row']

const headers = useRequestHeaders(['cookie'])

const { data, pending, refresh } = await useAsyncData<Route[]>('routes', async () => {
  return await $fetch<Route[]>('/api/routes', { headers })
}, {
  lazy: true,
  default: () => []
})

const columns: TableColumn<Route>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => row.index + 1
  },
  {
    accessorKey: 'origin',
    header: 'Asal / From',
    cell: ({ row }) => row.getValue('origin')
  },
  {
    accessorKey: 'destination',
    header: 'Tujuan / Destination',
    cell: ({ row }) => row.getValue('destination')
  },
  {
    accessorKey: 'created_at',
    header: 'Dibuat',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
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
