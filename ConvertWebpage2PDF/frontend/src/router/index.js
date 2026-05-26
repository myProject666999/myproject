import { createRouter, createWebHistory } from 'vue-router'
import Convert from '../views/Convert.vue'
import History from '../views/History.vue'

const routes = [
  { path: '/', redirect: '/convert' },
  { path: '/convert', component: Convert, meta: { title: '网页转PDF' } },
  { path: '/history', component: History, meta: { title: '转换历史' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '网页转PDF'
  next()
})

export default router
