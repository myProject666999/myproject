<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
      <h2 class="page-title">训练打卡</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="card-container">
          <el-form :model="form" label-width="120px">
            <el-divider content-position="left">训练数据</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="实际时长(分钟)">
                  <el-input-number v-model="form.actualDuration" :min="0" :max="300" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实际消耗(大卡)">
                  <el-input-number v-model="form.actualCalories" :min="0" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">身体数据</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="体重(kg)">
                  <el-input-number v-model="form.weight" :min="0" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="体脂率(%)">
                  <el-input-number v-model="form.bodyFat" :min="0" :max="100" :precision="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">状态评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="心情">
                  <el-rate v-model="form.mood" :max="3" :colors="['#f56c6c', '#e6a23c', '#67c23a']" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="精力">
                  <el-rate v-model="form.energyLevel" :max="3" :colors="['#f56c6c', '#e6a23c', '#67c23a']" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="训练备注">
              <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="记录今天的训练感受..." />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" @click="handleCheckIn">完成打卡</el-button>
              <el-button size="large" @click="handleGenerateSuggestions">获取调整建议</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-if="suggestions.length" class="suggestion-card">
          <template #header>
            <span>调整建议</span>
          </template>
          <div class="suggestion-list">
            <el-alert
              v-for="s in suggestions"
              :key="s.id"
              :title="getSuggestionTypeText(s.suggestionType)"
              :description="s.suggestionContent"
              :type="getSuggestionAlertType(s.suggestionType)"
              show-icon
              :closable="false"
              class="suggestion-item" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { checkIn, generateSuggestions, getCheckInByDailyPlan } from '@/api'

const router = useRouter()
const route = useRoute()
const suggestions = ref([])
const userInfo = ref({})

const form = reactive({
  userId: null,
  dailyPlanId: null,
  weight: null,
  bodyFat: null,
  mood: 3,
  energyLevel: 3,
  actualDuration: null,
  actualCalories: null,
  notes: ''
})

onMounted(() => {
  const userStr = localStorage.getItem('fitness_user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
    form.userId = userInfo.value.id
    form.dailyPlanId = Number(route.params.dailyPlanId)
    loadExistingRecord()
  }
})

function loadExistingRecord() {
  getCheckInByDailyPlan(form.dailyPlanId).then(res => {
    if (res.data) {
      Object.assign(form, res.data)
    }
  }).catch(() => {})
}

function handleCheckIn() {
  checkIn(form).then(() => {
    ElMessage.success('打卡成功')
    router.back()
  }).catch(() => {})
}

function handleGenerateSuggestions() {
  generateSuggestions(form.userId, form.dailyPlanId).then(res => {
    suggestions.value = res.data || []
    if (suggestions.value.length === 0) {
      ElMessage.info('当前状态良好，暂无调整建议')
    }
  }).catch(() => {})
}

function getSuggestionTypeText(type) {
  const map = { 'LOAD': '负荷调整', 'EXERCISE': '动作更换', 'REST': '休息调整', 'NUTRITION': '营养建议' }
  return map[type] || type
}

function getSuggestionAlertType(type) {
  const map = { 'LOAD': 'warning', 'EXERCISE': 'info', 'REST': 'success', 'NUTRITION': 'warning' }
  return map[type] || 'info'
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

.suggestion-card {
  position: sticky;
  top: 20px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  margin-bottom: 0;
}
</style>
