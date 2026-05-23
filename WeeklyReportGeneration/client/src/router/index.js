import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const routes = [
    {
        path: '/',
        component: Layout,
        redirect: '/current-week',
        children: [
            {
                path: 'current-week',
                name: 'CurrentWeek',
                component: () => import('../views/CurrentWeek.vue'),
                meta: { title: '本周', icon: 'Calendar' }
            },
            {
                path: 'templates',
                name: 'Templates',
                component: () => import('../views/Templates.vue'),
                meta: { title: '模板', icon: 'Document' }
            },
            {
                path: 'history',
                name: 'History',
                component: () => import('../views/History.vue'),
                meta: { title: '历史', icon: 'Clock' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title || '周报生成系统'} - 周报生成系统`
    next()
})

export default router
