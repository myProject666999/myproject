import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Customer from '../views/Customer.vue'
import Project from '../views/Project.vue'
import Worker from '../views/Worker.vue'
import Material from '../views/Material.vue'
import Progress from '../views/Progress.vue'
import Acceptance from '../views/Acceptance.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/customer',
    name: 'Customer',
    component: Customer
  },
  {
    path: '/project',
    name: 'Project',
    component: Project
  },
  {
    path: '/worker',
    name: 'Worker',
    component: Worker
  },
  {
    path: '/material',
    name: 'Material',
    component: Material
  },
  {
    path: '/progress',
    name: 'Progress',
    component: Progress
  },
  {
    path: '/acceptance',
    name: 'Acceptance',
    component: Acceptance
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
