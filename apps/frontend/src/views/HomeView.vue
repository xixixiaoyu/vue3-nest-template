<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold text-gray-900 mb-6">Welcome to My App</h1>
    <p class="text-lg text-gray-600 mb-8">
      A full-stack monorepo template with Vue 3, NestJS, Prisma, and PostgreSQL.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-primary-600 mb-3">Frontend</h2>
        <p class="text-gray-600">Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia + Vue Router</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-primary-600 mb-3">Backend</h2>
        <p class="text-gray-600">NestJS + Prisma + PostgreSQL with RESTful API</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-primary-600 mb-3">Shared</h2>
        <p class="text-gray-600">TypeScript types and DTOs shared between frontend and backend</p>
      </div>
    </div>
    <div class="mt-8">
      <RouterLink
        to="/users"
        class="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
      >
        View Users Demo
        <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
    </div>
  </div>
</template>
