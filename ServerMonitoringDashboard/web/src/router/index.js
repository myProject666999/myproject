import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import NodeDetail from '../views/NodeDetail.vue'
import Nodes from '../views/Nodes.vue'
import Alerts from '../views/Alerts.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/nodes', name: 'Nodes', component: Nodes },
  { path: '/nodes/:id', name: 'NodeDetail', component: NodeDetail, props: true },
  { path: '/alerts', name: 'Alerts', component: Alerts }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
