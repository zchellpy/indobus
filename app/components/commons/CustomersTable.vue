<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

type Customer = Database['public']['Tables']['profiles']['Row']

const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')
const headers = useRequestHeaders(['cookie'])

const { data, pending, refresh } = await useAsyncData<Customer[]>('customers', async () => {
  return await $fetch<Customer[]>('/api/customers', { headers })
}, {
  lazy: true,
  default: () => []
})

const columns: TableColumn<Customer>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => row.index + 1
  },
  {
    id: 'customer_info',
    header: 'Nama',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          src: row.original.avatar_url || undefined,
          alt: row.original.full_name,
          size: 'sm', // lg mungkin terlalu besar untuk baris tabel
          chipColor: row.original.role === 'agent' ? 'primary' : undefined
        }),
        h('div', { class: 'flex flex-col' }, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.full_name),
          h('p', { class: 'text-xs text-dimmed' }, row.original.phone_number || '-')
        ])
      ])
    }
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'address',
    header: 'Alamat'
  },
  {
    accessorKey: 'role',
    header: 'Tipe',
    cell: ({ row }) => {
      const role = row.original.role
      return h(UBadge, {
        label: role,
        variant: 'subtle',
        color: role === 'agent' ? 'primary' : 'secondary',
        size: 'md',
        class: 'capitalize'
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
