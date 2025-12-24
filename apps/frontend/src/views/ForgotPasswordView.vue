<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { ForgotPasswordSchema } from '@my-app/shared'
import { CheckCircle2 } from 'lucide-vue-next'
import AuthCard from '@/components/auth/AuthCard.vue'
import FormInput from '@/components/auth/FormInput.vue'
import PrimaryButton from '@/components/auth/PrimaryButton.vue'

const authStore = useAuthStore()
const { t } = useI18n()
const success = ref(false)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(ForgotPasswordSchema),
})

const [email] = defineField('email')

const onSubmit = handleSubmit(async (values) => {
  const result = await authStore.forgotPassword(values.email)
  if (result) {
    success.value = true
  }
})
</script>

<template>
  <AuthCard
    :title="t('forgotPassword.title')"
    :description="success ? '' : t('forgotPassword.description')"
  >
    <div v-if="success" class="text-center space-y-6">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-full bg-warm-success/10 flex items-center justify-center">
          <CheckCircle2 class="w-8 h-8 text-warm-success" />
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-warm-text">
          {{ t('forgotPassword.successTitle') }}
        </h3>
        <p class="text-warm-text-secondary leading-relaxed">
          {{ t('forgotPassword.successMessage') }}
        </p>
      </div>

      <router-link
        to="/login"
        class="inline-block w-full px-8 py-3 rounded-xl font-medium transition-all duration-200 bg-warm-primary text-white hover:bg-warm-primary-hover transform hover:-translate-y-0.5 hover:shadow-lg"
      >
        {{ t('forgotPassword.backToLogin') }}
      </router-link>
    </div>

    <form v-else class="space-y-6" @submit="onSubmit">
      <div
        v-if="authStore.error"
        class="bg-warm-error/10 border border-warm-error text-warm-error px-4 py-3 rounded-xl text-sm animate-shake"
      >
        {{ authStore.error }}
      </div>

      <FormInput
        v-model="email"
        :label="t('login.email')"
        :placeholder="t('login.emailPlaceholder')"
        type="email"
        :error="errors.email"
      />

      <PrimaryButton :loading="authStore.loading" full-width>
        <template #loading>{{ t('forgotPassword.submitting') }}</template>
        {{ t('forgotPassword.submit') }}
      </PrimaryButton>

      <p class="text-center text-sm text-warm-text-secondary">
        <router-link
          to="/login"
          class="text-warm-primary hover:text-warm-primary-hover font-medium transition-colors"
        >
          {{ t('forgotPassword.backToLogin') }}
        </router-link>
      </p>
    </form>
  </AuthCard>
</template>
