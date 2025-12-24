<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { z } from 'zod'
import { passwordSchema } from '@my-app/shared'
import { CheckCircle2, AlertCircle } from 'lucide-vue-next'
import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import PrimaryButton from '@/components/auth/PrimaryButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const token = ref<string | null>(null)
const success = ref(false)
const invalidToken = ref(false)

const ResetPasswordWithConfirmSchema = z
  .object({
    password: passwordSchema
      .regex(/[A-Za-z]/, '密码必须包含至少一个字母')
      .regex(/[0-9]/, '密码必须包含至少一个数字'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(ResetPasswordWithConfirmSchema),
})

const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')

onMounted(() => {
  token.value = route.query.token as string | null
  if (!token.value) {
    invalidToken.value = true
  }
})

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) return

  const result = await authStore.resetPassword(token.value, values.password)
  if (result) {
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})
</script>

<template>
  <AuthCard :title="t('resetPassword.title')">
    <div v-if="invalidToken" class="text-center space-y-6">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-full bg-warm-error/10 flex items-center justify-center">
          <AlertCircle class="w-8 h-8 text-warm-error" />
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-warm-text">
          {{ t('resetPassword.invalidToken') }}
        </h3>
      </div>

      <router-link
        to="/login"
        class="inline-block w-full px-8 py-3 rounded-xl font-medium transition-all duration-200 bg-warm-primary text-white hover:bg-warm-primary-hover"
      >
        {{ t('resetPassword.goToLogin') }}
      </router-link>
    </div>

    <div v-else-if="success" class="text-center space-y-6">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-full bg-warm-success/10 flex items-center justify-center">
          <CheckCircle2 class="w-8 h-8 text-warm-success" />
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-warm-text">
          {{ t('resetPassword.successTitle') }}
        </h3>
        <p class="text-warm-text-secondary leading-relaxed">
          {{ t('resetPassword.successMessage') }}
        </p>
      </div>

      <router-link
        to="/login"
        class="inline-block w-full px-8 py-3 rounded-xl font-medium transition-all duration-200 bg-warm-primary text-white hover:bg-warm-primary-hover"
      >
        {{ t('resetPassword.goToLogin') }}
      </router-link>
    </div>

    <form v-else class="space-y-6" @submit="onSubmit">
      <div
        v-if="authStore.error"
        class="bg-warm-error/10 border border-warm-error text-warm-error px-4 py-3 rounded-xl text-sm animate-shake"
      >
        {{ authStore.error }}
      </div>

      <PasswordInput
        v-model="password"
        :label="t('resetPassword.newPassword')"
        :placeholder="t('resetPassword.newPasswordPlaceholder')"
        :error="errors.password"
        show-strength
      />

      <PasswordInput
        v-model="confirmPassword"
        :label="t('resetPassword.confirmNewPassword')"
        :placeholder="t('resetPassword.confirmNewPasswordPlaceholder')"
        :error="errors.confirmPassword"
      />

      <PrimaryButton :loading="authStore.loading" full-width>
        <template #loading>{{ t('resetPassword.submitting') }}</template>
        {{ t('resetPassword.submit') }}
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
