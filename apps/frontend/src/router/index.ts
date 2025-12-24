import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * 应用路由配置
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/users',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { title: '找回密码' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { title: '重置密码' },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { title: '用户列表' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '页面未找到' },
    },
  ],
})

// 路由守卫：更新页面标题 + 认证检查
router.beforeEach((to) => {
  const title = to.meta.title as string
  document.title = title ? `${title} - My App` : 'My App'

  const authStore = useAuthStore()

  // 需要认证的页面
  const requiresAuth = ['users'].includes(to.name as string)

  // 已登录用户访问登录/注册页，跳转到用户列表
  if (authStore.isAuthenticated && ['login', 'register'].includes(to.name as string)) {
    return '/users'
  }

  // 未登录用户访问需要认证的页面，跳转到登录页
  if (!authStore.isAuthenticated && requiresAuth) {
    return '/login'
  }
})

export default router
