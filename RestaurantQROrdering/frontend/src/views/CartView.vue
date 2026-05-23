<template>
  <div class="cart-view">
    <div class="header">
      <h2>购物车</h2>
      <span class="table-info">📍 {{ tableStore.tableNo || '未绑定' }}号桌</span>
    </div>
    
    <div class="cart-list" v-if="cartStore.items.length > 0">
      <div v-for="item in cartStore.items" :key="item.dishId" class="cart-item">
        <div class="dish-image" v-if="item.image">
          <img :src="item.image" :alt="item.dishName" />
        </div>
        <div class="dish-image placeholder" v-else>🍽️</div>
        <div class="dish-info">
          <h3 class="dish-name">{{ item.dishName }}</h3>
          <span class="price">¥{{ item.price }}</span>
        </div>
        <div class="cart-control">
          <button class="btn-minus" @click="decreaseQuantity(item)">-</button>
          <span class="quantity">{{ item.quantity }}</span>
          <button class="btn-plus" @click="increaseQuantity(item)">+</button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty">
      <div class="empty-icon">🛒</div>
      <p>购物车是空的</p>
      <button class="back-btn" @click="goToMenu">去点餐</button>
    </div>
    
    <div class="footer" v-if="cartStore.items.length > 0">
      <div class="total-info">
        <span>合计：</span>
        <span class="total-amount">¥{{ cartStore.totalAmount }}</span>
      </div>
      <button class="submit-btn" @click="submitOrder" :loading="submitting">
        提交订单
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { createOrder } from '../api/order'
import { useCartStore } from '../store/cart'
import { useTableStore } from '../store/table'

const router = useRouter()
const cartStore = useCartStore()
const tableStore = useTableStore()
const submitting = ref(false)

const increaseQuantity = async (item) => {
  await cartStore.addItem(item.dishId, 1)
}

const decreaseQuantity = async (item) => {
  if (item.quantity > 1) {
    await cartStore.updateItem(item.dishId, item.quantity - 1)
  } else {
    await cartStore.removeItem(item.dishId)
  }
}

const goToMenu = () => {
  router.push('/menu')
}

const submitOrder = async () => {
  if (!tableStore.currentTable) {
    showToast('请先绑定桌台')
    return
  }
  
  try {
    await showConfirmDialog({
      title: '确认下单',
      message: `确认提交 ¥${cartStore.totalAmount} 的订单？`,
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    
    submitting.value = true
    const items = cartStore.items.map(item => ({
      dishId: item.dishId,
      quantity: item.quantity
    }))
    
    const order = await createOrder({
      tableId: tableStore.tableId,
      items
    })
    
    showToast('下单成功')
    router.push(`/order-status?orderNo=${order.orderNo}`)
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  background: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.table-info {
  color: #666;
  font-size: 14px;
}

.cart-list {
  padding: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.dish-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-info {
  flex: 1;
  margin-left: 12px;
}

.dish-name {
  font-size: 16px;
  margin: 0 0 4px;
}

.price {
  color: #ff6b6b;
  font-weight: 500;
}

.cart-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-plus, .btn-minus {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.btn-plus {
  background: #ff6b6b;
  color: white;
}

.btn-minus {
  background: #f5f5f5;
  color: #666;
}

.quantity {
  font-size: 16px;
  min-width: 24px;
  text-align: center;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.back-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 20px;
  font-size: 16px;
  margin-top: 16px;
  cursor: pointer;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.total-info {
  font-size: 16px;
}

.total-amount {
  color: #ff6b6b;
  font-size: 24px;
  font-weight: 600;
}

.submit-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
</style>
