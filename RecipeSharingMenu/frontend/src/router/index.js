import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetail.vue')
  },
  {
    path: '/recipe/create',
    name: 'CreateRecipe',
    component: () => import('../views/CreateRecipe.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipe/edit/:id',
    name: 'EditRecipe',
    component: () => import('../views/CreateRecipe.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-recipes',
    name: 'MyRecipes',
    component: () => import('../views/MyRecipes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/menu',
    name: 'MenuPlan',
    component: () => import('../views/MenuPlan.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/shopping-list',
    name: 'ShoppingList',
    component: () => import('../views/ShoppingList.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
