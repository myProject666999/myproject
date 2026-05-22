import { createRouter, createWebHistory } from 'vue-router'
import Record from '../views/Record.vue'
import Report from '../views/Report.vue'

const routes = [
    {
        path: '/',
        redirect: '/record'
    },
    {
        path: '/record',
        name: 'Record',
        component: Record
    },
    {
        path: '/report',
        name: 'Report',
        component: Report
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
