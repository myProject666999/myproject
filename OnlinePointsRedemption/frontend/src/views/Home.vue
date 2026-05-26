<template>
  <div class="home-page">
    <div class="banner">
      <div class="banner-content">
        <h1>积分商城</h1>
        <p>好礼兑不停 · 积分换好物</p>
        <el-button type="primary" size="large" @click="$router.push('/points/detail')">
          查看我的积分
        </el-button>
      </div>
    </div>

    <div class="category-tabs">
      <el-tabs v-model="activeCategory" class="product-tabs">
        <el-tab-pane label="全部" name="0" />
        <el-tab-pane
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.category_name"
          :name="String(cat.id)"
        />
      </el-tabs>
    </div>

    <div class="product-grid">
      <el-card
        v-for="product in products"
        :key="product.id"
        class="product-card"
        shadow="hover"
        @click="$router.push(`/product/${product.id}`)"
      >
        <div class="product-image">
          <div class="image-placeholder">
            <el-icon :size="64"><Goods /></el-icon>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.product_name }}</h3>
          <p class="product-desc">{{ product.description }}</p>
          <div class="product-price">
            <span class="points">{{ product.points_price }}</span>
            <span class="points-label">积分</span>
            <span class="original-price">¥{{ product.original_price }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadProducts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getProducts, getCategories } from '@/api'

const products = ref([])
const categories = ref([])
const activeCategory = ref('0')
const page = ref(1)
const pageSize = ref(8)
const total = ref(0)

async function loadCategories() {
  try {
    const res = await getCategories()
    if (res.code === 0) {
      categories.value = res.data || []
    }
  } catch (e) {
    categories.value = [
      { id: 1, category_name: '实物商品' },
      { id: 2, category_name: '虚拟权益' }
    ]
  }
}

async function loadProducts() {
  try {
    const res = await getProducts({
      page: page.value,
      page_size: pageSize.value,
      category_id: activeCategory.value === '0' ? 0 : activeCategory.value
    })
    if (res.code === 0) {
      products.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } catch (e) {
    products.value = getMockProducts()
    total.value = products.value.length
  }
}

function getMockProducts() {
  return [
    { id: 1, product_name: '精美马克杯', description: '陶瓷马克杯，容量350ml', points_price: 500, original_price: 29.90 },
    { id: 2, product_name: '蓝牙耳机', description: '真无线蓝牙耳机，降噪功能', points_price: 5000, original_price: 299.00 },
    { id: 3, product_name: '50元优惠券', description: '全场通用优惠券，满200减50', points_price: 2000, original_price: 50.00 },
    { id: 4, product_name: 'VIP月卡', description: '平台VIP会员一个月', points_price: 3000, original_price: 30.00 },
    { id: 5, product_name: '笔记本', description: 'A5精装笔记本', points_price: 800, original_price: 39.90 },
    { id: 6, product_name: '保温杯', description: '不锈钢保温杯，500ml', points_price: 1500, original_price: 89.00 },
    { id: 7, product_name: '数据线', description: 'Type-C 快充数据线 1米', points_price: 600, original_price: 19.90 },
    { id: 8, product_name: '10元优惠券', description: '无门槛优惠券', points_price: 500, original_price: 10.00 }
  ]
}

watch(activeCategory, () => {
  page.value = 1
  loadProducts()
})

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style lang="scss" scoped>
.home-page {
  .banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 48px 32px;
    color: #fff;
    margin-bottom: 24px;
    text-align: center;

    h1 {
      font-size: 36px;
      margin: 0 0 12px;
    }

    p {
      font-size: 18px;
      opacity: 0.9;
      margin: 0 0 24px;
    }
  }

  .category-tabs {
    margin-bottom: 24px;

    .product-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  .product-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border-radius: 12px;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }
  }

  .product-image {
    width: 100%;
    height: 160px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin-bottom: 12px;

    .image-placeholder {
      color: #c0c4cc;
    }
  }

  .product-info {
    .product-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-desc {
      font-size: 13px;
      color: #909399;
      margin: 0 0 12px;
      height: 38px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .points {
        font-size: 22px;
        font-weight: 700;
        color: #f59e0b;
      }

      .points-label {
        font-size: 13px;
        color: #f59e0b;
      }

      .original-price {
        font-size: 13px;
        color: #c0c4cc;
        text-decoration: line-through;
        margin-left: auto;
      }
    }
  }

  .pagination-wrap {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}
</style>
