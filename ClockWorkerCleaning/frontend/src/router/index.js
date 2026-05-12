import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/user/Home.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/packages',
    name: 'Packages',
    component: () => import('@/views/user/Packages.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/packages/:id',
    name: 'PackageDetail',
    component: () => import('@/views/user/PackageDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/workers',
    name: 'Workers',
    component: () => import('@/views/user/Workers.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/workers/:id',
    name: 'WorkerDetail',
    component: () => import('@/views/user/WorkerDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bookings/create',
    name: 'CreateBooking',
    component: () => import('@/views/user/CreateBooking.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: () => import('@/views/user/Bookings.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bookings/:id',
    name: 'BookingDetail',
    component: () => import('@/views/user/BookingDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bookings/:id/photos',
    name: 'ServicePhotos',
    component: () => import('@/views/user/ServicePhotos.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('@/views/user/Coupons.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/worker',
    name: 'WorkerHome',
    component: () => import('@/views/worker/WorkerHome.vue'),
    meta: { requiresAuth: true, worker: true },
  },
  {
    path: '/worker/bookings',
    name: 'WorkerBookings',
    component: () => import('@/views/worker/WorkerBookings.vue'),
    meta: { requiresAuth: true, worker: true },
  },
  {
    path: '/worker/hours',
    name: 'WorkerHours',
    component: () => import('@/views/worker/WorkerHours.vue'),
    meta: { requiresAuth: true, worker: true },
  },
  {
    path: '/worker/salaries',
    name: 'WorkerSalaries',
    component: () => import('@/views/worker/WorkerSalaries.vue'),
    meta: { requiresAuth: true, worker: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.worker && !userStore.isWorker) {
    next({ path: '/home' });
    return;
  }

  if (to.meta.guest && userStore.isLoggedIn) {
    next({ path: '/home' });
    return;
  }

  next();
});

export default router;
