<script setup lang="ts">
const props = withDefaults(defineProps<{
  count?: number
  selectedIds?: string[] // Tambahkan props untuk menampung ID yang dipilih
  onSuccess: () => void
}>(), {
  count: 0,
  selectedIds: () => []
})

const toast = useToast()
const headers = useRequestHeaders(['cookie'])

// State
const open = ref(false)
const loading = ref(false)

async function onDelete() {
  loading.value = true
  try {
    await $fetch('/api/stations', {
      headers,
      method: 'DELETE',
      query: { ids: props.selectedIds.join(',') }
    })

    toast.add({ title: 'Success', description: `${props.count} stasiun berhasil dihapus`, color: 'success' })
    await Promise.resolve(props.onSuccess())
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui'
    toast.add({ title: 'Failed', description: errorMessage, color: 'error' })
  } finally {
    loading.value = false
    open.value = false
  }
}

async function handleClose() {
  open.value = false
  await Promise.resolve(props.onSuccess())
}
</script>

<template>
  <UModal
    v-model:open="open"
    :close="{ onClick: handleClose }"
    :title="`Delete ${count} station${count > 1 ? 's' : ''}`"
    :description="`Are you sure, this action cannot be undone.`"
  >
    <slot />

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          @click="handleClose"
        />
        <UButton
          label="Delete"
          color="error"
          variant="solid"
          loading-auto
          @click="onDelete"
        />
      </div>
    </template>
  </UModal>
</template>
