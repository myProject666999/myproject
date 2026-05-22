<template>
  <div class="page-container">
    <el-card class="card-container">
      <template #header>
        <div class="card-header">
          <span>动作库</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索动作名称"
            style="width: 200px"
            clearable
            :prefix-icon="Search" />
        </div>
      </template>

      <div class="category-tabs">
        <el-radio-group v-model="selectedCategory" size="large">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="胸部">胸部</el-radio-button>
          <el-radio-button label="背部">背部</el-radio-button>
          <el-radio-button label="肩部">肩部</el-radio-button>
          <el-radio-button label="手臂">手臂</el-radio-button>
          <el-radio-button label="腿部">腿部</el-radio-button>
          <el-radio-button label="核心">核心</el-radio-button>
          <el-radio-button label="有氧">有氧</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="filteredExercises.length" class="exercise-grid">
        <el-card
          v-for="ex in filteredExercises"
          :key="ex.id"
          class="exercise-card"
          shadow="hover"
          @click="goToDetail(ex.id)">
          <div class="card-top">
            <el-tag :type="getCategoryType(ex.category)" size="small">{{ ex.category }}</el-tag>
            <el-tag :type="getDifficultyType(ex.difficulty)" size="small">
              {{ getDifficultyText(ex.difficulty) }}
            </el-tag>
          </div>
          <div class="card-body">
            <h3 class="exercise-name">{{ ex.name }}</h3>
            <p class="muscle-group" v-if="ex.muscleGroup">
              <el-icon><Gym /></el-icon>
              {{ ex.muscleGroup }}
            </p>
            <p class="equipment" v-if="ex.equipment">
              <el-icon><Tools /></el-icon>
              {{ ex.equipment }}
            </p>
          </div>
          <div class="card-bottom">
            <div class="info-item">
              <span class="label">组数</span>
              <span class="value">{{ ex.targetSets }}</span>
            </div>
            <div class="info-item">
              <span class="label">次数</span>
              <span class="value">{{ ex.targetRepsMin }}-{{ ex.targetRepsMax }}</span>
            </div>
            <div class="info-item">
              <span class="label">休息</span>
              <span class="value">{{ ex.restSeconds }}s</span>
            </div>
          </div>
        </el-card>
      </div>
      <el-empty v-else description="暂无匹配的动作" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { listExercises } from '@/api'

const router = useRouter()
const exercises = ref([])
const searchKeyword = ref('')
const selectedCategory = ref('')

onMounted(() => {
  loadExercises()
})

function loadExercises() {
  listExercises().then(res => {
    exercises.value = res.data || []
  }).catch(() => {})
}

const filteredExercises = computed(() => {
  return exercises.value.filter(ex => {
    const matchCategory = !selectedCategory.value || ex.category === selectedCategory.value
    const matchKeyword = !searchKeyword.value || ex.name.includes(searchKeyword.value)
    return matchCategory && matchKeyword
  })
})

function getCategoryType(category) {
  const map = {
    '胸部': 'danger',
    '背部': 'warning',
    '肩部': 'success',
    '手臂': '',
    '腿部': 'info',
    '核心': 'primary',
    '有氧': ''
  }
  return map[category] || ''
}

function getDifficultyType(difficulty) {
  const map = { 1: 'success', 2: 'warning', 3: 'danger' }
  return map[difficulty] || ''
}

function getDifficultyText(difficulty) {
  const map = { 1: '初级', 2: '中级', 3: '高级' }
  return map[difficulty] || '未知'
}

function goToDetail(id) {
  router.push(`/exercise/${id}`)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tabs {
  margin-bottom: 20px;
  text-align: center;
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.exercise-card {
  cursor: pointer;
  transition: all 0.3s;
}

.exercise-card:hover {
  transform: translateY(-4px);
}

.card-top {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.card-body {
  margin-bottom: 16px;
}

.exercise-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.muscle-group, .equipment {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
