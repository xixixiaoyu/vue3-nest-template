<script setup lang="ts">
defineProps<{
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}>()
</script>

<template>
  <button
    type="submit"
    :disabled="disabled || loading"
    :class="[
      'px-8 py-3 rounded-xl font-medium transition-all duration-200',
      'bg-warm-primary text-white hover:bg-warm-primary-hover',
      'focus:outline-none focus:ring-2 focus:ring-warm-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
      fullWidth ? 'w-full' : '',
    ]"
  >
    <span v-if="loading" class="flex items-center justify-center gap-2">
      <svg
        class="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <slot name="loading" />
    </span>
    <slot v-else />
  </button>
</template>
