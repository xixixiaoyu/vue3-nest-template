<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: string | undefined
  label: string
  placeholder?: string
  error?: string
  disabled?: boolean
  showStrength?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { t } = useI18n()
const showPassword = ref(false)

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const passwordStrength = computed(() => {
  if (!props.showStrength || !props.modelValue) return null

  let strength = 0
  if (props.modelValue.length >= 6) strength++
  if (/[A-Za-z]/.test(props.modelValue)) strength++
  if (/[0-9]/.test(props.modelValue)) strength++
  if (/[^A-Za-z0-9]/.test(props.modelValue)) strength++
  if (props.modelValue.length >= 8) strength++

  if (strength <= 2)
    return { level: 'weak', color: 'bg-warm-error', text: t('password.strength.weak') }
  if (strength === 3)
    return { level: 'medium', color: 'bg-warm-primary', text: t('password.strength.medium') }
  return { level: 'strong', color: 'bg-warm-success', text: t('password.strength.strong') }
})
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-warm-text">
      {{ label }}
    </label>
    <div class="relative">
      <input
        v-model="inputValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-warm-primary focus:border-transparent',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error
            ? 'border-warm-error focus:ring-warm-error'
            : 'border-warm-border hover:border-warm-primary/50',
        ]"
      />
      <button
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warm-text-secondary hover:text-warm-text transition-colors"
        :title="showPassword ? t('password.hide') : t('password.show')"
      >
        <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
      </button>
    </div>

    <div v-if="showStrength && passwordStrength && modelValue" class="flex items-center gap-2">
      <div class="flex-1 h-1 bg-warm-border rounded-full overflow-hidden">
        <div
          :class="[passwordStrength.color, 'h-full transition-all duration-300']"
          :style="{
            width:
              passwordStrength.level === 'weak'
                ? '33%'
                : passwordStrength.level === 'medium'
                  ? '66%'
                  : '100%',
          }"
        />
      </div>
      <span class="text-xs text-warm-text-secondary">{{ passwordStrength.text }}</span>
    </div>

    <p v-if="error" class="text-sm text-warm-error animate-shake">
      {{ error }}
    </p>
  </div>
</template>
