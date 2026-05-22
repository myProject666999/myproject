<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
      <h2 class="page-title">{{ exercise?.name }}</h2>
    </div>

    <el-row :gutter="20" v-if="exercise">
      <el-col :span="16">
        <el-card class="card-container">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="分类">
              <el-tag :type="getCategoryType(exercise.category)">{{ exercise.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="难度">
              <el-tag :type="getDifficultyType(exercise.difficulty)">
                {{ getDifficultyText(exercise.difficulty) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="目标肌群" v-if="exercise.muscleGroup">{{ exercise.muscleGroup }}</el-descriptions-item>
            <el-descriptions-item label="所需器材" v-if="exercise.equipment">{{ exercise.equipment }}</el-descriptions-item>
            <el-descriptions-item label="适合目标">
              <el-tag type="primary">{{ getSuitableText(exercise.suitableForGoal) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="每组消耗">
              {{ exercise.caloriesPerSet }} 大卡
            </el-descriptions-item>
          </el-descriptions>

          <el-divider>动作描述</el-divider>
          <p class="description">{{ exercise.description }}</p>

          <el-divider>训练参数</el-divider>
          <el-row :gutter="20" class="params">
            <el-col :span="8">
              <div class="param-item">
                <div class="param-label">目标组数</div>
                <div class="param-value">{{ exercise.targetSets }} 组</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="param-item">
                <div class="param-label">目标次数</div>
                <div class="param-value">{{ exercise.targetRepsMin }}-{{ exercise.targetRepsMax }} 次</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="param-item">
                <div class="param-label">组间休息</div>
                <div class="param-value">{{ exercise.restSeconds }} 秒</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="card-container tips-card">
          <template #header>
            <span>训练要点</span>
          </template>
          <ul class="tips-list">
            <li>动作前进行充分的热身活动</li>
            <li>保持正确的动作姿势，避免受伤</li>
            <li>控制动作速度，感受目标肌群的收缩</li>
            <li>呼吸配合：发力时呼气，还原时吸气</li>
            <li>循序渐进，逐步增加重量和强度</li>
            <li>训练后进行拉伸放松</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getExercise } from '@/api'

const router = useRouter()
const route = useRoute()
const exercise = ref(null)

onMounted(() => {
  loadExercise()
})

function loadExercise() {
  getExercise(route.params.id).then(res => {
    exercise.value = res.data
  }).catch(() => {})
}

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

function getSuitableText(suitable) {
  const map = { 'ALL': '全部', 'MUSCLE': '增肌', 'FAT': '减脂' }
  return map[suitable] || '全部'
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.params {
  margin-top: 16px;
}

.param-item {
  text-align: center;
  padding: 16px;
  background: #ecf5ff;
  border-radius: 8px;
}

.param-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.param-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.tips-card {
  position: sticky;
  top: 20px;
}

.tips-list {
  list-style: none;
  padding: 0;
}

.tips-list li {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.tips-list li:before {
  content: '✓';
  color: #67c23a;
  font-weight: bold;
  margin-right: 8px;
}

.tips-list li:last-child {
  border-bottom: none;
}
</style>
