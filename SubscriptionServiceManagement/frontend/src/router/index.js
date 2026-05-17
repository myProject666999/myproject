import { createRouter, createWebHistory } from 'vue-router'
import SubscriptionList from '../views/SubscriptionList.vue'
import SubscriptionAdd from '../views/SubscriptionAdd.vue'
import ReminderCenter from '../views/ReminderCenter.vue'
import Statistics from '../views/Statistics.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/subscriptions',
        name: 'SubscriptionList',
        component: SubscriptionList
    },
    {
        path: '/subscriptions/add',
        name: 'SubscriptionAdd',
        component: SubscriptionAdd
    },
    {
        path: '/subscriptions/edit/:id',
        name: 'SubscriptionEdit',
        component: SubscriptionAdd
    },
    {
        path: '/reminders',
        name: 'ReminderCenter',
        component: ReminderCenter
    },
    {
        path: '/statistics',
        name: 'Statistics',
        component: Statistics
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
