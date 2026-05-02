<script setup lang="ts">
import * as z from 'zod'
import { CalendarDate, Time } from '@internationalized/date'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  schedule?: {
    id: string
    route_id: string | null
    departure_time: string
    bus_type: string
    total_seats: number
    price_per_seat: number
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
const inputDate = useTemplateRef('inputDate')
const inputTime = useTemplateRef('inputTime')

// State
const open = ref(false)
const loading = ref(false)
const isUpdate = computed(() => !!props.schedule)

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
  departureDate: z.any().refine(val => val && 'day' in val, {
    message: 'Wajib diisi'
  }),
  departureTime: z.any().refine(val => val && 'hour' in val, {
    message: 'Wajib diisi'
  }),
  busType: z.string('Wajib diisi'),
  totalSeats: z.coerce.number({ message: 'Wajib diisi' }).min(50, 'Minimal 50 kursi'),
  pricePerSeat: z.coerce.number({ message: 'Wajib diisi' }).min(250000, 'Harga minimal adalah 250.000')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  routeId: undefined,
  departureDate: undefined,
  departureTime: undefined,
  busType: undefined,
  totalSeats: undefined,
  pricePerSeat: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const d = event.data.departureDate
    const t = event.data.departureTime
    const createDepartureTime = new Date(d.year, d.month - 1, d.day, t.hour, t.minute).toISOString()

    const method = isUpdate.value ? 'PATCH' : 'POST'
    const url = isUpdate.value ? `/api/schedules?id=${props.schedule?.id}` : '/api/schedules'

    await $fetch(url, {
      headers,
      method: method,
      body: {
        route_id: event.data.routeId,
        departure_time: createDepartureTime,
        bus_type: event.data.busType,
        total_seats: event.data.totalSeats,
        price_per_seat: event.data.pricePerSeat
      }
    })

    await Promise.resolve(props.onSuccess()) // refresh tabel
    toast.add({ title: 'Success', description: isUpdate.value ? 'Schedule updated' : 'New schedule added', color: 'success' })

    // reset state
    state.routeId = undefined
    state.departureDate = undefined
    state.departureTime = undefined
    state.busType = undefined
    state.totalSeats = undefined
    state.pricePerSeat = undefined
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
  state.departureDate = undefined
  state.departureTime = undefined
  state.busType = undefined
  state.totalSeats = undefined
  state.pricePerSeat = undefined
  await Promise.resolve(props.onSuccess())
}

function parseDepartureTime(isoString: string) {
  const dateObj = new Date(isoString)

  const calendarDate = new CalendarDate(
    dateObj.getFullYear(),
    dateObj.getMonth() + 1,
    dateObj.getDate()
  )

  const calendarTime = new Time(
    dateObj.getHours(),
    dateObj.getMinutes(),
    dateObj.getSeconds()
  )

  return { calendarDate, calendarTime }
}

watch(() => props.schedule, (newSchedule) => {
  if (newSchedule) {
    const { calendarDate, calendarTime } = parseDepartureTime(newSchedule.departure_time)

    state.routeId = newSchedule.route_id || undefined
    state.departureDate = calendarDate
    state.departureTime = calendarTime
    state.busType = newSchedule.bus_type || undefined
    state.totalSeats = newSchedule.total_seats || undefined
    state.pricePerSeat = newSchedule.price_per_seat || undefined
    open.value = true
  } else {
    state.routeId = undefined
    state.departureDate = undefined
    state.departureTime = undefined
    state.busType = undefined
    state.totalSeats = undefined
    state.pricePerSeat = undefined
  }
}, { immediate: true })
</script>

<template>
  <UModal
    v-model:open="open"
    :close="{ onClick: handleClose }"
    :title="`${isUpdate ? 'Update' : 'New'} schedule`"
    description="Add a new schedule to the database"
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
        <div class="flex gap-4 w-full">
          <UFormField label="Tanggal berangkat" name="departureDate">
            <UInputDate
              ref="inputDate"
              v-model="state.departureDate"
              :disabled="isUpdate"
              locale="id-ID"
              class="w-full"
              size="xl"
            >
              <template #trailing>
                <UPopover modal :reference="inputDate?.inputsRef[2]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-calendar"
                    aria-label="Pilih tanggal"
                    :disabled="isUpdate"
                    class="px-0"
                  />

                  <template #content>
                    <UCalendar v-model="state.departureDate" class="p-2" />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
          </UFormField>
          <UFormField label="Jam Berangkat" name="departureTime">
            <UInputTime
              ref="inputTime"
              v-model="state.departureTime"
              :disabled="isUpdate"
              :hour-cycle="24"
              class="w-full"
              size="xl"
            >
              <template #trailing>
                <UPopover modal :reference="inputTime?.inputsRef[2]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-clock"
                    aria-label="Pilih jam"
                    :disabled="isUpdate"
                    class="px-0"
                  />
                  <template #content>
                    <TimeTicker @select="state.departureTime = $event" />
                  </template>
                </UPopover>
              </template>
            </UInputTime>
          </UFormField>
        </div>
        <UFormField label="Jenis bus" name="busType">
          <USelect
            v-model="state.busType"
            :items="['Executive Lounge', 'Sleeper Bus']"
            placeholder="Pilih salah satu"
            :disabled="isUpdate"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Jumlah kursi" name="totalSeats">
          <UInput v-model="state.totalSeats" class="w-full" />
        </UFormField>
        <UFormField label="Harga satuan" name="pricePerSeat">
          <UInput v-model="state.pricePerSeat" class="w-full" />
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
