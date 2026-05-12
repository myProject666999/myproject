
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const Layout = () => import('@/views/layout/Layout.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '工作台', icon: 'HomeFilled' }
      }
    ]
  },
  {
    path: '/member',
    component: Layout,
    redirect: '/member/list',
    meta: { title: '会员管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'MemberList',
        component: () => import('@/views/member/MemberList.vue'),
        meta: { title: '会员档案', icon: 'UserFilled' }
      },
      {
        path: 'card',
        name: 'MemberCard',
        component: () => import('@/views/member/MemberCard.vue'),
        meta: { title: '会员卡管理', icon: 'CreditCard' }
      }
    ]
  },
  {
    path: '/appointment',
    component: Layout,
    redirect: '/appointment/list',
    meta: { title: '预约管理', icon: 'Calendar' },
    children: [
      {
        path: 'list',
        name: 'AppointmentList',
        component: () => import('@/views/appointment/AppointmentList.vue'),
        meta: { title: '预约列表', icon: 'Calendar' }
      },
      {
        path: 'schedule',
        name: 'TechnicianSchedule',
        component: () => import('@/views/appointment/TechnicianSchedule.vue'),
        meta: { title: '技师排班', icon: 'Schedule' }
      }
    ]
  },
  {
    path: '/cashier',
    component: Layout,
    redirect: '/cashier/desk',
    meta: { title: '收银管理', icon: 'Wallet' },
    children: [
      {
        path: 'desk',
        name: 'CashierDesk',
        component: () => import('@/views/cashier/CashierDesk.vue'),
        meta: { title: '收银台', icon: 'Money' }
      },
      {
        path: 'order',
        name: 'OrderList',
        component: () => import('@/views/cashier/OrderList.vue'),
        meta: { title: '订单管理', icon: 'Tickets' }
      }
    ]
  },
  {
    path: '/finance',
    component: Layout,
    redirect: '/finance/recharge',
    meta: { title: '财务管理', icon: 'Money' },
    children: [
      {
        path: 'recharge',
        name: 'RechargeRecord',
        component: () => import('@/views/finance/RechargeRecord.vue'),
        meta: { title: '充值记录', icon: 'Wallet' }
      },
      {
        path: 'consumption',
        name: 'ConsumptionRecord',
        component: () => import('@/views/finance/ConsumptionRecord.vue'),
        meta: { title: '消费记录', icon: 'Histogram' }
      },
      {
        path: 'commission',
        name: 'CommissionManage',
        component: () => import('@/views/finance/CommissionManage.vue'),
        meta: { title: '提成管理', icon: 'Money' }
      }
    ]
  },
  {
    path: '/report',
    component: Layout,
    redirect: '/report/daily',
    meta: { title: '报表管理', icon: 'DataAnalysis' },
    children: [
      {
        path: 'daily',
        name: 'DailyReport',
        component: () => import('@/views/report/DailyReport.vue'),
        meta: { title: '营业日报', icon: 'Histogram' }
      },
      {
        path: 'member',
        name: 'MemberReport',
        component: () => import('@/views/report/MemberReport.vue'),
        meta: { title: '会员分析', icon: 'User' }
      }
    ]
  },
  {
    path: '/base',
    component: Layout,
    redirect: '/base/employee',
    meta: { title: '基础信息', icon: 'Document' },
    children: [
      {
        path: 'employee',
        name: 'EmployeeManage',
        component: () => import('@/views/base/EmployeeManage.vue'),
        meta: { title: '员工管理', icon: 'UserFilled' }
      },
      {
        path: 'service',
        name: 'ServiceManage',
        component: () => import('@/views/base/ServiceManage.vue'),
        meta: { title: '服务项目', icon: 'Service' }
      },
      {
        path: 'product',
        name: 'ProductManage',
        component: () => import('@/views/base/ProductManage.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views/system/UserManage.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'role',
        name: 'RoleManage',
        component: () => import('@/views/system/RoleManage.vue'),
        meta: { title: '角色管理', icon: 'Peoples' }
      },
      {
        path: 'permission',
        name: 'PermissionManage',
        component: () => import('@/views/system/PermissionManage.vue'),
        meta: { title: '权限管理', icon: 'Key' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.path === '/login') {
    if (userStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    if (!userStore.isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  }
})

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} - 美容美发管理系统` : '美容美发管理系统'
})

export default router
