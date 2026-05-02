<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Props
const props = defineProps<{
  bus?: {
    id: string
    name: string
    type: string
    capacity: number
    plate_number: string
  } | null
  onSuccess: () => void
}>()

const types = ref(['executive', 'sleeper'])

const toast = useToast()
const headers = useRequestHeaders(['cookie'])

// State
const open = ref(false)
const loading = ref(false)

const isUpdate = computed(() => !!props.bus)

const schema = z.object({
  name: z.string('Nama bus wajib diisi').min(4, 'Minimal 4 karakter'),
  type: z.string('Jenis bus Wajib dipilih'),
  capacity: z.coerce.number('Jumlah kapasitas penumpang wajib diisi').min(50, 'Minimal 50 orang'),
  plate_number: z.string('Nomor plat kendaraan wajib diisi').min(8, 'Minimal 8 karakter')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  type: undefined,
  capacity: undefined,
  plate_number: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const method = isUpdate.value ? 'PATCH' : 'POST'
    const url = isUpdate.value ? `/api/buses?id=${props.bus?.id}` : '/api/buses'

    await $fetch(url, {
      headers,
      method: method,
      body: {
        name: event.data.name,
        type: event.data.type,
        capacity: event.data.capacity,
        plate_number: event.data.plate_number
      }
    })

    await Promise.resolve(props.onSuccess()) // refresh tabel
    toast.add({ title: 'Success', description: isUpdate.value ? 'Bus updated' : 'New bus added', color: 'success' })

    // reset state
    state.name = undefined
    state.type = undefined
    state.capacity = undefined
    state.plate_number = undefined
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
  state.name = undefined
  state.type = undefined
  state.capacity = undefined
  state.plate_number = undefined
  await Promise.resolve(props.onSuccess())
}

watch(() => props.bus, (newBus) => {
  if (newBus) {
    state.name = newBus.name
    state.type = newBus.type
    state.capacity = newBus.capacity
    state.plate_number = newBus.plate_number
    open.value = true
  } else {
    state.name = undefined
    state.type = undefined
    state.capacity = undefined
    state.plate_number = undefined
  }
}, { immediate: true })
</script>

<template>
  <UModal
    v-model:open="open"
    :close="{ onClick: handleClose }"
    :title="`${isUpdate ? 'Update' : 'New'} Bus`"
    description="Manage your buses information in the database"
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
        <UFormField label="Nama Bus" name="name">
          <UInput v-model="state.name" placeholder="contoh: Bus A" class="w-full" />
        </UFormField>
        <UFormField label="Jenis Bus" placeholder="Pilih salah satu" name="type">
          <USelect
            v-model="state.type"
            :items="types"
            :disabled="isUpdate"
            placeholder="Pilih salah satu"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Kapasitas Penumpang"
          help="Minimal 50 penumpang"
          name="capacity"
        >
          <UInput v-model="state.capacity" placeholder="contoh: 50" class="w-full" />
        </UFormField>
        <UFormField label="Nomor Plat Kendaraan" name="plate_number">
          <UInput v-model="state.plate_number" placeholder="contoh: DD 1234 XY" class="w-full" />
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
