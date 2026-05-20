import { createRouter, createWebHistory } from 'vue-router'
import Review from '../views/Review.vue'
import Decks from '../views/Decks.vue'
import NewCard from '../views/NewCard.vue'
import Statistics from '../views/Statistics.vue'
import DeckDetail from '../views/DeckDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Review',
    component: Review
  },
  {
    path: '/decks',
    name: 'Decks',
    component: Decks
  },
  {
    path: '/deck/:id',
    name: 'DeckDetail',
    component: DeckDetail
  },
  {
    path: '/new-card',
    name: 'NewCard',
    component: NewCard
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
