<template>
  <div class="page-container">
    <div class="app-header">🥬 鲜时达 · 新鲜蔬菜</div>
    
    <div class="category-tabs">
      <div
        class="category-tab"
        :class="{ active: !selectedCategory }"
        @click="selectCategory(null)"
      >
        全部
      </div>
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </div>
    </div>
    
    <div class="product-grid">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-card"
        @click="goToDetail(product.id)"
      >
        <div class="product-image">🥗</div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-origin">{{ product.origin }}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
              <span class="product-unit">
                /{{ product.price_unit === 'weight' ? 'kg' : '份' }}
              </span>
            </div>
            <button
              class="add-btn"
              @click.stop="addToCart(product)"
            >+</button>
          </div>
          <div v-if="product.today_stock !== undefined" class="product-stock">
            今日库存: {{ product.today_stock }}
            {{ product.price_unit === 'weight' ? 'kg' : '份' }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="products.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">🥬</div>
      <div>暂无商品</div>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { categoryApi, productApi, cartApi } from '../api'
import { useUserStore } from '../stores/user'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()

const categories = ref([])
const products = ref([])
const selectedCategory = ref(null)
const loading = ref(false)

async function loadCategories() {
  try {
    const res = await categoryApi.getCategories()
    categories.value = res.categories || []
  } catch (e) {}
}

async function loadProducts() {
  loading.value = true
  try {
    const params = { page: 1, page_size: 50 }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }
    const res = await productApi.getProducts(params)
    products.value = res.products || []
  } catch (e) {}
  loading.value = false
}

function selectCategory(id) {
  selectedCategory.value = id
  loadProducts()
}

function goToDetail(id) {
  router.push(`/product/${id}`)
}

async function addToCart(product) {
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
      product_id: product.id,
      quantity: product.price_unit === 'piece' ? 1 : 0.5,
    })
    showToast('已加入购物车')
  } catch (e) {}
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>
