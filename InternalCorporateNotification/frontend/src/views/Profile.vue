<template>
  <div class="page-container">
    <div class="card">
      <div class="page-header">
        <div class="page-title">个人中心</div>
      </div>

      <el-row :gutter="30">
        <el-col :span="8">
          <div class="user-card">
            <div class="avatar-section">
              <el-avatar :size="100">
                {{ userStore.userInfo.realName?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-name">{{ userStore.userInfo.realName }}</div>
              <div class="user-role">
                <el-tag :type="userStore.isAdmin ? 'danger' : 'primary'" size="small">
                  {{ userStore.isAdmin ? '管理员' : '普通员工' }}
                </el-tag>
              </div>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ myStats.totalRead || 0 }}</div>
                <div class="stat-label">已读公告</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ userStore.unreadCount }}</div>
                <div class="stat-label">未读公告</div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="16">
          <div class="info-section">
            <h3 class="section-title">
              <el-icon><User /></el-icon>
              基本信息
            </h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户名">{{ userStore.userInfo.username }}</el-descriptions-item>
              <el-descriptions-item label="真实姓名">{{ userStore.userInfo.realName }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ userStore.userInfo.phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ userStore.userInfo.email || '-' }}</el-descriptions-item>
              <el-descriptions-item label="部门ID">{{ userStore.userInfo.departmentId || '-' }}</el-descriptions-item>
              <el-descriptions-item label="角色">
                {{ userStore.isAdmin ? '管理员' : '普通员工' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section mt-30">
            <h3 class="section-title">
              <el-icon><Clock /></el-icon>
              最近阅读
            </h3>
            <el-table :data="myStats.recentReads || []" border stripe v-if="myStats.recentReads?.length > 0">
              <el-table-column prop="announcementId" label="公告ID" width="100" />
              <el-table-column prop="readTime" label="阅读时间">
                <template #default="{ row }">
                  {{ formatDate(row.readTime) }}
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无阅读记录" :image-size="100" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { getMyStats } from '@/api'
import dayjs from 'dayjs'

const userStore = useUserStore()
const myStats = reactive({
  totalRead: 0,
  recentReads: []
})

onMounted(async () => {
  try {
    const res = await getMyStats()
    myStats.totalRead = res.data.totalRead
    myStats.recentReads = res.data.recentReads || []
  } catch (e) {}
})

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px 20px;
  color: #fff;
}

.avatar-section {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  margin-top: 15px;
}

.user-role {
  margin-top: 10px;
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 5px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 40px;
}

.info-section {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
  gap: 6px;
}

.mt-30 {
  margin-top: 30px;
}
</style>
