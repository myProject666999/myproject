import type { Router } from 'vue-router'
import { useUserStore } from '@/stores'
import { auth, LOGIN_ROUTE, HOME_ROUTE } from '@/utils/auth'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    const userStore = useUserStore()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
    const requiredRoles = to.meta.roles as string[] | undefined

    if (to.path === LOGIN_ROUTE) {
      if (userStore.isLoggedIn) {
        next(HOME_ROUTE)
      } else {
        next()
      }
      return
    }

    if (requiresAuth && !userStore.isLoggedIn) {
      auth.redirectToLogin()
      return
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some(role => userStore.roles.includes(role))
      if (!hasRole) {
        next(HOME_ROUTE)
        return
      }
    }

    next()
  })
}
