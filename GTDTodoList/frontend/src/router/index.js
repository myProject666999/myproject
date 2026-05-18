import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/inbox'
    },
    {
        path: '/inbox',
        name: 'Inbox',
        component: () => import('@/views/Inbox.vue')
    },
    {
        path: '/today',
        name: 'Today',
        component: () => import('@/views/Today.vue')
    },
    {
        path: '/projects',
        name: 'Projects',
        component: () => import('@/views/Projects.vue')
    },
    {
        path: '/review',
        name: 'Review',
        component: () => import('@/views/Review.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
