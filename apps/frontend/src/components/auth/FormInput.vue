<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string | undefined
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'password'
  error?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-warm-text">
      {{ label }}
    </label>
    <input
      v-model="inputValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-3 rounded-xl border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-warm-primary focus:border-transparent',
        'disabled:bg-gray-50 disabled:cursor-not-allowed',
        error
          ? 'border-warm-error focus:ring-warm-error'
          : 'border-warm-border hover:border-warm-primary/50',
      ]"
    />
    <p v-if="error" class="text-sm text-warm-error">
      {{ error }}
    </p>
  </div>
</template>
