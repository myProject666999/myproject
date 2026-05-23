import request from './request'

export const getCart = () => request.get('/cart')

export const getCartSummary = () => request.get('/cart/summary')

export const addToCart = (dishId, quantity) => request.post('/cart/add', null, {
  params: { dishId, quantity }
})

export const updateCartItem = (dishId, quantity) => request.put('/cart/update', null, {
  params: { dishId, quantity }
})

export const removeFromCart = (dishId) => request.delete(`/cart/remove/${dishId}`)

export const clearCart = () => request.delete('/cart/clear')
