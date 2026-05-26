import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import UploadPage from './pages/UploadPage.vue'
import TaskListPage from './pages/TaskListPage.vue'
import ProgressPage from './pages/ProgressPage.vue'

const routes = [
  { path: '/', component: UploadPage, meta: { title: '文件上传' } },
  { path: '/tasks', component: TaskListPage, meta: { title: '任务列表' } },
  { path: '/progress/:id', component: ProgressPage, meta: { title: '转码进度', props: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '在线转码'} - 音视频转码系统`
  next()
})

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.mount('#app')
