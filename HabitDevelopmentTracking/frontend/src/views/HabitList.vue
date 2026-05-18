<template>
  <div class="habit-list-page">
    <div class="header">
      <div>
        <h1>习惯管理</h1>
        <p class="subtitle">管理你的所有习惯</p>
      </div>
      <el-button type="primary" @click="showAddDialog = true" :icon="Plus">
        添加习惯
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card class="habits-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>习惯列表</span>
              <span class="count">共 {{ habits.length }} 个习惯</span>
            </div>
          </template>
          <div class="habit-items">
            <div
              v-for="habit in habits"
              :key="habit.id"
              class="habit-item"
            >
              <div class="habit-left">
                <div class="habit-icon" :style="{ backgroundColor: habit.color + '20', color: habit.color }">
                  {{ habit.icon }}
                </div>
                <div class="habit-info">
                  <h3>{{ habit.name }}</h3>
                  <p class="habit-desc">{{ habit.description }}</p>
                  <div class="habit-meta">
                    <span>🎯 目标 {{ habit.targetDays }} 天</span>
                  </div>
                </div>
              </div>
              <div class="habit-actions">
                <el-button type="danger" text @click="handleDelete(habit)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
            <el-empty v-if="habits.length === 0 && !loading" description="暂无习惯，点击右上角添加" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="ranking-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>🏆 坚持榜</span>
            </div>
          </template>
          <div class="ranking-list">
            <div
              v-for="(item, index) in ranking"
              :key="item.habitId"
              class="ranking-item"
            >
              <div class="rank-badge" :class="getRankClass(index)">
                {{ index + 1 }}
              </div>
              <div class="rank-icon" :style="{ backgroundColor: item.color + '20', color: item.color }">
                {{ item.icon }}
              </div>
              <div class="rank-info">
                <p class="rank-name">{{ item.habitName }}</p>
                <p class="rank-stats">累计 {{ item.totalCheckins }} 次</p>
              </div>
              <div class="rank-streak">
                <span class="streak-num">{{ item.streakDays }}</span>
                <span class="streak-label">天</span>
              </div>
            </div>
            <el-empty v-if="ranking.length === 0 && !loading" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAddDialog" title="添加新习惯" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="习惯名称">
          <el-input v-model="formData.name" placeholder="请输入习惯名称" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="formData.icon" placeholder="输入emoji，如 💧📚🏃" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="formData.color" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="简单描述这个习惯" />
        </el-form-item>
        <el-form-item label="目标天数">
          <el-input-number v-model="formData.targetDays" :min="1" :max="365" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getHabits, getRanking, createHabit, deleteHabit } from '../api/habit'

const loading = ref(false)
const habits = ref([])
const ranking = ref([])
const showAddDialog = ref(false)
const formData = reactive({
  name: '',
  icon: '🎯',
  color: '#1890ff',
  description: '',
  targetDays: 21,
  sortOrder: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const [habitsData, rankingData] = await Promise.all([
      getHabits(),
      getRanking()
    ])
    habits.value = habitsData
    ranking.value = rankingData
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = async () => {
  if (!formData.name.trim()) {
    ElMessage.warning('请输入习惯名称')
    return
  }
  try {
    await createHabit(formData)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    formData.name = ''
    formData.icon = '🎯'
    formData.color = '#1890ff'
    formData.description = ''
    formData.targetDays = 21
    loadData()
  } catch (error) {
    console.error('添加失败:', error)
  }
}

const handleDelete = async (habit) => {
  try {
    await ElMessageBox.confirm(`确定要删除习惯"${habit.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteHabit(habit.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const getRankClass = (index) => {
  if (index === 0) return 'first'
  if (index === 1) return 'second'
  if (index === 2) return 'third'
  return ''
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.habit-list-page {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #909399;
  margin: 0;
}

.habits-card,
.ranking-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.count {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
}

.habit-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.habit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 10px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.habit-item:hover {
  background: #f5f5f5;
}

.habit-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.habit-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.habit-info h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 4px 0;
}

.habit-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 4px 0;
}

.habit-meta {
  font-size: 12px;
  color: #606266;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #fafafa;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e4e7ed;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.rank-badge.first {
  background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
  color: white;
}

.rank-badge.second {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  color: white;
}

.rank-badge.third {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  color: white;
}

.rank-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-stats {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.rank-streak {
  text-align: right;
  flex-shrink: 0;
}

.streak-num {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.streak-label {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}
</style>
