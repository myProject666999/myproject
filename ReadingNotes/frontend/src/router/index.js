import { createRouter, createWebHistory } from 'vue-router'
import Books from '../views/Books.vue'
import Notes from '../views/Notes.vue'
import Review from '../views/Review.vue'

const routes = [
  { path: '/', component: Books },
  { path: '/notes', component: Notes },
  { path: '/notes/book/:bookId', component: Notes, props: true },
  { path: '/review', component: Review }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
