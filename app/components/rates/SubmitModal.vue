<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Props
const props = defineProps<{
  rate?: {
    id: string
    destination: string
    category: string
    sub_category: string
    base_price: number
  } | null
  onSuccess: () => void
}>()

const toast = useToast()
const headers = useRequestHeaders(['cookie'])

// const { data: users, status } = await useFetch('https://jsonplaceholder.typicode.com/users', {
//   key: 'typicode-users',
//   transform: (data: { id: number, name: string }[]) => {
//     return data?.map(user => ({
//       label: user.name,
//       value: String(user.id),
//       avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` }
//     }))
//   },
//   lazy: true
// })

const { data, status } = await useFetch('/api/destinations', {
  key: 'table-expedition-rates',
  headers: useRequestHeaders(['cookie']),
  lazy: true
})

const destinations = computed(() => data.value?.map((item: string) => item.destination || []))
// const destinations = computed(() => (data.value ?? []).map((item: string) => item.destination))
const categories = ref(['motor', 'elektronik', 'dokumen'])
const subCategories = ref(['kecil', 'sedang', 'besar'])

// State
const open = ref(false)
const loading = ref(false)
const isUpdate = computed(() => !!props.rate)

const schema = z.object({
  destination: z.string('Kota tujuan pengiriman wajib diisi'),
  category: z.string('Kategori wajib dipilih'),
  sub_category: z.string().optional(), // Jadikan opsional terlebih dahulu
  base_price: z.coerce.number('Biaya pengiriman wajib diisi').min(10000, 'Minimal Rp 10.000')
  // }).refine(
  //   (data) => {
  //     if (data.category !== 'motor') return true
  //     return !!data.sub_category && data.sub_category.trim() !== ''
  //   },
  //   {
  //     message: 'Sub kategori wajib dipilih',
  //     path: ['sub_category']
  //   }
  // )
}).superRefine((data, ctx) => {
  if (data.category === 'motor' && !data.sub_category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Sub kategori wajib dipilih untuk kategori motor',
      path: ['sub_category']
    })
  }
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  destination: undefined,
  category: undefined,
  sub_category: undefined,
  base_price: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  console.log('Sub Category:', event.data.sub_category)
  try {
    const method = isUpdate.value ? 'PATCH' : 'POST'
    const url = isUpdate.value ? `/api/rates?id=${props.rate?.id}` : '/api/rates'

    await $fetch(url, {
      headers,
      method: method,
      body: {
        destination: event.data.destination,
        category: event.data.category,
        sub_category: event.data.sub_category,
        base_price: event.data.base_price
      }
    })

    await Promise.resolve(props.onSuccess()) // refresh tabel
    toast.add({ title: 'Success', description: isUpdate.value ? 'Rate updated' : 'New rate added', color: 'success' })

    // reset state
    state.destination = undefined
    state.category = undefined
    state.sub_category = undefined
    state.base_price = undefined
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
  state.destination = undefined
  state.category = undefined
  state.sub_category = undefined
  state.base_price = undefined
  await Promise.resolve(props.onSuccess())
}

watch(() => props.rate, (newRate) => {
  if (newRate) {
    state.destination = newRate.destination
    state.category = newRate.category
    state.sub_category = newRate.sub_category
    state.base_price = newRate.base_price
    open.value = true
  } else {
    state.destination = undefined
    state.category = undefined
    state.sub_category = undefined
    state.base_price = undefined
  }
}, { immediate: true })
</script>

<template>
  <UModal
    v-model:open="open"
    :close="{ onClick: handleClose }"
    :title="`${isUpdate ? 'Update' : 'New'} Rate`"
    description="Manage your expedition rates information in the database"
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
        <UFormField label="Kota Tujuan" name="destination">
          <USelect
            v-model="state.destination"
            :items="destinations"
            :disabled="isUpdate"
            placeholder="Pilih salah satu"
            :loading="status === 'pending'"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Category" name="category">
          <USelect
            v-model="state.category"
            :items="categories"
            :disabled="isUpdate"
            placeholder="Pilih salah satu"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Sub Category" name="sub_category">
          <USelect
            v-model="state.sub_category"
            :items="subCategories"
            :disabled="isUpdate"
            placeholder="Pilih salah satu"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Biaya Pengiriman" name="base_price">
          <UInput v-model="state.base_price" placeholder="contoh: 100000" class="w-full" />
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
