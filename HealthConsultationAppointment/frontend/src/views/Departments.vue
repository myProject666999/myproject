<template>
  <div class="departments-page">
    <h2 class="page-title">科室列表</h2>
    <div class="department-grid">
      <el-card
        v-for="dept in departments"
        :key="dept.id"
        class="department-card"
        @click="goToDepartment(dept.id)"
        shadow="hover"
      >
        <div class="card-content">
          <div class="dept-icon">🏥</div>
          <div class="dept-name">{{ dept.name }}</div>
          <div class="dept-desc">{{ dept.description }}</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDepartments } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const departments = ref([])

const loadDepartments = async () => {
  try {
    departments.value = await getDepartments()
  } catch (e) {
    ElMessage.error('加载科室列表失败')
  }
}

const goToDepartment = (id) => {
  router.push(`/department/${id}`)
}

onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.departments-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.department-card {
  cursor: pointer;
  transition: all 0.3s;
}

.department-card:hover {
  transform: translateY(-5px);
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.dept-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.dept-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.dept-desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
