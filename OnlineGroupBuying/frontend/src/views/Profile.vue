<template>
  <div class="profile-page" v-loading="loading">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-card shadow="never" class="info-card">
          <div class="avatar-section">
            <el-avatar :size="100" :src="userStore.userInfo?.avatar">
              {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
            </el-avatar>
            <h2 class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</h2>
            <p class="username">@{{ userStore.userInfo?.username }}</p>
          </div>
          <el-divider />
          <div class="balance-section">
            <div class="balance-label">账户余额</div>
            <div class="balance-amount">¥{{ userStore.userInfo?.balance || '0.00' }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never" class="form-card">
          <h3>个人信息</h3>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="头像">
              <el-input v-model="form.avatar" placeholder="请输入头像URL" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="stats-card">
          <h3>我的统计</h3>
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.groupCount }}</div>
                <div class="stat-label">参与拼团</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.successCount }}</div>
                <div class="stat-label">成功拼团</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.orderCount }}</div>
                <div class="stat-label">订单总数</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi, orderApi, groupApi } from '@/api'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  nickname: '',
  phone: '',
  avatar: ''
})

const stats = reactive({
  groupCount: 0,
  successCount: 0,
  orderCount: 0
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
}

function initForm() {
  if (userStore.userInfo) {
    form.nickname = userStore.userInfo.nickname || ''
    form.phone = userStore.userInfo.phone || ''
    form.avatar = userStore.userInfo.avatar || ''
  }
}

async function fetchStats() {
  try {
    const [groupsRes, ordersRes] = await Promise.all([
      groupApi.getMyGroups(),
      orderApi.getMyOrders()
    ])
    const groups = groupsRes.data || []
    const orders = ordersRes.data || []
    stats.groupCount = groups.length
    stats.successCount = groups.filter(g => g.status === 1).length
    stats.orderCount = orders.length
  } catch {
    // 忽略统计错误
  }
}

async function handleSave() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    await userApi.updateInfo({
      nickname: form.nickname,
      phone: form.phone,
      avatar: form.avatar
    })
    ElMessage.success('保存成功')
    await userStore.fetchUserInfo()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  initForm()
  fetchStats()
})
</script>

<style scoped>
.profile-page {
  padding: 10px 0;
}

.info-card,
.form-card,
.stats-card {
  border-radius: 12px;
}

.info-card {
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.nickname {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.username {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.balance-section {
  text-align: center;
}

.balance-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 32px;
  font-weight: bold;
  color: #f56c6c;
}

.form-card h3,
.stats-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
}

.stats-card {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>
