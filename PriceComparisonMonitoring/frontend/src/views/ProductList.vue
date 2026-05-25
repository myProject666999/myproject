<template>
  <div>
    <div class="page-header">
      <h2>监控列表</h2>
      <div>
        <el-button type="primary" @click="$router.push('/products/add')">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>
    </div>
    
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="card-container" style="padding: 12px;">
          <div
            class="group-item"
            :class="{ active: currentGroup === null && !filterFavorite }"
            @click="handleSelectAll"
          >
            <span class="group-icon">📦</span>
            <span class="group-name">全部商品</span>
            <span class="group-count">{{ totalCount }}</span>
          </div>
          
          <div
            v-for="group in groups"
            :key="group.id"
            class="group-item"
            :class="{ active: currentGroup === group.id }"
            @click="handleSelectGroup(group.id)"
          >
            <span class="group-icon">{{ group.icon || '📁' }}</span>
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">{{ group.product_count }}</span>
          </div>
          
          <el-divider style="margin: 12px 0;" />
          
          <div
            class="group-item"
            :class="{ active: filterFavorite }"
            @click="handleToggleFavorite"
          >
            <span class="group-icon">⭐</span>
            <span class="group-name">我的收藏</span>
          </div>
        </div>
      </el-col>
      
      <el-col :span="20">
        <div class="card-container">
          <div class="search-bar">
            <el-input
              v-model="keyword"
              placeholder="搜索商品名称"
              clearable
              style="width: 300px;"
              @keyup.enter="loadProducts"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select v-model="statusFilter" placeholder="状态" style="width: 120px;" @change="loadProducts">
              <el-option label="全部" value="" />
              <el-option label="监控中" value="1" />
              <el-option label="已停止" value="0" />
            </el-select>
            
            <el-button type="primary" @click="loadProducts">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>
          
          <div v-if="products.length === 0" class="empty-state">
            <el-icon class="empty-icon"><ShoppingCart /></el-icon>
            <p class="empty-text">暂无商品</p>
            <el-button type="primary" style="margin-top: 16px;" @click="$router.push('/products/add')">
              添加第一个商品
            </el-button>
          </div>
          
          <el-row v-else :gutter="16">
            <el-col v-for="product in products" :key="product.id" :span="6">
              <div class="product-card" @click="$router.push(`/products/${product.id}`)">
                <img
                  v-if="product.image_url"
                  :src="product.image_url"
                  class="product-image"
                  alt=""
                />
                <div v-else class="product-image" style="display: flex; align-items: center; justify-content: center;">
                  <el-icon :size="48"><ShoppingBag /></el-icon>
                </div>
                
                <h3 class="product-title" :title="product.title">{{ product.title }}</h3>
                
                <div class="product-price">
                  <span class="currency">¥</span>
                  {{ product.current_price?.toFixed(2) || '--' }}
                </div>
                
                <div v-if="product.original_price" class="product-original-price">
                  ¥{{ product.original_price.toFixed(2) }}
                </div>
                
                <div class="product-meta">
                  <span
                    v-if="product.lowest_price && product.current_price <= product.lowest_price"
                    class="price-change down"
                  >
                    历史最低
                  </span>
                  <span
                    v-else-if="product.highest_price && product.current_price >= product.highest_price"
                    class="price-change up"
                  >
                    历史最高
                  </span>
                  
                  <div>
                    <el-icon
                      style="cursor: pointer; color: #e6a23c;"
                      @click.stop="toggleFavorite(product)"
                    >
                      <component :is="product.is_favorite ? 'StarFilled' : 'Star'" />
                    </el-icon>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          
          <div v-if="total > pageSize" style="text-align: center; margin-top: 20px;">
            <el-pagination
              v-model:current-page="page"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="loadProducts"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productApi, groupApi } from '@/api'
import { ElMessage } from 'element-plus'

const products = ref([])
const groups = ref([])
const currentGroup = ref(null)
const filterFavorite = ref(false)
const keyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const totalCount = ref(0)

onMounted(() => {
  loadGroups()
  loadProducts()
})

const loadGroups = async () => {
  try {
    const res = await groupApi.getList()
    groups.value = res.data || []
    totalCount.value = groups.value.reduce((sum, g) => sum + (g.product_count || 0), 0)
  } catch (e) {
    console.error(e)
  }
}

const loadProducts = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    
    if (currentGroup.value) {
      params.group_id = currentGroup.value
    }
    if (filterFavorite.value) {
      params.is_favorite = 1
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    
    const res = await productApi.getList(params)
    products.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  }
}

const toggleFavorite = async (product) => {
  try {
    await productApi.toggleFavorite(product.id)
    product.is_favorite = product.is_favorite ? 0 : 1
    ElMessage.success(product.is_favorite ? '已收藏' : '已取消收藏')
  } catch (e) {
    console.error(e)
  }
}

const handleSelectAll = () => {
  currentGroup.value = null
  filterFavorite.value = false
  page.value = 1
  loadProducts()
}

const handleSelectGroup = (groupId) => {
  currentGroup.value = groupId
  filterFavorite.value = false
  page.value = 1
  loadProducts()
}

const handleToggleFavorite = () => {
  filterFavorite.value = !filterFavorite.value
  currentGroup.value = null
  page.value = 1
  loadProducts()
}
</script>

<style scoped lang="scss">
.product-card {
  margin-bottom: 16px;
  
  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
