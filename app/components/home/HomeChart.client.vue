<script setup lang="ts">
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format, isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'
import type { Period, Range } from '~/types'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')
const { width } = useElementSize(cardRef)

const props = defineProps<{
  period: Period
  range: Range
}>()

type DataRecord = {
  date: Date
  amount: number
}

const { data: bookings, status, refresh } = await useFetch('/api/revenue', {
  query: {
    start: computed(() => props.range.start.toISOString()),
    end: computed(() => props.range.end.toISOString())
  },
  key: 'data-revenue',
  lazy: true,
  watch: [() => props.range, () => props.period]
})

// const data = ref<DataRecord[]>([])

// Computed untuk memproses data dari API ke format Chart
const chartData = computed<DataRecord[]>(() => {
  if (!bookings.value) return []

  // Generate deret tanggal berdasarkan interval
  const intervalDates = ({
    daily: eachDayOfInterval,
    weekly: eachWeekOfInterval,
    monthly: eachMonthOfInterval
  } as Record<Period, typeof eachDayOfInterval>)[props.period](props.range)

  return intervalDates.map((intervalDate) => {
    const totalInInterval = bookings.value!
      .filter((b) => {
        const bDate = new Date(b.created_at)
        if (props.period === 'daily') return isSameDay(bDate, intervalDate)
        if (props.period === 'weekly') return isSameWeek(bDate, intervalDate)
        if (props.period === 'monthly') return isSameMonth(bDate, intervalDate)
        return false
      })
      .reduce((sum, b) => sum + Number(b.total_price), 0)

    return {
      date: intervalDate,
      amount: totalInInterval
    }
  })
})

const x = (_: DataRecord, i: number) => i
const y = (d: DataRecord) => d.amount

const total = computed(() => chartData.value.reduce((acc: number, { amount }) => acc + amount, 0))

const formatNumber = new Intl.NumberFormat('id', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format

const formatDate = (date: Date): string => {
  return ({
    daily: format(date, 'd MMM'),
    weekly: format(date, 'd MMM'),
    monthly: format(date, 'MMM yyy')
  })[props.period]
}

const xTicks = (i: number) => {
  if (i === 0 || i === chartData.value.length - 1 || !chartData.value[i]) {
    return ''
  }

  return formatDate(chartData.value[i].date)
}

const template = (d: DataRecord) => `${formatDate(d.date)}: ${formatNumber(d.amount)}`

/* watch([() => props.period, () => props.range], () => {
  const dates = ({
    daily: eachDayOfInterval,
    weekly: eachWeekOfInterval,
    monthly: eachMonthOfInterval
  } as Record<Period, typeof eachDayOfInterval>)[props.period](props.range)

  const min = 1000
  const max = 10000

  data.value = dates.map(date => ({ date, amount: Math.floor(Math.random() * (max - min + 1)) + min }))
}, { immediate: true }) */
</script>

<template>
  <UCard ref="cardRef" :ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">
            Revenue
          </p>
          <p class="text-3xl text-highlighted font-semibold">
            {{ formatNumber(total) }}
          </p>
        </div>
        <UButton
          variant="subtle"
          color="primary"
          icon="i-lucide-rotate-cw"
          :disabled="status == 'pending'"
          @click="refresh()"
        />
      </div>
    </template>

    <VisXYContainer
      :data="chartData"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <VisLine
        :x="x"
        :y="y"
        color="var(--ui-primary)"
      />
      <VisArea
        :x="x"
        :y="y"
        color="var(--ui-primary)"
        :opacity="0.1"
      />

      <VisAxis
        type="x"
        :x="x"
        :tick-format="xTicks"
      />

      <VisCrosshair
        color="var(--ui-primary)"
        :template="template"
      />

      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
