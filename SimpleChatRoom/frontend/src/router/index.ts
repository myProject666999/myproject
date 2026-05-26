import { createRouter, createWebHistory } from 'vue-router'
import RoomList from '@/pages/RoomList.vue'
import ChatRoom from '@/pages/ChatRoom.vue'

const routes = [
  {
    path: '/',
    name: 'RoomList',
    component: RoomList,
  },
  {
    path: '/chat/:roomId',
    name: 'ChatRoom',
    component: ChatRoom,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
