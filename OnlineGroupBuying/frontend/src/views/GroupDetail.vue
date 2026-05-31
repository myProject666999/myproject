<template>
  <div class="group-detail-page" v-loading="loading">
    <el-page-header @back="goBack" :content="'团购详情'" class="page-header" />
    <el-row :gutter="24" v-if="group">
      <el-col :span="16">
        <el-card shadow="never" class="detail-card">
          <div class="product-section">
            <div class="product-image-large">
              <el-image
                :src="group.product?.images"
                :alt="group.product?.name"
                fit="cover"
                style="width: 100%; height: 100%; border-radius: 12px;"
              >
                <template #error>
                  <div class="image-placeholder-large">
                    <el-icon :size="80"><Goods /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="product-info-large">
              <h2 class="product-name">{{ group.product?.name }}</h2>
              <p class="product-desc">{{ group.product?.description }}</p>
              <div class="price-info">
                <div class="group-price">
                  <span class="label">拼团价</span>
                  <span class="price">¥{{ group.group_price }}</span>
                </div>
                <div class="original-price" v-if="group.product?.original_price">
                  <span class="label">原价</span>
                  <span class="price">¥{{ group.product.original_price }}</span>
                </div>
              </div>
            </div>
          </div>
          <el-divider />
          <div class="group-info">
            <h3>拼团信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="团购编号">#{{ group.id }}</el-descriptions-item>
              <el-descriptions-item label="发起人">
                {{ group.initiator?.nickname || '系统' }}
              </el-descriptions-item>
              <el-descriptions-item label="目标人数">{{ group.group_size }} 人</el-descriptions-item>
              <el-descriptions-item label="当前人数">
                <el-tag :type="group.current_size >= group.group_size ? 'success' : 'warning'">
                  {{ group.current_size }} 人
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ formatDate(group.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="截止时间">{{ formatDate(group.expire_time) }}</el-descriptions-item>
              <el-descriptions-item label="团购状态" :span="2">
                <el-tag :type="statusTagType" size="large">{{ statusText }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <el-divider />
          <div class="progress-section">
            <div class="progress-header">
              <span>拼团进度</span>
              <span class="progress-count">
                {{ group.current_size }}/{{ group.group_size }} 人
              </span>
            </div>
            <el-progress
              :percentage="progressPercentage"
              :stroke-width="16"
              :color="progressColor"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="action-card">
          <div class="join-section">
            <div class="join-count">
              <span class="count">{{ group.current_size }}</span>
              <span class="label">人已参与</span>
            </div>
            <el-button
              v-if="canJoin"
              type="primary"
              size="large"
              style="width: 100%"
              :loading="joining"
              @click="handleJoin"
            >
              立即拼单
            </el-button>
            <el-button
              v-else-if="canCancel"
              type="warning"
              size="large"
              style="width: 100%"
              :loading="canceling"
              @click="handleCancel"
            >
              取消拼单
            </el-button>
            <el-button
              v-else
              type="info"
              size="large"
              style="width: 100%"
              disabled
            >
              {{ joinButtonText }}
            </el-button>
          </div>
        </el-card>
        <el-card v-if="group.participants && group.participants.length > 0" shadow="never" class="members-card">
          <h4>拼单成员</h4>
          <div class="members-list">
            <div v-for="member in group.participants" :key="member.user_id" class="member-item">
              <el-avatar :size="36" :src="member.avatar">
                {{ member.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="member-name">{{ member.nickname }}</span>
              <el-tag v-if="member.join_type === 2" type="primary" size="small">
                发起人
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { groupApi } from '@/api'
import { useUserStore } from '@/store/user'
import { Goods } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const group = ref(null)
const loading = ref(false)
const joining = ref(false)
const canceling = ref(false)

const groupId = computed(() => route.params.id)

const progressPercentage = computed(() => {
  if (!group.value) return 0
  const current = group.value.current_size || 0
  const target = group.value.group_size || 1
  return Math.min(Math.round((current / target) * 100), 100)
})

const statusText = computed(() => {
  if (!group.value) return ''
  const statusMap = {
    0: '进行中',
    1: '已成团',
    2: '拼团失败',
    3: '已取消'
  }
  return statusMap[group.value.status] || '未知'
})

const statusTagType = computed(() => {
  if (!group.value) return 'success'
  const status = group.value.status
  if (status === 0) return 'success'
  if (status === 1) return 'primary'
  if (status === 2) return 'info'
  if (status === 3) return 'danger'
  return 'success'
})

const progressColor = computed(() => {
  const pct = progressPercentage.value
  if (pct >= 100) return '#67c23a'
  if (pct >= 60) return '#409eff'
  return '#e6a23c'
})

const canJoin = computed(() => {
  if (!group.value) return false
  if (!userStore.isLoggedIn) return false
  if (group.value.status !== 0) return false
  if (group.value.current_size >= group.value.group_size) return false
  if (group.value.participants?.some(p => p.user_id === userStore.userInfo?.id)) return false
  return group.value.can_join
})

const canCancel = computed(() => {
  if (!group.value) return false
  if (group.value.status !== 0) return false
  if (group.value.initiator?.id !== userStore.userInfo?.id && 
      group.value.initiator_id !== userStore.userInfo?.id) return false
  return true
})

const joinButtonText = computed(() => {
  if (!group.value) return ''
  if (group.value.status === 1) return '已成团'
  if (group.value.status === 2) return '拼团失败'
  if (group.value.status === 3) return '已取消'
  if (!userStore.isLoggedIn) return '请先登录'
  if (group.value.current_size >= group.value.group_size) return '已满员'
  return '无法拼单'
})

function formatDate(dateStr) {
  if (!dateStr) return '长期有效'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function goBack() {
  router.back()
}

async function fetchGroupDetail() {
  loading.value = true
  try {
    const res = await groupApi.getDetail(groupId.value)
    group.value = res.data
  } catch (error) {
    ElMessage.error('获取团购详情失败')
  } finally {
    loading.value = false
  }
}

async function handleJoin() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await ElMessageBox.confirm('确定要参与这个拼单吗？', '确认拼单', {
      confirmButtonText: '确定拼单',
      cancelButtonText: '取消',
      type: 'info'
    })
  } catch {
    return
  }
  joining.value = true
  try {
    await groupApi.join(groupId.value)
    ElMessage.success('拼单成功！')
    fetchGroupDetail()
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    joining.value = false
  }
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm('确定要取消拼单吗？', '取消拼单', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    })
  } catch {
    return
  }
  canceling.value = true
  try {
    await groupApi.cancel(groupId.value)
    ElMessage.success('已取消拼单')
    fetchGroupDetail()
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    canceling.value = false
  }
}

onMounted(() => {
  fetchGroupDetail()
})
</script>

<style scoped>
.group-detail-page {
  padding: 10px 0;
}

.page-header {
  margin-bottom: 20px;
}

.detail-card,
.action-card,
.members-card {
  border-radius: 12px;
}

.action-card {
  position: sticky;
  top: 20px;
}

.product-section {
  display: flex;
  gap: 24px;
}

.product-image-large {
  width: 240px;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f7fa;
  flex-shrink: 0;
}

.image-placeholder-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.product-info-large {
  flex: 1;
}

.product-name {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 12px 0;
}

.product-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.price-info {
  display: flex;
  gap: 24px;
}

.group-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.group-price .label {
  font-size: 13px;
  color: #909399;
}

.group-price .price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.original-price .label {
  font-size: 13px;
  color: #909399;
}

.original-price .price {
  font-size: 16px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.group-info h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.progress-section {
  margin-top: 10px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.progress-count {
  font-weight: 500;
  color: #409eff;
}

.join-section {
  text-align: center;
}

.join-count {
  margin-bottom: 20px;
}

.join-count .count {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  display: block;
}

.join-count .label {
  font-size: 13px;
  color: #909399;
}

.members-card {
  margin-top: 16px;
}

.members-card h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
}
</style>
