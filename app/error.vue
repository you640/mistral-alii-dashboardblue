<script setup lang="ts">
defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4 text-center">
    <div class="flex size-16 items-center justify-center rounded-full bg-red-500/10 mb-4">
      <UIcon name="i-lucide-alert-circle" class="size-8 text-red-500" />
    </div>
    <h1 class="text-2xl font-bold mb-2">
      {{ error.statusCode }}
    </h1>
    <p class="text-muted mb-6">
      {{ error.message || 'Nastala neočakávaná chyba.' }}
    </p>
    <UButton
      label="Späť na prehľad"
      to="/"
      variant="outline"
    />
  </div>
</template>
