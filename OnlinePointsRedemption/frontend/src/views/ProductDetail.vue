<template>
  <div class="product-detail" v-if="product">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品详情</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="32" class="detail-row">
      <el-col :span="12">
        <div class="product-image-large">
          <div class="image-placeholder-large">
            <el-icon :size="128"><Goods /></el-icon>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <h1 class="product-title">{{ product.product_name }}</h1>
        <p class="product-desc">{{ product.description }}</p>

        <div class="price-section">
          <div class="points-price">
            <span class="label">积分价</span>
            <span class="value">{{ product.points_price }}</span>
            <span class="unit">积分</span>
          </div>
          <div class="original-price">
            <span class="label">原价</span>
            <span class="value">¥{{ product.original_price }}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span class="label">库存</span>
            <span class="value">{{ stock }} 件</span>
          </div>
          <div class="info-item">
            <span class="label">商品编码</span>
            <span class="value">{{ product.product_code }}</span>
          </div>
        </div>

        <div class="action-section">
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="stock"
            size="large"
            class="quantity-input"
          />
          <el-button
            type="primary"
            size="large"
            class="exchange-btn"
            :disabled="stock <= 0"
            @click="goExchange"
          >
            <el-icon><ShoppingCart /></el-icon>
            立即兑换
          </el-button>
        </div>

        <el-alert
          v-if="stock <= 0"
          title="商品已售罄"
          type="warning"
          show-icon
          class="alert-info"
        />
      </el-col>
    </el-row>

    <el-card class="desc-card">
      <template #header>
        <span>商品详情</span>
      </template>
      <div class="desc-content">
        <p>{{ product.description }}</p>
        <p>本商品支持积分兑换，兑换后请在"我的订单"中查看发货状态。</p>
        <p>积分兑换商品一经发出，非质量问题不支持退换。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProduct } from '@/api'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const stock = ref(0)
const quantity = ref(1)

async function loadProduct() {
  try {
    const res = await getProduct(route.params.id)
    if (res.code === 0) {
      product.value = res.data.product
      stock.value = res.data.stock || 0
    }
  } catch (e) {
    product.value = {
      id: route.params.id,
      product_name: '精美马克杯',
      product_code: 'P001',
      description: '陶瓷马克杯，容量350ml',
      points_price: 500,
      original_price: 29.90
    }
    stock.value = 100
  }
}

function goExchange() {
  router.push(`/exchange/${product.value.id}?qty=${quantity.value}`)
}

onMounted(() => {
  loadProduct()
})
</script>

<style lang="scss" scoped>
.product-detail {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .detail-row {
    background: #fff;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
  }

  .product-image-large {
    width: 100%;
    height: 400px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    .image-placeholder-large {
      color: #c0c4cc;
    }
  }

  .product-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 16px;
    color: #303133;
  }

  .product-desc {
    font-size: 15px;
    color: #606266;
    line-height: 1.8;
    margin-bottom: 24px;
  }

  .price-section {
    background: #fdf6ec;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;

    .points-price {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;

      .label {
        font-size: 14px;
        color: #909399;
      }

      .value {
        font-size: 32px;
        font-weight: 700;
        color: #f59e0b;
      }

      .unit {
        font-size: 14px;
        color: #f59e0b;
      }
    }

    .original-price {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        font-size: 13px;
        color: #909399;
      }

      .value {
        font-size: 14px;
        color: #c0c4cc;
        text-decoration: line-through;
      }
    }
  }

  .info-section {
    display: flex;
    gap: 32px;
    margin-bottom: 24px;

    .info-item {
      .label {
        font-size: 14px;
        color: #909399;
        margin-right: 8px;
      }

      .value {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .action-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .quantity-input {
      width: 140px;
    }

    .exchange-btn {
      flex: 1;
      height: 48px;
      font-size: 16px;
    }
  }

  .alert-info {
    margin-top: 16px;
  }

  .desc-card {
    border-radius: 12px;

    .desc-content {
      p {
        font-size: 14px;
        color: #606266;
        line-height: 2;
        margin: 0 0 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
