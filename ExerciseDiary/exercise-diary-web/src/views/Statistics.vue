<template>
  <div>
    <el-card shadow="hover" style="margin-bottom: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 18px; font-weight: bold">📊 月度统计</span>
          <div>
            <el-date-picker
              v-model="selectedMonth"
              type="month"
              placeholder="选择月份"
              @change="fetchStats"
            />
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white">
            <div style="font-size: 48px; font-weight: bold">{{ monthlyStats.totalCalories || 0 }}</div>
            <div style="opacity: 0.9">总消耗热量 (kcal)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; color: white">
            <div style="font-size: 48px; font-weight: bold">{{ monthlyStats.totalDuration || 0 }}</div>
            <div style="opacity: 0.9">总运动时长 (分钟)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 10px; color: white">
            <div style="font-size: 48px; font-weight: bold">{{ monthlyStats.exerciseDays || 0 }}</div>
            <div style="opacity: 0.9">运动天数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 10px; color: white">
            <div style="font-size: 48px; font-weight: bold">{{ avgDuration }}</div>
            <div style="opacity: 0.9">日均时长 (分钟)</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span style="font-size: 18px; font-weight: bold">📈 每日热量消耗</span>
          </template>
          <div style="height: 350px">
            <div style="display: flex; align-items: flex-end; height: 280px; padding: 0 20px">
              <div
                v-for="day in daysInMonth"
                :key="day"
                style="flex: 1; display: flex; flex-direction: column; align-items: center; margin: 0 2px"
              >
                <div
                  :style="{
                    width: '100%',
                    height: getBarHeight(day) + 'px',
                    background: 'linear-gradient(to top, #409eff, #66b1ff)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '2px'
                  }"
                ></div>
                <div style="font-size: 10px; color: #909399; margin-top: 5px">{{ day }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span style="font-size: 18px; font-weight: bold">🧘 运动分类统计</span>
          </template>
          <el-empty v-if="!monthlyStats.categoryStats || monthlyStats.categoryStats.length === 0" description="暂无数据" :image-size="80" />
          <div v-else>
            <div
              v-for="(item, index) in monthlyStats.categoryStats"
              :key="item.category"
              style="margin-bottom: 20px"
            >
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px">
                <span style="font-weight: bold">{{ item.category }}</span>
                <span style="color: #666">{{ item.duration }} 分钟 / {{ item.calories }} kcal</span>
              </div>
              <el-progress
                :percentage="getCategoryPercent(item.duration)"
                :color="getCategoryColor(index)"
                :show-text="false"
              />
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" style="margin-top: 20px">
          <template #header>
            <span style="font-size: 18px; font-weight: bold">🏆 PR 记录榜</span>
          </template>
          <el-empty v-if="prList.length === 0" description="暂无 PR 记录" :image-size="80" />
          <el-table v-else :data="prList" size="small" :show-header="false">
            <el-table-column>
              <template #default="{ row }">
                <div style="display: flex; justify-content: space-between; align-items: center">
                  <span>
                    <span style="margin-right: 5px">{{ row.icon }}</span>
                    {{ row.exerciseTypeName }}
                  </span>
                  <el-tag type="warning" size="small">
                    {{ row.prType }}: {{ row.prValue }} {{ row.prUnit }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMonthlyStats, getPrList } from '../api'

const selectedMonth = ref(new Date())
const monthlyStats = ref({})
const prList = ref([])

const daysInMonth = computed(() => {
  const date = selectedMonth.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const days = new Date(year, month, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
})

const avgDuration = computed(() => {
  if (!monthlyStats.value.exerciseDays || !monthlyStats.value.totalDuration) return 0
  return Math.round(monthlyStats.value.totalDuration / monthlyStats.value.exerciseDays)
})

const getBarHeight = (day) => {
  if (!monthlyStats.value.dailyCalories) return 0
  const dayStr = String(day).padStart(2, '0')
  const dateStr = `${selectedMonth.value.getFullYear()}-${String(selectedMonth.value.getMonth() + 1).padStart(2, '0')}-${dayStr}`
  const item = monthlyStats.value.dailyCalories.find(d => d.exercise_date === dateStr)
  const maxCalories = Math.max(...monthlyStats.value.dailyCalories.map(d => d.calories), 500)
  return item ? (item.calories / maxCalories) * 250 : 0
}

const getCategoryPercent = (duration) => {
  const total = monthlyStats.value.totalDuration || 1
  return Math.round((duration / total) * 100)
}

const getCategoryColor = (index) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#00d4ff']
  return colors[index % colors.length]
}

const fetchStats = async () => {
  const year = selectedMonth.value.getFullYear()
  const month = selectedMonth.value.getMonth() + 1
  monthlyStats.value = await getMonthlyStats(year, month)
}

const fetchPrList = async () => {
  prList.value = await getPrList()
}

onMounted(() => {
  fetchStats()
  fetchPrList()
})
</script>
