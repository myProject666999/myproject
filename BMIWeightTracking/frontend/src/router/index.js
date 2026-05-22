import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Entry from '../views/Entry.vue'
import Trend from '../views/Trend.vue'
import Goal from '../views/Goal.vue'
import Reminder from '../views/Reminder.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/entry' },
  { path: '/login', component: Login, meta: { noAuth: true } },
  { path: '/entry', component: Entry, meta: { title: '录入' } },
  { path: '/trend', component: Trend, meta: { title: '趋势' } },
  { path: '/goal', component: Goal, meta: { title: '目标' } },
  { path: '/reminder', component: Reminder, meta: { title: '提醒' } }
]

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {
  if (to.meta.noAuth) return next()
  if (!localStorage.getItem('token')) {
    return next('/login')
  }
  next()
})

export default router
