<template>
  <div class="subscribe">
    <el-steps :active="activeStep" finish-status="success" align-center>
      <el-step title="选择专栏" />
      <el-step title="支付" />
      <el-step title="完成" />
    </el-steps>

    <div v-loading="loading" class="subscribe__content">
      <template v-if="activeStep === 0">
        <el-empty v-if="!column" description="正在加载专栏信息..." />
        <el-row v-else :gutter="24" class="subscribe__row">
          <el-col :xs="24" :md="14">
            <el-card shadow="hover" class="subscribe__column-card">
              <el-image
                :src="column.cover_image"
                fit="cover"
                class="subscribe__cover"
              >
                <template #error>
                  <div class="subscribe__cover-placeholder">
                    <el-icon :size="64"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="subscribe__column-info">
                <h2 class="subscribe__column-title">{{ column.title }}</h2>
                <p class="subscribe__column-desc">{{ column.description }}</p>
                <div v-if="column.author?.username" class="subscribe__author">
                  <el-icon><User /></el-icon>
                  作者：{{ column.author.username }}
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :md="10">
            <el-card shadow="hover" class="subscribe__order-card">
              <template #header>
                <div class="subscribe__order-header">
                  <el-icon><ShoppingCart /></el-icon>
                  <span>订单摘要</span>
                </div>
              </template>

              <div class="subscribe__order-item">
                <span class="subscribe__order-label">商品</span>
                <span class="subscribe__order-value">{{ column.title }}</span>
              </div>
              <div class="subscribe__order-item">
                <span class="subscribe__order-label">类型</span>
                <span class="subscribe__order-value">专栏订阅</span>
              </div>
              <div class="subscribe__order-item">
                <span class="subscribe__order-label">支付方式</span>
                <span class="subscribe__order-value">支付宝</span>
              </div>
              <el-divider />
              <div class="subscribe__order-total">
                <span>应付金额</span>
                <span class="subscribe__order-price">¥{{ (column.price || 0).toFixed(2) }}</span>
              </div>

              <el-button
                type="primary"
                size="large"
                class="subscribe__pay-btn"
                :loading="paying"
                @click="handlePay"
              >
                <el-icon><Wallet /></el-icon>
              立即支付
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <template v-else-if="activeStep === 1">
        <el-card shadow="never" class="subscribe__processing">
          <el-icon class="subscribe__processing-icon" :size="72"><Loading /></el-icon>
          <div class="subscribe__processing-text">
            {{ paying ? '正在处理支付，请稍候...' : '准备支付中...' }}
          </div>
        </el-card>
      </template>

      <template v-else-if="activeStep === 2">
        <el-result
          icon="success"
          title="订阅成功"
          sub-title="您已成功订阅本专栏，现在可以阅读所有文章了。"
        >
          <template #extra>
            <el-button type="primary" @click="goColumnDetail">
              <el-icon><Reading /></el-icon>
              前往专栏
            </el-button>
          </template>
        </el-result>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Picture, User, ShoppingCart, Wallet, Loading, Reading
} from '@element-plus/icons-vue'
import { columnApi, orderApi } from '../api'

const route = useRoute()
const router = useRouter()

const columnId = computed(() => Number(route.params.id))

const column = ref(null)
const loading = ref(false)
const paying = ref(false)
const activeStep = ref(0)

async function loadColumn() {
  loading.value = true
  try {
    column.value = await columnApi.getById(columnId.value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handlePay() {
  try {
    await ElMessageBox.confirm(
      `确定支付 ¥${(column.value?.price || 0).toFixed(2)} 订阅《${column.value?.title || ''}？`,
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
      return
    }

  paying.value = true
  activeStep.value = 1

  try {
    const order = await orderApi.create({ column_id: columnId.value })
    await orderApi.pay({ order_id: order.id, pay_method: 'alipay' })
    ElMessage.success('支付成功')
    activeStep.value = 2
  } catch (e) {
    console.error(e)
    activeStep.value = 0
  } finally {
    paying.value = false
  }
}

function goColumnDetail() {
  router.push(`/column/${columnId.value}`)
}

onMounted(() => {
  loadColumn()
})
</script>

<style scoped>
.subscribe {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.subscribe__content {
  margin-top: 32px;
  min-height: 400px;
}

.subscribe__row {
  align-items: stretch;
}

.subscribe__column-card {
  height: 100%;
}

.subscribe__cover {
  width: 100%;
  height: 240px;
  display: block;
  border-radius: 6px;
  overflow: hidden;
}

.subscribe__cover-placeholder {
  width: 100%;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.subscribe__column-info {
  padding: 16px 4px 4px;
}

.subscribe__column-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}

.subscribe__column-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0 0 12px;
}

.subscribe__author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.subscribe__order-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.subscribe__order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subscribe__order-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.subscribe__order-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.subscribe__order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subscribe__order-price {
  font-size: 24px;
  color: var(--el-color-danger);
  font-weight: 700;
}

.subscribe__pay-btn {
  width: 100%;
  margin-top: 24px;
}

.subscribe__processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.subscribe__processing-icon {
  color: var(--el-color-primary);
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.subscribe__processing-text {
  margin-top: 16px;
  font-size: 16px;
  color: var(--el-text-color-regular);
}
</style>
