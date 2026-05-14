<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教练预约管理</span>
          <el-button type="primary">新增教练</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" v-for="coach in coaches" :key="coach.id">
          <el-card shadow="hover" class="coach-card">
            <div class="coach-header">
              <el-avatar :size="60">
                <el-icon :size="30"><User /></el-icon>
              </el-avatar>
              <div class="coach-info">
                <div class="coach-name">{{ coach.name }}</div>
                <div class="coach-level">
                  <el-tag :type="getLevelType(coach.level)" size="small">{{ coach.level }}</el-tag>
                </div>
              </div>
            </div>
            <div class="coach-detail">
              <p><el-icon><Phone /></el-icon> {{ coach.phone }}</p>
              <p><el-icon><Money /></el-icon> ¥{{ coach.hourlyRate }}/小时</p>
              <p class="coach-desc">{{ coach.description }}</p>
            </div>
            <div class="coach-footer">
              <el-button type="success" link>查看排班</el-button>
              <el-button type="primary" link>编辑</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const coaches = ref([
  { id: 1, name: '张伟', gender: 1, phone: '13900000001', level: '国家级', hourlyRate: 500, status: 1, description: '国家队退役运动员，15年滑雪教学经验' },
  { id: 2, name: '李娜', gender: 2, phone: '13900000002', level: '高级', hourlyRate: 400, status: 1, description: '全国冠军，单板自由式专家' },
  { id: 3, name: '王强', gender: 1, phone: '13900000003', level: '高级', hourlyRate: 380, status: 1, description: '10年教学经验，擅长零基础学员' },
  { id: 4, name: '刘洋', gender: 1, phone: '13900000004', level: '中级', hourlyRate: 280, status: 1, description: '认证滑雪教练，耐心细致' },
  { id: 5, name: '陈静', gender: 2, phone: '13900000005', level: '中级', hourlyRate: 280, status: 1, description: '温柔女教练，适合儿童和女性' },
  { id: 6, name: '赵鹏', gender: 1, phone: '13900000006', level: '初级', hourlyRate: 200, status: 1, description: '新晋教练，性价比首选' }
])

const getLevelType = (level) => {
  const map = { '国家级': 'danger', '高级': 'warning', '中级': 'primary', '初级': 'success' }
  return map[level] || 'info'
}
</script>

<style scoped>
.coach-card {
  margin-bottom: 20px;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.coach-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.coach-detail {
  font-size: 14px;
  color: #606266;
}

.coach-detail p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.coach-desc {
  color: #909399;
  font-size: 12px;
}

.coach-footer {
  margin-top: 15px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
