import { createRouter, createWebHashHistory } from 'vue-router'
import NetworkList from '../views/NetworkList.vue'
import NetworkDetail from '../views/NetworkDetail.vue'
import Scan from '../views/Scan.vue'
import Share from '../views/Share.vue'

const routes = [
  { path: '/', name: 'list', component: NetworkList },
  { path: '/networks/:id', name: 'detail', component: NetworkDetail, props: true },
  { path: '/scan', name: 'scan', component: Scan },
  { path: '/s/:token', name: 'share', component: Share, props: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
