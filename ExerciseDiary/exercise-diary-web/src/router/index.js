import { createRouter, createWebHashHistory } from 'vue-router'
import Today from '../views/Today.vue'
import History from '../views/History.vue'
import Statistics from '../views/Statistics.vue'

const routes = [
  { path: '/', redirect: '/today' },
  { path: '/today', component: Today, meta: { title: '今日运动' } },
  { path: '/history', component: History, meta: { title: '历史记录' } },
  { path: '/statistics', component: Statistics, meta: { title: '统计' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
