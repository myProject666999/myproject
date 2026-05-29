import { createRouter, createWebHistory } from 'vue-router'
import MapMonitor from '@/pages/Dashboard/MapMonitor.vue'
import LowStockList from '@/pages/LowStock/LowStockList.vue'
import TaskList from '@/pages/Replenishment/TaskList.vue'
import CheckList from '@/pages/StockCheck/CheckList.vue'
import SalesAnalysis from '@/pages/Sales/SalesAnalysis.vue'
import ContainerList from '@/pages/Container/ContainerList.vue'
import ProductList from '@/pages/Product/ProductList.vue'
import ReplenisherList from '@/pages/Replenisher/ReplenisherList.vue'
import Profile from '@/pages/User/Profile.vue'
import Settings from '@/pages/User/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MapMonitor,
    meta: { title: '货柜地图监控' },
  },
  {
    path: '/low-stock',
    name: 'low-stock',
    component: LowStockList,
    meta: { title: '缺货预警' },
  },
  {
    path: '/replenishment',
    name: 'replenishment',
    component: TaskList,
    meta: { title: '补货任务' },
  },
  {
    path: '/stock-check',
    name: 'stock-check',
    component: CheckList,
    meta: { title: '盘点核对' },
  },
  {
    path: '/sales',
    name: 'sales',
    component: SalesAnalysis,
    meta: { title: '销售分析' },
  },
  {
    path: '/containers',
    name: 'containers',
    component: ContainerList,
    meta: { title: '货柜管理' },
  },
  {
    path: '/products',
    name: 'products',
    component: ProductList,
    meta: { title: '商品管理' },
  },
  {
    path: '/replenishers',
    name: 'replenishers',
    component: ReplenisherList,
    meta: { title: '补货员管理' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { title: '个人中心' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { title: '系统设置' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 无人智能货柜补货调度系统`
  }
  next()
})

export default router
