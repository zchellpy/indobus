<script setup lang="ts">
// import { sub } from 'date-fns'
import { startOfMonth } from 'date-fns'
import type { Period, Range } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()
const range = shallowRef<Range>({
  // start: sub(new Date(), { days: 14 }),
  start: startOfMonth(new Date()),
  end: new Date()
})
const period = ref<Period>('daily')
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar
        title="Beranda"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip
            text="Notifications"
            :shortcuts="['N']"
          >
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip
                color="primary"
                inset
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-4">
        <HomeBookings :period="period" :range="range" />
        <HomePassengers :period="period" :range="range" />
      </div>
    </template>
  </UDashboardPanel>
</template>
