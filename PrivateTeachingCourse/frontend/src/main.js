import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import Vant from 'vant'
import 'vant/lib/index.css'
import './styles/global.css'
import App from './App.vue'
import routesConfig from './router'
import store from './store'

const router = createRouter({
  history: createWebHashHistory(),
  routes: routesConfig
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.use(store)
app.use(Vant)
app.mount('#app')
