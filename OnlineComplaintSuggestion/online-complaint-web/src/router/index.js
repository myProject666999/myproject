import { createRouter, createWebHistory } from 'vue-router'
import Submit from '../views/Submit.vue'
import MyComplaints from '../views/MyComplaints.vue'
import Detail from '../views/Detail.vue'
import Admin from '../views/Admin.vue'
import Statistics from '../views/Statistics.vue'

const routes = [
  { path: '/', redirect: '/submit' },
  { path: '/submit', name: 'Submit', component: Submit },
  { path: '/my', name: 'MyComplaints', component: MyComplaints },
  { path: '/detail/:id', name: 'Detail', component: Detail, props: true },
  { path: '/admin', name: 'Admin', component: Admin },
  { path: '/statistics', name: 'Statistics', component: Statistics }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
