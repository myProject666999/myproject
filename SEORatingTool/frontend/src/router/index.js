import { createRouter, createWebHistory } from 'vue-router'
import Analyze from '../views/Analyze.vue'
import Report from '../views/Report.vue'
import History from '../views/History.vue'

const routes = [
  { path: '/', component: Analyze },
  { path: '/report/:id', component: Report },
  { path: '/history', component: History }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
