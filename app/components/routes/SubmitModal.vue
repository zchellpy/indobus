<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  route?: { id: string, origin: string, destination: string } | null
  onSuccess: () => void
}>()

const toast = useToast()
const headers = useRequestHeaders(['cookie'])

// State
const open = ref(false)
const loading = ref(false)

const isUpdate = computed(() => !!props.route)

const schema = z.object({
  origin: z.string('Wajib diisi').min(4, 'Minimal 4 karakter'),
  destination: z.string('Wajib diisi').min(4, 'Minimal 4 karakter')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  origin: undefined,
  destination: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const method = isUpdate.value ? 'PATCH' : 'POST'
    const url = isUpdate.value ? `/api/routes?id=${props.route?.id}` : '/api/routes'

    await $fetch(url, {
      headers,
      method: method,
      body: {
        origin: event.data.origin,
        destination: event.data.destination
      }
    })

    await Promise.resolve(props.onSuccess()) // refresh tabel
    toast.add({ title: 'Success', description: isUpdate.value ? 'Route updated' : 'New route added', color: 'success' })

    // reset state
    state.origin = undefined
    state.destination = undefined
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
  state.origin = undefined
  state.destination = undefined
  await Promise.resolve(props.onSuccess())
}

watch(() => props.route, (newRoute) => {
  if (newRoute) {
    state.origin = newRoute.origin
    state.destination = newRoute.destination
    open.value = true
  } else {
    state.origin = undefined
    state.destination = undefined
  }
}, { immediate: true })
</script>

<template>
  <UModal
    v-model:open="open"
    :close="{ onClick: handleClose }"
    :title="`${isUpdate ? 'Update' : 'New'} Route`"
    description="Manage your routes information in the database"
  >
    <UButton icon="i-lucide-plus" class="rounded-full" />

    <template #body>
      <UForm
        :schema="schema"
        :loading="loading"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Asal / Origin" placeholder="Makassar" name="origin">
          <UInput v-model="state.origin" class="w-full" />
        </UFormField>
        <UFormField label="Tujuan / Destination" placeholder="Mangkutana" name="destination">
          <UInput v-model="state.destination" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="handleClose"
          />
          <UButton
            label="Save"
            color="primary"
            variant="solid"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
