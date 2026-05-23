<template>
  <div class="menu-view">
    <div class="header">
      <span class="table-info" v-if="tableStore.currentTable">
        📍 {{ tableStore.tableNo }}号桌
      </span>
      <span class="table-info" v-else>
        请扫码绑定桌台
      </span>
    </div>
    
    <div class="main-content">
      <div class="category-sidebar">
        <div 
          v-for="cat in categories" 
          :key="cat.id"
          :class="['category-item', { active: currentCategoryId === cat.id }]"
          @click="selectCategory(cat.id)"
        >
          <span class="icon">{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </div>
      </div>
      
      <div class="dish-list">
        <div 
          v-for="dish in dishes" 
          :key="dish.id"
          class="dish-item"
        >
          <div class="dish-image" v-if="dish.image">
            <img :src="dish.image" :alt="dish.name" />
          </div>
          <div class="dish-image placeholder" v-else>
            🍽️
          </div>
          <div class="dish-info">
            <h3 class="dish-name">{{ dish.name }}</h3>
            <p class="dish-desc">{{ dish.description }}</p>
            <div class="dish-bottom">
              <span class="price">¥{{ dish.price }}</span>
              <div class="cart-control">
                <button class="btn-minus" @click="decreaseQuantity(dish)" v-if="getCartCount(dish.id) > 0">-</button>
                <span class="quantity" v-if="getCartCount(dish.id) > 0">{{ getCartCount(dish.id) }}</span>
                <button class="btn-plus" @click="increaseQuantity(dish)">+</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="dishes.length === 0" class="empty">
          暂无菜品
        </div>
      </div>
    </div>
    
    <div class="cart-bar" @click="goToCart">
      <div class="cart-icon">
        🛒
        <span class="badge" v-if="cartStore.totalCount > 0">{{ cartStore.totalCount }}</span>
      </div>
      <div class="cart-info">
        <span class="total">¥{{ cartStore.totalAmount }}</span>
      </div>
      <button class="checkout-btn" :disabled="cartStore.totalCount === 0">去结算</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getCategories, getDishesByCategory } from '../api/dish'
import { useCartStore } from '../store/cart'
import { useTableStore } from '../store/table'

const router = useRouter()
const cartStore = useCartStore()
const tableStore = useTableStore()

const categories = ref([])
const dishes = ref([])
const currentCategoryId = ref(null)

const getCartCount = (dishId) => {
  const item = cartStore.items.find(i => i.dishId === dishId)
  return item ? item.quantity : 0
}

const selectCategory = async (categoryId) => {
  currentCategoryId.value = categoryId
  dishes.value = await getDishesByCategory(categoryId)
}

const increaseQuantity = async (dish) => {
  if (!tableStore.currentTable) {
    showToast('请先扫码绑定桌台')
    return
  }
  await cartStore.addItem(dish.id, 1)
}

const decreaseQuantity = async (dish) => {
  const currentQty = getCartCount(dish.id)
  if (currentQty > 1) {
    await cartStore.updateItem(dish.id, currentQty - 1)
  } else {
    await cartStore.removeItem(dish.id)
  }
}

const goToCart = () => {
  if (cartStore.totalCount > 0) {
    router.push('/cart')
  }
}

onMounted(async () => {
  await tableStore.loadCurrentTable()
  await cartStore.loadCart()
  categories.value = await getCategories()
  if (categories.value.length > 0) {
    await selectCategory(categories.value[0].id)
  }
})
</script>

<style scoped>
.menu-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  padding: 16px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.table-info {
  font-size: 18px;
  font-weight: 500;
}

.main-content {
  display: flex;
  height: calc(100vh - 120px);
}

.category-sidebar {
  width: 90px;
  background: #fff;
  overflow-y: auto;
  border-right: 1px solid #eee;
}

.category-item {
  padding: 16px 8px;
  text-align: center;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.category-item.active {
  background: #fff5f5;
  color: #ff6b6b;
  font-weight: 500;
}

.category-item .icon {
  font-size: 20px;
}

.dish-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.dish-item {
  display: flex;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.dish-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dish-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.dish-desc {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.dish-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: 600;
}

.cart-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-plus, .btn-minus {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
  min-width: 20px;
  text-align: center;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px;
}

.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #333;
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.cart-icon {
  font-size: 28px;
  position: relative;
}

.badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ff6b6b;
  color: white;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.cart-info {
  flex: 1;
}

.total {
  font-size: 20px;
  font-weight: 600;
  color: #ffd700;
}

.checkout-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
