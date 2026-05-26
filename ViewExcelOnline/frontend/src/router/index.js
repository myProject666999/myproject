import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue'
import Viewer from '../views/Viewer.vue'
import Share from '../views/Share.vue'

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/view/:id',
    name: 'Viewer',
    component: Viewer
  },
  {
    path: '/share/:token',
    name: 'Share',
    component: Share
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
