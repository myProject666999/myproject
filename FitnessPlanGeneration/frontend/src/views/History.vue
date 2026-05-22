<template>
  <div class="page-container">
    <el-card class="card-container">
      <template #header>
        <span>历史打卡记录</span>
      </template>

      <el-table v-if="records.length" :data="records" stripe style="width: 100%">
        <el-table-column prop="checkInDate" label="日期" width="120" />
        <el-table-column label="体重(kg)" width="100">
          <template #default="{ row }">
            {{ row.weight || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="体脂率(%)" width="100">
          <template #default="{ row }">
            {{ row.bodyFat || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="心情" width="100">
          <template #default="{ row }">
            <el-rate v-if="row.mood" :model-value="row.mood" :max="3" disabled />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="精力" width="100">
          <template #default="{ row }">
            <el-rate v-if="row.energyLevel" :model-value="row.energyLevel" :max="3" disabled />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="实际时长" width="120">
          <template #default="{ row }">
            {{ row.actualDuration ? row.actualDuration + ' 分钟' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="实际消耗" width="120">
          <template #default="{ row }">
            {{ row.actualCalories ? row.actualCalories + ' 大卡' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" />
      </el-table>
      <el-empty v-else description="暂无打卡记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCheckInByUser } from '@/api'

const records = ref([])

onMounted(() => {
  const userStr = localStorage.getItem('fitness_user')
  if (userStr) {
    const userInfo = JSON.parse(userStr)
    loadRecords(userInfo.id)
  }
})

function loadRecords(userId) {
  getCheckInByUser(userId).then(res => {
    records.value = res.data || []
  }).catch(() => {})
}
</script>

<style scoped>
</style>
