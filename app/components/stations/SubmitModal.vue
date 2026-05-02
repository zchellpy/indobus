<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  station?: {
    id: string
    route_id: string | null
    station_name: string
    address: string | null
  } | null
  onSuccess: () => void
}>()

interface RouteRow {
  id: string
  origin: string
  destination: string
}

const toast = useToast()
const headers = useRequestHeaders(['cookie'])

// State
const open = ref(false)
const loading = ref(false)
const isUpdate = computed(() => !!props.station)

// Fetch data rute
const { data: routes, status } = await useFetch<RouteRow[]>('/api/routes', { headers })

const routeItems = computed(() => {
  return routes.value?.map((r: RouteRow) => ({
    label: `${r.origin} → ${r.destination}`,
    id: r.id // Kita gunakan 'id' sebagai value-key
  })) || []
})

const schema = z.object({
  routeId: z.uuid('Wajib diisi'),
  stationName: z.string('Wajib diisi').min(7, 'Minimal 7 karakter'),
  address: z.string('Wajib diisi').min(10, 'Minimal 10 karakter')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  routeId: undefined,
  stationName: undefined,
  address: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const method = isUpdate.value ? 'PATCH' : 'POST'
    const url = isUpdate.value ? `/api/stations?id=${props.station?.id}` : '/api/stations'

    await $fetch(url, {
      headers,
      method: method,
      body: {
        route_id: event.data.routeId,
        station_name: event.data.stationName,
        address: event.data.address
      }
    })

    await Promise.resolve(props.onSuccess()) // refresh tabel
    toast.add({ title: 'Success', description: isUpdate.value ? 'Station updated' : 'New station added', color: 'success' })

    // reset state
    state.routeId = undefined
    state.stationName = undefined
    state.address = undefined
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
  state.routeId = undefined
  state.stationName = undefined
  state.address = undefined
  await Promise.resolve(props.onSuccess())
}

watch(() => props.station, (newStation) => {
  if (newStation) {
    state.routeId = newStation.route_id || undefined
    state.stationName = newStation.station_name || undefined
    state.address = newStation.address || undefined
    open.value = true
  } else {
    state.routeId = undefined
    state.stationName = undefined
    state.address = undefined
  }
}, { immediate: true })
</script>

<template>
  <UModal
    v-model:open="open"
    :close="{ onClick: handleClose }"
    :title="`${isUpdate ? 'Update' : 'New'} station`"
    description="Manage your station information in the database"
  >
    <UButton icon="i-lucide-plus" class="rounded-full" />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Rute" name="routeId">
          <USelect
            v-model="state.routeId"
            :items="routeItems"
            :disabled="isUpdate"
            value-key="id"
            placeholder="Pilih salah satu rute..."
            :loading="status === 'pending'"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Nama Stasiun" name="stationName">
          <UInput v-model="state.stationName" class="w-full" />
        </UFormField>
        <UFormField label="Alamat" name="address">
          <UInput v-model="state.address" class="w-full" />
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
            loading-auto
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
