import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import TestPage from './views/TestPage.vue'
import ReportPage from './views/ReportPage.vue'
import MonitorList from './views/MonitorList.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/test' },
    { path: '/test', component: TestPage, meta: { title: '速度测试' } },
    { path: '/report', component: ReportPage, meta: { title: '测试报告' } },
    { path: '/monitor', component: MonitorList, meta: { title: '定时监测' } },
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
