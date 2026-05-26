<template>
  <div class="page-container">
    <div class="app-header" style="cursor: pointer;" @click="$router.back()">← 返回</div>
    
    <div v-if="product" style="padding: 16px;">
      <div style="background: white; border-radius: 12px; padding: 20px; text-align: center;">
        <div style="font-size: 80px;">🥗</div>
        <h2 style="margin: 16px 0 8px;">{{ product.name }}</h2>
        <p style="color: #666; margin-bottom: 16px;">产地: {{ product.origin }}</p>
        <p style="color: #333; margin-bottom: 16px;">{{ product.description || '新鲜蔬菜，品质保证' }}</p>
        
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px;">
          <span style="font-size: 28px; color: #4CAF50; font-weight: bold;">¥{{ product.price.toFixed(2) }}</span>
          <span style="color: #666;">/{{ product.price_unit === 'weight' ? 'kg' : '份' }}</span>
        </div>
        
        <div v-if="product.today_stock !== undefined" style="color: #ff976a; margin-bottom: 16px;">
          今日库存: {{ product.today_stock }}{{ product.price_unit === 'weight' ? 'kg' : '份' }}
        </div>
      </div>
      
      <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 16px;">
        <h3 style="margin-bottom: 12px;">购买数量</h3>
        <div style="display: flex; align-items: center; gap: 16px;">
          <button class="quantity-btn" @click="decreaseQuantity">-</button>
          <div style="flex: 1; text-align: center;">
            <input
              v-model.number="quantity"
              type="number"
              style="width: 80px; text-align: center; padding: 8px; border: 1px solid #eee; border-radius: 6px;"
              :min="product.price_unit === 'piece' ? 1 : 0.1"
              :step="product.price_unit === 'piece' ? 1 : 0.1"
            />
            <span style="margin-left: 8px;">{{ product.price_unit === 'weight' ? 'kg' : '份' }}</span>
          </div>
          <button class="quantity-btn" @click="increaseQuantity">+</button>
        </div>
        <div style="margin-top: 12px; color: #666; font-size: 13px;">
          小计: ¥{{ (product.price * quantity).toFixed(2) }}
        </div>
      </div>
    </div>
    
    <div class="total-bar">
      <div>
        <span>合计: </span>
        <span class="total-amount">¥{{ (product ? product.price * quantity : 0).toFixed(2) }}</span>
      </div>
      <button class="submit-btn" @click="handleAddToCart">加入购物车</button>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { productApi, cartApi } from '../api'
import { useUserStore } from '../stores/user'
import TabBar from '../components/TabBar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const product = ref(null)
const quantity = ref(1)

function decreaseQuantity() {
  if (product.value) {
    const step = product.value.price_unit === 'piece' ? 1 : 0.1
    const min = product.value.price_unit === 'piece' ? 1 : 0.1
    quantity.value = Math.max(min, Math.round((quantity.value - step) * 10) / 10)
  }
}

function increaseQuantity() {
  if (product.value) {
    const step = product.value.price_unit === 'piece' ? 1 : 0.1
    quantity.value = Math.round((quantity.value + step) * 10) / 10
  }
}

async function handleAddToCart() {
  if (!userStore.isLoggedIn) {
    try {
      await showConfirmDialog({
        title: '提示',
        message: '请先登录后再添加购物车',
        confirmButtonText: '去登录',
      })
      router.push('/login')
    } catch (e) {}
    return
  }
  
  try {
    await cartApi.addToCart({
      product_id: product.value.id,
      quantity: quantity.value,
    })
    showToast('已加入购物车')
  } catch (e) {}
}

onMounted(async () => {
  try {
    const res = await productApi.getProduct(route.params.id)
    product.value = res.product
    quantity.value = product.value.price_unit === 'piece' ? 1 : 0.5
  } catch (e) {}
})
</script>
