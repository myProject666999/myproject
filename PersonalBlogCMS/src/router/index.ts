import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/BlogLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../pages/blog/HomePage.vue') },
      { path: 'article/:id', name: 'article', component: () => import('../pages/blog/ArticleDetail.vue') },
      { path: 'archive', name: 'archive', component: () => import('../pages/blog/ArchivePage.vue') },
      { path: 'category/:id', name: 'category', component: () => import('../pages/blog/CategoryPage.vue') },
      { path: 'search', name: 'search', component: () => import('../pages/blog/SearchPage.vue') },
      { path: 'about', name: 'about', component: () => import('../pages/blog/AboutPage.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../pages/admin/DashboardPage.vue') },
      { path: 'articles', name: 'admin-articles', component: () => import('../pages/admin/ArticleListPage.vue') },
      { path: 'articles/create', name: 'admin-article-create', component: () => import('../pages/admin/ArticleEditPage.vue') },
      { path: 'articles/edit/:id', name: 'admin-article-edit', component: () => import('../pages/admin/ArticleEditPage.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('../pages/admin/CategoryPage.vue') },
      { path: 'comments', name: 'admin-comments', component: () => import('../pages/admin/CommentPage.vue') },
    ],
  },
  { path: '/login', name: 'login', component: () => import('../pages/LoginPage.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
