<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

type Profile = Database['public']['Tables']['profiles']['Row']

const colorMode = useColorMode()

const client = useSupabaseClient()
// const headers = useRequestHeaders(['cookie'])

// const { data: profile } = await useAsyncData<Profile>('profile', async () => {
//   return await $fetch<Profile>('/api/me', { headers })
// }, {
//   immediate: true,
//   default: () => null as unknown as Profile
// })

// const userData = computed(() => ({
//   name: profile.value?.full_name,
//   avatar: {
//     src: profile.value?.avatar_url || undefined,
//     alt: profile.value?.full_name || 'Indo Bus'
//   }
// }))

const { data: profile } = await useFetch<Profile>('/api/me', {
  key: 'data-profile',
  headers: useRequestHeaders(['cookie']),
  immediate: true
})

const userData = computed(() => ({
  name: profile.value?.full_name,
  avatar: {
    src: profile.value?.avatar_url || undefined,
    alt: profile.value?.full_name || 'Indo Bus'
  }
}))

async function handleLogout() {
  await client.auth.signOut()
  navigateTo('/')
}

const items = computed<DropdownMenuItem[][]>(() => ([
  [{
    type: 'label',
    label: userData.value.name,
    avatar: userData.value.avatar
  }],
  [{
    label: 'Profile',
    icon: 'i-lucide-user'
  }, {
    label: 'Billing',
    icon: 'i-lucide-credit-card'
  }, {
    label: 'Settings',
    icon: 'i-lucide-settings'
  }],
  [{
    label: 'Appearance',
    icon: 'i-lucide-sun-moon',
    children: [{
      label: 'Light',
      icon: 'i-lucide-sun',
      type: 'checkbox',
      checked: colorMode.value === 'light',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'light'
      }
    }, {
      label: 'Dark',
      icon: 'i-lucide-moon',
      type: 'checkbox',
      checked: colorMode.value === 'dark',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'dark'
      }
    }]
  }],
  [{
    label: 'Log out',
    icon: 'i-lucide-log-out',
    onSelect: handleLogout
  }]
]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        avatar: userData.avatar,
        label: collapsed ? undefined : userData.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
