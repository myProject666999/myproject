import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'RecipeList',
    component: () => import('../views/RecipeList.vue')
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetail.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue')
  },
  {
    path: '/add',
    name: 'AddRecipe',
    component: () => import('../views/AddRecipe.vue')
  },
  {
    path: '/edit/:id',
    name: 'EditRecipe',
    component: () => import('../views/AddRecipe.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
