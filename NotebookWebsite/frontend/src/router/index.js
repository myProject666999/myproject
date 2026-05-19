import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/notebooks'
  },
  {
    path: '/notebooks',
    name: 'Notebooks',
    component: () => import('../views/NotebookView.vue')
  },
  {
    path: '/notebook/:notebookId',
    name: 'NotebookDetail',
    component: () => import('../views/NotebookView.vue')
  },
  {
    path: '/page/:pageId',
    name: 'PageEditor',
    component: () => import('../views/PageEditor.vue')
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('../views/SearchResults.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/FavoritesView.vue')
  },
  {
    path: '/recycle-bin',
    name: 'RecycleBin',
    component: () => import('../views/RecycleBinView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
