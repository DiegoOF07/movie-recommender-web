import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AdminLoginView from '@/views/AdminLoginView.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/dashboard', component: DashboardView, meta: { requiresUser: true } },
    { path: '/admin/login', component: AdminLoginView },
    { path: '/admin', component: AdminView, meta: { requiresAdmin: true } },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresUser && !auth.username) return '/login'
  if (to.meta.requiresAdmin && !auth.isAdmin) return '/admin/login'
  return true
})

export default router
