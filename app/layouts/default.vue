<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()

const openSidebar = ref(false)
const dataMenuSettingPaths = ['/routes', '/stations', '/customers']

const links = [[{
  label: 'Beranda',
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    openSidebar.value = false
  }
}, {
  label: 'Jadwal',
  icon: 'i-lucide-calendar-days',
  to: '/schedules',
  // badge: '4',
  onSelect: () => {
    openSidebar.value = false
  }
}, {
  label: 'Pemesanan',
  icon: 'i-lucide-receipt-text',
  to: '/bookings',
  onSelect: () => {
    openSidebar.value = false
  }
}, {
  label: 'Penumpang',
  icon: 'i-lucide-users',
  to: '/passengers',
  onSelect: () => {
    openSidebar.value = false
  }
}, {
  label: 'Data',
  icon: 'i-lucide-settings',
  defaultopenSidebar: dataMenuSettingPaths.includes(route.path),
  type: 'trigger',
  children: [{
    label: 'Bus',
    to: '/buses',
    onSelect: () => {
      openSidebar.value = false
    }
  },
  {
    label: 'Rute',
    to: '/routes',
    // exact: true,
    onSelect: () => {
      openSidebar.value = false
    }
  }, {
    label: 'Stasiun',
    to: '/stations',
    onSelect: () => {
      openSidebar.value = false
    }
  }, {
    label: 'Pelanggan',
    to: '/customers',
    onSelect: () => {
      openSidebar.value = false
    }
  }, {
    label: 'Biaya Pengiriman',
    to: '/rates',
    onSelect: () => {
      openSidebar.value = false
    }
  }]
}], [{
  label: 'Help & Support',
  icon: 'i-lucide-info',
  // to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'Kami menggunakan cookie untuk peningkatan mutu layanan dan pengalaman untuk pengguna.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Ok',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Opsi',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="openSidebar"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{
        header: 'flex items-center py-4 space-x-2',
        footer: 'lg:border-t lg:border-default'
      }"
    >
      <template #header="{ collapsed }">
        <AppLogo :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          label="Cari..."
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
