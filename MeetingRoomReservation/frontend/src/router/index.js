import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        component: () => import('@/views/Layout.vue'),
        redirect: '/rooms',
        meta: { requiresAuth: true },
        children: [
            {
                path: 'rooms',
                name: 'Rooms',
                component: () => import('@/views/RoomList.vue'),
                meta: { title: '会议室列表', icon: 'OfficeBuilding' }
            },
            {
                path: 'booking',
                name: 'Booking',
                component: () => import('@/views/BookingCalendar.vue'),
                meta: { title: '预订日历', icon: 'Calendar' }
            },
            {
                path: 'my-reservations',
                name: 'MyReservations',
                component: () => import('@/views/MyReservations.vue'),
                meta: { title: '我的预订', icon: 'Tickets' }
            },
            {
                path: 'statistics',
                name: 'Statistics',
                component: () => import('@/views/Statistics.vue'),
                meta: { title: '统计分析', icon: 'DataAnalysis' }
            },
            {
                path: 'admin',
                name: 'Admin',
                component: () => import('@/views/Admin.vue'),
                meta: { title: '后台管理', icon: 'Setting', requiresAdmin: true }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    
    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if (to.path === '/login' && token) {
        next('/')
    } else if (to.meta.requiresAdmin) {
        const role = localStorage.getItem('role')
        if (role !== '1') {
            next('/')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
