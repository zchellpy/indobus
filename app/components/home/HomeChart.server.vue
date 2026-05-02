<template>
  <UCard class="shrink-0" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <p class="text-xs text-muted uppercase mb-1.5">
            Revenue
          </p>
          <USkeleton class="h-9 w-48 rounded-md" />
        </div>
        <USkeleton class="h-9 w-9 rounded-md" />
      </div>
    </template>

    <div class="h-96" />
  </UCard>
</template>
