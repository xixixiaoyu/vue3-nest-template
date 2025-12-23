<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-warm-bg px-4 py-12">
    <div class="w-full max-w-[480px] bg-warm-card rounded-[20px] p-12 shadow-lg animate-fade-in-up">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-warm-text text-center">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-3 text-warm-text-secondary text-center leading-relaxed">
          {{ description }}
        </p>
      </div>

      <slot />
    </div>
  </div>
</template>
