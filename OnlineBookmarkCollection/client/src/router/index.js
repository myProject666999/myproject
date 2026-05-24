import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('../views/BookmarkList.vue'), name: 'list' },
  { path: '/add', component: () => import('../views/BookmarkAdd.vue'), name: 'add' },
  { path: '/folders', component: () => import('../views/FolderManage.vue'), name: 'folders' },
  { path: '/search', component: () => import('../views/Search.vue'), name: 'search' },
  { path: '/settings', component: () => import('../views/Settings.vue'), name: 'settings' }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
