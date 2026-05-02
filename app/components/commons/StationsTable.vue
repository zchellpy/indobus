<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

type BaseStation = Database['public']['Tables']['stations']['Row']

interface Station extends BaseStation {
  routes: {
    origin: string
    destination: string
  } | null
}

const headers = useRequestHeaders(['cookie'])

const { data, pending, refresh } = await useAsyncData<Station[]>('stations', async () => {
  return await $fetch<Station[]>('/api/stations', { headers })
}, {
  lazy: true,
  default: () => []
})

const columns: TableColumn<Station>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => row.index + 1
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
    accessorKey: 'station_name',
    header: 'Nama Stasiun',
    cell: ({ row }) => row.getValue('station_name')
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
