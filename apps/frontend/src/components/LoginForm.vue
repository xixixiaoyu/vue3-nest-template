<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { LoginSchema } from '@my-app/shared'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// 使用共享的 Zod Schema 作为验证规则 (Single Source of Truth)
const validationSchema = toTypedSchema(LoginSchema)

const { handleSubmit, errors: formErrors } = useForm({
  validationSchema,
})

const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit(async (values) => {
  const success = await authStore.login(values)
  if (success) {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ t('login.title') }}
        </h2>
      </div>

      <form class="mt-8 space-y-6" @submit="onSubmit">
        <!-- 全局错误提示 -->
        <div
          v-if="authStore.error"
          class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
        >
          {{ authStore.error }}
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <!-- 邮箱输入 -->
          <div>
            <label for="email" class="sr-only">{{ t('login.email') }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :placeholder="t('login.emailPlaceholder')"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': formErrors.email }"
            />
            <p v-if="formErrors.email" class="text-red-500 text-xs mt-1 px-1">
              {{ formErrors.email }}
            </p>
          </div>

          <!-- 密码输入 -->
          <div>
            <label for="password" class="sr-only">{{ t('login.password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              :placeholder="t('login.passwordPlaceholder')"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': formErrors.password }"
            />
            <p v-if="formErrors.password" class="text-red-500 text-xs mt-1 px-1">
              {{ formErrors.password }}
            </p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.loading">{{ t('login.submitting') }}</span>
            <span v-else>{{ t('login.submit') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
