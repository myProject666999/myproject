import { createRouter, createWebHashHistory } from 'vue-router'
import EntryView from '../views/EntryView.vue'
import StatsView from '../views/StatsView.vue'
import GoalView from '../views/GoalView.vue'

const routes = [
  {
    path: '/',
    name: 'Entry',
    component: EntryView
  },
  {
    path: '/stats',
    name: 'Stats',
    component: StatsView
  },
  {
    path: '/goal',
    name: 'Goal',
    component: GoalView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
