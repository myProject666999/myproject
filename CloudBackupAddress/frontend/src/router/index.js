import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue'
import Versions from '../views/Versions.vue'
import Compare from '../views/Compare.vue'
import Download from '../views/Download.vue'

const routes = [
  { path: '/', redirect: '/upload' },
  { path: '/upload', component: Upload },
  { path: '/versions', component: Versions },
  { path: '/compare', component: Compare },
  { path: '/download', component: Download }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
