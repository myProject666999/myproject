<template>
  <div>
    <el-card shadow="hover">
      <template #header>
        <span style="font-size: 18px; font-weight: bold">📜 运动历史记录</span>
      </template>

      <el-table :data="historyList" border stripe>
        <el-table-column label="运动日期" prop="exerciseDate" width="120" />
        <el-table-column label="运动类型" width="150">
          <template #default="{ row }">
            <span>{{ row.icon }} {{ row.exerciseTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="category" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时长(分钟)" prop="duration" width="120" align="right" />
        <el-table-column label="强度" width="100">
          <template #default="{ row }">
            <el-tag :type="getIntensityType(row.intensity)" size="small">
              {{ getIntensityText(row.intensity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="热量(kcal)" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">{{ row.calories }}</span>
          </template>
        </el-table-column>
        <el-table-column label="距离(km)" prop="distance" width="100" align="right">
          <template #default="{ row }">
            {{ row.distance || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" show-overflow-tooltip />
      </el-table>

      <div style="margin-top: 20px; text-align: right">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchHistory"
          @current-change="fetchHistory"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHistory } from '../api'

const historyList = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(100)

const fetchHistory = async () => {
  historyList.value = await getHistory(page.value, size.value)
}

const getIntensityText = (level) => {
  const map = { 1: '轻松', 2: '适中', 3: '较强', 4: '剧烈' }
  return map[level] || '适中'
}

const getIntensityType = (level) => {
  const map = { 1: 'info', 2: '', 3: 'warning', 4: 'danger' }
  return map[level] || ''
}

onMounted(fetchHistory)
</script>
