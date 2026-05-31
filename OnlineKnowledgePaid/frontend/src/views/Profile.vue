<template>
  <div class="profile">
    <el-row :gutter="24">
      <el-col :xs="24" :md="8">
        <el-card class="profile__card">
          <div class="profile__avatar-section">
            <el-avatar :size="100" :src="user?.avatar">
              {{ (user?.username || 'U').charAt(0).toUpperCase() }}
            </el-avatar>
            <h2 class="profile__username">{{ user?.username }}</h2>
            <el-tag :type="user?.role === 2 ? 'primary' : 'success'" effect="dark" size="large">
              {{ user?.role === 2 ? '专栏作者' : '读者' }}
            </el-tag>
          </div>

          <el-divider />

          <div class="profile__info">
            <div class="profile__info-item">
              <el-icon><User /></el-icon>
              <span>邮箱：{{ user?.email }}</span>
            </div>
            <div class="profile__info-item">
              <el-icon><Document /></el-icon>
              <span>简介：{{ user?.bio || '暂无简介' }}</span>
            </div>
            <div class="profile__info-item">
              <el-icon><Clock /></el-icon>
              <span>注册时间：{{ formatDate(user?.created_at) }}</span>
            </div>
          </div>

          <el-divider />

          <div class="profile__stats">
            <el-row>
              <el-col :span="8" class="profile__stat-item">
                <div class="profile__stat-value">{{ stats.subscriptions }}</div>
                <div class="profile__stat-label">订阅专栏</div>
              </el-col>
              <el-col :span="8" class="profile__stat-item">
                <div class="profile__stat-value">{{ stats.orders }}</div>
                <div class="profile__stat-label">订单数量</div>
              </el-col>
              <el-col :span="8" class="profile__stat-item">
                <div class="profile__stat-value">{{ stats.likes }}</div>
                <div class="profile__stat-label">点赞次数</div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card v-if="user?.role === 2" class="profile__card">
          <template #header>
            <div class="profile__card-header">
              <span><el-icon><Management /></el-icon> 作者功能</span>
            </div>
          </template>
          <div class="profile__author-actions">
            <el-button type="primary" size="large" @click="goDashboard">
              <el-icon><EditPen /></el-icon>
              作者后台
            </el-button>
            <el-button type="success" size="large" @click="goStats">
              <el-icon><DataAnalysis /></el-icon>
              收入统计
            </el-button>
          </div>
        </el-card>

        <el-card class="profile__card">
          <template #header>
            <div class="profile__card-header">
              <span><el-icon><Collection /></el-icon> 我的订阅</span>
            </div>
          </template>
          <div v-loading="subscriptionsLoading" class="profile__subscriptions">
            <div v-if="subscriptions.length === 0" class="profile__empty">
              <el-empty description="暂无订阅，去发现更多精彩内容吧" />
              <el-button type="primary" @click="goColumns">浏览专栏</el-button>
            </div>
            <el-row :gutter="16">
              <el-col v-for="sub in subscriptions" :key="sub.id" :xs="24" :sm="12">
                <el-card class="profile__sub-card" shadow="hover" @click="goColumnDetail(sub.column.id)">
                  <div class="profile__sub-cover">
                    <el-image :src="sub.column.cover_image" fit="cover" class="profile__sub-image">
                      <template #error>
                        <div class="profile__sub-image-placeholder">
                          <el-icon :size="32"><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                  <div class="profile__sub-info">
                    <h4 class="profile__sub-title">{{ sub.column.title }}</h4>
                    <p class="profile__sub-author">{{ sub.column.author?.username }}</p>
                    <div class="profile__sub-dates">
                      <el-tag type="success" size="small">有效期至 {{ formatDate(sub.end_date) }}</el-tag>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <el-card class="profile__card">
          <template #header>
            <div class="profile__card-header">
              <span><el-icon><List /></el-icon> 我的订单</span>
            </div>
          </template>
          <el-table :data="orders" v-loading="ordersLoading" style="width: 100%">
            <el-table-column prop="order_no" label="订单号" min-width="180" />
            <el-table-column label="专栏" min-width="150">
              <template #default="{ row }">
                {{ row.column?.title || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <span style="color: var(--el-color-danger); font-weight: 600;">¥{{ row.amount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 0" size="small" type="warning">待支付</el-tag>
                <el-tag v-else-if="row.status === 1" size="small" type="success">已支付</el-tag>
                <el-tag v-else-if="row.status === 2" size="small" type="info">已取消</el-tag>
                <el-tag v-else size="small" type="danger">已退款</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="paid_at" label="支付时间" min-width="160">
              <template #default="{ row }">
                {{ formatDate(row.paid_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { subscriptionApi, orderApi } from '../api'
import { User, Document, Clock, Management, EditPen, DataAnalysis, Collection, List, Picture } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const user = ref(userStore.user)
const subscriptions = ref([])
const orders = ref([])
const subscriptionsLoading = ref(false)
const ordersLoading = ref(false)

const stats = ref({
  subscriptions: 0,
  orders: 0,
  likes: 0
})

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadSubscriptions() {
  subscriptionsLoading.value = true
  try {
    const data = await subscriptionApi.getMy({ page: 1, pageSize: 10 })
    subscriptions.value = data.items || data.list || data.data || []
    stats.value.subscriptions = data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    subscriptionsLoading.value = false
  }
}

async function loadOrders() {
  ordersLoading.value = true
  try {
    const data = await orderApi.getMy({ page: 1, pageSize: 10 })
    orders.value = data.items || data.list || data.data || []
    stats.value.orders = data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    ordersLoading.value = false
  }
}

function goDashboard() {
  router.push('/author/dashboard')
}

function goStats() {
  router.push('/author/stats')
}

function goColumns() {
  router.push('/columns')
}

function goColumnDetail(id) {
  router.push(`/column/${id}`)
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!user.value) {
    await userStore.fetchProfile()
    user.value = userStore.user
  }
  loadSubscriptions()
  loadOrders()
})
</script>

<style scoped>
.profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.profile__card {
  margin-bottom: 24px;
}

.profile__avatar-section {
  text-align: center;
  padding: 20px 0;
}

.profile__username {
  margin: 16px 0 12px;
  font-size: 22px;
  font-weight: 600;
}

.profile__info {
  padding: 0 20px;
}

.profile__info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.6;
}

.profile__info-item .el-icon {
  color: var(--el-color-primary);
  font-size: 18px;
}

.profile__stats {
  padding: 10px 20px 0;
}

.profile__stat-item {
  text-align: center;
}

.profile__stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.profile__stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.profile__card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 16px;
}

.profile__author-actions {
  display: flex;
  gap: 16px;
  padding: 10px 0;
}

.profile__author-actions .el-button {
  flex: 1;
  height: 50px;
}

.profile__subscriptions {
  min-height: 150px;
}

.profile__empty {
  text-align: center;
  padding: 40px 0;
}

.profile__empty .el-empty {
  margin-bottom: 20px;
}

.profile__sub-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.profile__sub-card:hover {
  transform: translateY(-4px);
}

.profile__sub-cover {
  margin: -20px -20px 0;
}

.profile__sub-image {
  width: 100%;
  height: 100px;
  display: block;
}

.profile__sub-image-placeholder {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.profile__sub-info {
  padding: 16px 0 0;
}

.profile__sub-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile__sub-author {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.profile__sub-dates {
  margin-top: 8px;
}
</style>
