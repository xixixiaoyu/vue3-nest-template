<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { RegisterSchema } from '@my-app/shared'
import { z } from 'zod'
import AuthCard from '@/components/auth/AuthCard.vue'
import FormInput from '@/components/auth/FormInput.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import PrimaryButton from '@/components/auth/PrimaryButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const RegisterWithConfirmSchema = RegisterSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(RegisterWithConfirmSchema),
})

const [email] = defineField('email')
const [name] = defineField('name')
const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  const { email, name, password } = values
  const success = await authStore.register({ email, name, password })
  if (success) {
    router.push('/')
  }
})
</script>

<template>
  <AuthCard :title="t('register.title')">
    <form class="space-y-6" @submit="onSubmit">
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

      <FormInput
        v-model="name"
        :label="t('register.name')"
        :placeholder="t('register.namePlaceholder')"
        type="text"
        :error="errors.name"
      />

      <PasswordInput
        v-model="password"
        :label="t('login.password')"
        :placeholder="t('login.passwordPlaceholder')"
        :error="errors.password"
        show-strength
      />

      <PasswordInput
        v-model="confirmPassword"
        :label="t('register.confirmPassword')"
        :placeholder="t('register.confirmPasswordPlaceholder')"
        :error="errors.confirmPassword"
      />

      <PrimaryButton :loading="authStore.loading" full-width>
        <template #loading>{{ t('register.submitting') }}</template>
        {{ t('register.submit') }}
      </PrimaryButton>

      <p class="text-center text-sm text-warm-text-secondary">
        {{ t('register.hasAccount') }}
        <router-link
          to="/login"
          class="text-warm-primary hover:text-warm-primary-hover font-medium transition-colors"
        >
          {{ t('register.loginLink') }}
        </router-link>
      </p>
    </form>
  </AuthCard>
</template>
