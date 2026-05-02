<script setup lang="ts">
import { Time } from '@internationalized/date'

const emit = defineEmits<{
  (e: 'select', value: Time): void
}>()

// Buat daftar jam (00:00 - 23:30)
const timeItems = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0')
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour} : ${minute}`
})

function pickTime(timeString: string) {
  const [h, m] = timeString.split(':').map(Number)
  emit('select', new Time(h, m, 0))
}
</script>

<template>
  <div class="p-2 max-h-48 overflow-y-auto w-32 rounded-md shadow-sm">
    <div v-for="t in timeItems" :key="t">
      <UButton
        :label="t"
        variant="ghost"
        color="neutral"
        block
        size="xl"
        class="justify-start font-mono"
        @click="pickTime(t)"
      />
    </div>
  </div>
</template>
