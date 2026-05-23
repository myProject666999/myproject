import { defineStore } from 'pinia'
import { getCartSummary, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    totalAmount: 0,
    totalCount: 0
  }),
  
  getters: {
    cartCount: (state) => state.totalCount
  },
  
  actions: {
    async loadCart() {
      try {
        const data = await getCartSummary()
        this.items = data.items || []
        this.totalAmount = data.totalAmount || 0
        this.totalCount = data.totalCount || 0
      } catch (e) {
        console.error('加载购物车失败', e)
      }
    },
    
    async addItem(dishId, quantity = 1) {
      await addToCart(dishId, quantity)
      await this.loadCart()
    },
    
    async updateItem(dishId, quantity) {
      await updateCartItem(dishId, quantity)
      await this.loadCart()
    },
    
    async removeItem(dishId) {
      await removeFromCart(dishId)
      await this.loadCart()
    },
    
    async clear() {
      await clearCart()
      this.items = []
      this.totalAmount = 0
      this.totalCount = 0
    }
  }
})
