<template>
  <div class="page-container">
    <div class="app-header">🛒 购物车</div>
    
    <div v-if="cartItems.length > 0" style="padding: 12px;">
      <div
        v-for="item in cartItems"
        :key="item.id"
        class="cart-item"
      >
        <van-checkbox
          :model-value="item.selected"
          @update:model-value="toggleSelect(item, $event)"
          style="margin-right: 12px;"
        />
        <div class="cart-item-image">🥗</div>
        <div class="cart-item-info" style="flex: 1;">
          <div class="cart-item-name">{{ item.product?.name }}</div>
          <div class="cart-item-price">
            ¥{{ item.product?.price.toFixed(2) }}
            /{{ item.product?.price_unit === 'weight' ? 'kg' : '份' }}
          </div>
        </div>
        <div class="quantity-control">
          <button class="quantity-btn" @click="decreaseItem(item)">-</button>
          <span class="quantity-value">{{ item.quantity }}</span>
          <button class="quantity-btn" @click="increaseItem(item)">+</button>
        </div>
      </div>
      
      <div style="background: white; border-radius: 8px; padding: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
        <van-checkbox
          :model-value="allSelected"
          @update:model-value="toggleAll"
        >
          全选
        </van-checkbox>
        <button
          class="submit-btn"
          :disabled="selectedCount === 0"
          @click="goCheckout"
          style="opacity: selectedCount === 0 ? 0.5 : 1;"
        >
          去结算({{ selectedCount }})
        </button>
      </div>
      
      <div style="text-align: center; margin-top: 12px;">
        <van-button size="small" type="danger" plain @click="handleClear">清空购物车</van-button>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">🛒</div>
      <div>购物车是空的</div>
      <van-button style="margin-top: 16px;" type="primary" @click="$router.push('/')">
        去逛逛
      </van-button>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { cartApi } from '../api'
import TabBar from '../components/TabBar.vue'

const router = useRouter()

const cartItems = ref([])

const allSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
})

const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

async function loadCart() {
  try {
    const res = await cartApi.getCart()
    cartItems.value = res.items || []
  } catch (e) {}
}

async function toggleSelect(item, selected) {
  try {
    await cartApi.updateCartItem(item.id, { selected })
    item.selected = selected
  } catch (e) {}
}

async function toggleAll(selected) {
  try {
    await cartApi.batchUpdateSelect({ selected })
    cartItems.value.forEach(item => item.selected = selected)
  } catch (e) {}
}

async function decreaseItem(item) {
  const unit = item.product?.price_unit === 'piece' ? 1 : 0.1
  const newQty = Math.max(unit, Math.round((item.quantity - unit) * 10) / 10)
  try {
    await cartApi.updateCartItem(item.id, { quantity: newQty })
    item.quantity = newQty
  } catch (e) {}
}

async function increaseItem(item) {
  const unit = item.product?.price_unit === 'piece' ? 1 : 0.1
  const newQty = Math.round((item.quantity + unit) * 10) / 10
  try {
    await cartApi.updateCartItem(item.id, { quantity: newQty })
    item.quantity = newQty
  } catch (e) {}
}

function goCheckout() {
  const selected = cartItems.value.filter(item => item.selected)
  if (selected.length === 0) {
    showToast('请选择商品')
    return
  }
  router.push('/checkout')
}

async function handleClear() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要清空购物车吗？',
    })
    await cartApi.clearCart()
    cartItems.value = []
    showToast('已清空')
  } catch (e) {}
}

onMounted(loadCart)
</script>
