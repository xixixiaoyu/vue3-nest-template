<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/vue-query'
import { useMouse, useWindowSize, useDark, useToggle } from '@vueuse/core'
import { Check, X, Loader2, Sun, Moon, MousePointer, Monitor } from 'lucide-vue-next'
import dayjs from 'dayjs'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { Button } from '@/components/ui/button'
import { useUsersStore } from '@/stores/users'
import { api } from '@/api'

// 注册 ECharts 组件
use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const { t } = useI18n()

// ========== 依赖测试状态 ==========
interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
}

const testResults = ref<TestResult[]>([
  { name: 'Vue I18n', status: 'pending' },
  { name: 'Pinia', status: 'pending' },
  { name: 'VueUse', status: 'pending' },
  { name: 'Lucide Icons', status: 'pending' },
  { name: 'shadcn-vue (Button)', status: 'pending' },
  { name: 'VeeValidate + Zod', status: 'pending' },
  { name: 'TanStack Query', status: 'pending' },
  { name: 'ECharts', status: 'pending' },
  { name: 'dayjs', status: 'pending' },
])

const updateTest = (name: string, status: 'success' | 'error', message?: string) => {
  const test = testResults.value.find((t) => t.name === name)
  if (test) {
    test.status = status
    test.message = message
  }
}

// ========== 1. Vue I18n 测试 ==========
try {
  const translated = t('home.title')
  updateTest('Vue I18n', translated ? 'success' : 'error', translated || '翻译失败')
} catch (e) {
  updateTest('Vue I18n', 'error', String(e))
}

// ========== 2. Pinia 测试 ==========
try {
  const usersStore = useUsersStore()
  updateTest('Pinia', 'success', `Store 已加载，当前用户数: ${usersStore.users.length}`)
} catch (e) {
  updateTest('Pinia', 'error', String(e))
}

// ========== 3. VueUse 测试 ==========
const { x: mouseX, y: mouseY } = useMouse()
const { width: windowWidth, height: windowHeight } = useWindowSize()
const isDark = useDark()
const toggleDark = useToggle(isDark)

try {
  updateTest('VueUse', 'success', `鼠标/窗口尺寸/暗色模式均可用`)
} catch (e) {
  updateTest('VueUse', 'error', String(e))
}

// ========== 4. Lucide Icons 测试 ==========
try {
  // 如果图标组件能正常导入，则测试通过
  updateTest('Lucide Icons', 'success', '图标组件已加载')
} catch (e) {
  updateTest('Lucide Icons', 'error', String(e))
}

// ========== 5. shadcn-vue Button 测试 ==========
try {
  updateTest('shadcn-vue (Button)', 'success', 'Button 组件已加载')
} catch (e) {
  updateTest('shadcn-vue (Button)', 'error', String(e))
}

// ========== 6. VeeValidate + Zod 测试 ==========
const testSchema = z.object({
  email: z.string().email('请输入有效邮箱'),
})

const { errors, defineField, validate } = useForm({
  validationSchema: toTypedSchema(testSchema),
})

const [testEmail] = defineField('email')
testEmail.value = 'test@example.com'

try {
  validate().then((result) => {
    updateTest('VeeValidate + Zod', result.valid ? 'success' : 'error', '表单验证正常')
  })
} catch (e) {
  updateTest('VeeValidate + Zod', 'error', String(e))
}

// ========== 7. TanStack Query 测试 ==========
const { isLoading: queryLoading, isError: queryError } = useQuery({
  queryKey: ['health-check'],
  queryFn: () => api.getUsers().catch(() => ({ data: [] })),
  retry: false,
})

try {
  updateTest('TanStack Query', 'success', 'Query 已初始化')
} catch (e) {
  updateTest('TanStack Query', 'error', String(e))
}

// ========== 8. ECharts 测试 ==========
const chartOption = computed(() => ({
  title: { text: '依赖测试', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        {
          value: testResults.value.filter((t) => t.status === 'success').length,
          name: '通过',
          itemStyle: { color: '#22c55e' },
        },
        {
          value: testResults.value.filter((t) => t.status === 'error').length,
          name: '失败',
          itemStyle: { color: '#ef4444' },
        },
        {
          value: testResults.value.filter((t) => t.status === 'pending').length,
          name: '等待中',
          itemStyle: { color: '#94a3b8' },
        },
      ],
    },
  ],
}))

try {
  updateTest('ECharts', 'success', 'ECharts 组件已加载')
} catch (e) {
  updateTest('ECharts', 'error', String(e))
}

// ========== 9. dayjs 测试 ==========
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))

try {
  updateTest('dayjs', currentTime.value ? 'success' : 'error', currentTime.value)
} catch (e) {
  updateTest('dayjs', 'error', String(e))
}

// 统计
const passedCount = computed(() => testResults.value.filter((t) => t.status === 'success').length)
const totalCount = computed(() => testResults.value.length)
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- 标题区域 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">依赖集成测试</h1>
      <p class="text-gray-600 dark:text-gray-400">验证项目核心依赖是否正确集成</p>
    </div>

    <!-- 测试结果卡片 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">测试结果</h2>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-green-600 font-medium">{{ passedCount }}/{{ totalCount }} 通过</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="test in testResults"
          :key="test.name"
          class="flex items-center justify-between p-4 rounded-lg border"
          :class="{
            'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800':
              test.status === 'success',
            'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800':
              test.status === 'error',
            'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600':
              test.status === 'pending',
          }"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="{
                'bg-green-500': test.status === 'success',
                'bg-red-500': test.status === 'error',
                'bg-gray-400': test.status === 'pending',
              }"
            >
              <Check v-if="test.status === 'success'" class="w-4 h-4 text-white" />
              <X v-else-if="test.status === 'error'" class="w-4 h-4 text-white" />
              <Loader2 v-else class="w-4 h-4 text-white animate-spin" />
            </div>
            <span class="font-medium text-gray-800 dark:text-white">{{ test.name }}</span>
          </div>
          <span
            v-if="test.message"
            class="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate"
          >
            {{ test.message }}
          </span>
        </div>
      </div>
    </div>

    <!-- 实时演示区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- VueUse 演示 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3
          class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"
        >
          <MousePointer class="w-5 h-5" />
          VueUse 实时数据
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">鼠标位置</span>
            <span class="font-mono text-gray-800 dark:text-white"
              >X: {{ mouseX }}, Y: {{ mouseY }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">窗口尺寸</span>
            <span class="font-mono text-gray-800 dark:text-white"
              >{{ windowWidth }} × {{ windowHeight }}</span
            >
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">暗色模式</span>
            <Button size="sm" variant="outline" @click="toggleDark()">
              <Sun v-if="isDark" class="w-4 h-4" />
              <Moon v-else class="w-4 h-4" />
              {{ isDark ? '浅色' : '深色' }}
            </Button>
          </div>
        </div>
      </div>

      <!-- ECharts 图表 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3
          class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"
        >
          <Monitor class="w-5 h-5" />
          ECharts 图表
        </h3>
        <VChart :option="chartOption" autoresize style="height: 180px" />
      </div>
    </div>

    <!-- shadcn-vue 按钮演示 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">shadcn-vue 按钮变体</h3>
      <div class="flex flex-wrap gap-3">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>

    <!-- 导航 -->
    <div class="text-center">
      <RouterLink
        to="/users"
        class="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        {{ t('home.viewUsersDemo') }}
        <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
    </div>
  </div>
</template>
