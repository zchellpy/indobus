<script setup lang="ts">
import type { Period, Range, Stat } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

const baseStats = [
  { title: 'Schedules', icon: 'i-lucide-clock', to: '/schedules' },
  { title: 'Bookings', icon: 'i-lucide-receipt-text', to: '/bookings' },
  { title: 'Passengers', icon: 'i-lucide-users', to: '/passengers' },
  { title: 'Customers', icon: 'i-lucide-user', to: '/customers' }
]

const { data: stats, status } = useFetch('/api/stats', {
  query: {
    start: computed(() => props.range.start.toISOString()),
    end: computed(() => props.range.end.toISOString())
  },
  key: 'data-stats',
  lazy: true,
  watch: [() => props.range, () => props.period],
  transform: (values: number[]): Stat[] => {
    return baseStats.map((stat, index) => ({
      ...stat,
      value: values?.[index] || 0
    }))
  },
  default: () => baseStats.map(s => ({ ...s, value: 0 })) as Stat[]
})

/* const { data: stats, pending } = await useAsyncData<Stat[]>('data-stats', async () => {
  const data = await $fetch<number[]>('/api/stats', {
    query: {
      start: props.range.start.toISOString(),
      end: props.range.end.toISOString()
    }
  })

  return baseStats.map((stat, index) => ({
    ...stat,
    value: data?.[index] ?? 0
  }))
}, {
  lazy: true,
  watch: [() => props.period, () => props.range],
  default: () => baseStats.map(s => ({ ...s, value: 0 })) as Stat[]
}) */
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      :to="stat.to"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <USkeleton v-if="status === 'pending'" class="h-8 w-20" />
        <!-- <USkeleton v-if="pending" class="h-8 w-20" /> -->
        <span v-else class="text-2xl font-semibold text-highlighted">
          {{ stat.value.toLocaleString('id-ID') }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
