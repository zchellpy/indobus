<script setup lang="ts">
defineProps<{
  collapsed: boolean | undefined
}>()
</script>

<template>
  <UIcon name="i-lucide-bus" class="text-primary size-7" />
  <div class="bg-linear-to-tr from-orange-300 via-orange-500 to-orange-600 bg-clip-text text-transparent" :class="{ hidden: collapsed }">
    <span class="font-semibold text-xl subpixel-antialiased ">{{ !collapsed ? 'Indo' : 'I' }}</span>
    <span class="text-xl font-extrabold uppercase antialiased ">BUS</span>
  </div>
</template>
