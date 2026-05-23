import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const path = window.location.pathname
const match = path.match(/^\/s\/([a-f0-9]+)$/i)
if (match) {
  window.location.replace('/#/share/' + match[1])
}

createApp(App).use(router).mount('#app')
