<template>
  <div class="department-detail">
    <el-button @click="router.back()" type="primary" plain style="margin-bottom: 20px;">
      <el-icon><ArrowLeft /></el-icon> 返回
    </el-button>

    <div v-if="department" class="dept-info">
      <h2>{{ department.name }}</h2>
      <p class="desc">{{ department.description }}</p>
    </div>

    <h3 class="section-title">医生列表</h3>
    <div class="doctor-list">
      <el-card
        v-for="doctor in doctors"
        :key="doctor.id"
        class="doctor-card"
        @click="goToDoctor(doctor.id)"
        shadow="hover"
      >
        <div class="doctor-info">
          <div class="avatar">👨‍⚕️</div>
          <div class="info">
            <div class="name">
              {{ doctor.name }}
              <el-tag size="small" type="primary">{{ doctor.title }}</el-tag>
            </div>
            <div class="skill">擅长：{{ doctor.skill }}</div>
          </div>
          <el-button type="primary">查看排班</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDepartmentById, getDoctors } from '@/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const department = ref(null)
const doctors = ref([])

const loadData = async () => {
  const id = route.params.id
  try {
    department.value = await getDepartmentById(id)
    doctors.value = await getDoctors(id)
  } catch (e) {
    ElMessage.error('加载数据失败')
  }
}

const goToDoctor = (id) => {
  router.push(`/doctor/${id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.department-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.dept-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.dept-info h2 {
  margin-bottom: 10px;
  color: #303133;
}

.desc {
  color: #606266;
  line-height: 1.6;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
}

.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.doctor-card {
  cursor: pointer;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  font-size: 48px;
}

.info {
  flex: 1;
}

.name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.skill {
  font-size: 14px;
  color: #606266;
}
</style>
