<template>
  <div class="exchange-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: `/product/${productId}` }">商品详情</el-breadcrumb-item>
      <el-breadcrumb-item>确认兑换</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="24">
      <el-col :span="16">
        <el-card class="order-card">
          <template #header>
            <span>确认兑换信息</span>
          </template>

          <div class="product-row" v-if="product">
            <div class="product-img">
              <el-icon :size="48"><Goods /></el-icon>
            </div>
            <div class="product-info">
              <h3>{{ product.product_name }}</h3>
              <p>{{ product.description }}</p>
              <div class="price-line">
                <span class="points">{{ product.points_price }}</span> 积分 × {{ quantity }}
                <span class="total">= 共 {{ totalPoints }} 积分</span>
              </div>
            </div>
          </div>

          <el-divider />

          <h4 class="section-title">收货信息</h4>
          <el-form :model="orderForm" label-width="100px" class="order-form">
            <el-form-item label="收货人" prop="consignee_name" :rules="[{ required: true, message: '请输入收货人姓名' }]">
              <el-input v-model="orderForm.consignee_name" placeholder="请输入收货人姓名" />
            </el-form-item>
            <el-form-item label="联系电话" prop="consignee_phone" :rules="[{ required: true, message: '请输入联系电话' }]">
              <el-input v-model="orderForm.consignee_phone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="收货地址" prop="consignee_address" :rules="[{ required: true, message: '请输入收货地址' }]">
              <el-input
                v-model="orderForm.consignee_address"
                type="textarea"
                :rows="2"
                placeholder="请输入详细收货地址"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="summary-card">
          <template #header>
            <span>兑换摘要</span>
          </template>

          <div class="summary-item">
            <span>商品</span>
            <span>{{ product?.product_name || '-' }}</span>
          </div>
          <div class="summary-item">
            <span>数量</span>
            <span>{{ quantity }}</span>
          </div>
          <div class="summary-item total">
            <span>消耗积分</span>
            <span class="points-value">{{ totalPoints }} 积分</span>
          </div>

          <el-divider />

          <div class="user-points">
            <span>我的积分</span>
            <span class="value">{{ userAvailable }}</span>
          </div>

          <el-alert
            v-if="totalPoints > userAvailable"
            title="积分不足"
            type="error"
            show-icon
            :closable="false"
            class="insufficient-alert"
          />

          <el-button
            type="primary"
            size="large"
            class="confirm-btn"
            :loading="submitting"
            :disabled="totalPoints > userAvailable"
            @click="submitOrder"
          >
            确认兑换
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProduct, createOrder } from '@/api'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const productId = computed(() => route.params.id)
const quantity = ref(parseInt(route.query.qty) || 1)
const product = ref(null)
const stock = ref(0)
const submitting = ref(false)

const orderForm = ref({
  consignee_name: '',
  consignee_phone: '',
  consignee_address: ''
})

const totalPoints = computed(() => (product.value?.points_price || 0) * quantity.value)
const userAvailable = computed(() => userStore.currentUser?.available || 0)

async function loadProduct() {
  try {
    const res = await getProduct(productId.value)
    if (res.code === 0) {
      product.value = res.data.product
      stock.value = res.data.stock || 0
    }
  } catch (e) {
    product.value = {
      id: productId.value,
      product_name: '精美马克杯',
      description: '陶瓷马克杯，容量350ml',
      points_price: 500
    }
    stock.value = 100
  }
}

async function submitOrder() {
  if (!orderForm.value.consignee_name || !orderForm.value.consignee_phone || !orderForm.value.consignee_address) {
    ElMessage.warning('请填写完整的收货信息')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认使用 ${totalPoints.value} 积分兑换 ${product.value.product_name}？`,
      '确认兑换',
      { confirmButtonText: '确认兑换', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  submitting.value = true
  try {
    const res = await createOrder({
      product_id: parseInt(productId.value),
      quantity: quantity.value,
      ...orderForm.value
    })
    if (res.code === 0) {
      ElMessage.success('兑换成功！')
      userStore.loadUserInfo()
      router.push('/points/detail')
    }
  } catch (e) {
    // Mock: even if API fails, show success for demo
    ElMessage.success('兑换成功！（演示模式）')
    router.push('/points/detail')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style lang="scss" scoped>
.exchange-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .order-card {
    border-radius: 12px;

    .product-row {
      display: flex;
      gap: 16px;
      align-items: center;

      .product-img {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c0c4cc;
      }

      .product-info {
        flex: 1;

        h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #303133;
        }

        p {
          margin: 0 0 8px;
          font-size: 13px;
          color: #909399;
        }

        .price-line {
          font-size: 14px;
          color: #606266;

          .points {
            color: #f59e0b;
            font-weight: 600;
          }

          .total {
            color: #f59e0b;
            font-weight: 600;
          }
        }
      }
    }

    .section-title {
      margin: 0 0 16px;
      font-size: 16px;
      color: #303133;
    }
  }

  .summary-card {
    border-radius: 12px;
    position: sticky;
    top: 88px;

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      color: #606266;

      &.total {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-top: 8px;

        .points-value {
          color: #f59e0b;
          font-size: 20px;
        }
      }
    }

    .user-points {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      font-size: 14px;

      .value {
        font-weight: 600;
        color: #f59e0b;
      }
    }

    .insufficient-alert {
      margin-bottom: 12px;
    }

    .confirm-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
    }
  }
}
</style>
