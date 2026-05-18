<template>
  <div class="calendar-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📅 年度生日表</span>
          <el-select v-model="selectedYear" style="width: 120px" @change="loadYearlyData">
            <el-option v-for="y in yearOptions" :key="y" :label="y + '年'" :value="y" />
          </el-select>
        </div>
      </template>
      <el-table :data="yearlyData" v-loading="loading" stripe>
        <el-table-column label="月份" width="100">
          <template #default="{ row }">
            {{ new Date(row.birthday).getMonth() + 1 }}月
          </template>
        </el-table-column>
        <el-table-column label="日期" width="100">
          <template #default="{ row }">
            {{ new Date(row.birthday).getDate() }}日
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="relation" label="关系" width="100" />
        <el-table-column label="日历" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.calendarType === 1 ? 'primary' : 'success'">
              {{ row.calendarType === 1 ? '公历' : '农历' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
      </el-table>
      <el-empty v-if="yearlyData.length === 0 && !loading" description="该年度没有生日记录" />
    </el-card>
  </div>
</template>

<script>
import { getYearlyBirthdayTable } from '@/api/contact'
import { ElMessage } from 'element-plus'

export default {
  name: 'Calendar',
  data() {
    return {
      yearlyData: [],
      loading: false,
      selectedYear: new Date().getFullYear(),
      yearOptions: []
    }
  },
  mounted() {
    const currentYear = new Date().getFullYear()
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
      this.yearOptions.push(i)
    }
    this.loadYearlyData()
  },
  methods: {
    async loadYearlyData() {
      this.loading = true
      try {
        const res = await getYearlyBirthdayTable(1, this.selectedYear)
        if (res.code === 200) {
          this.yearlyData = res.data
        }
      } catch (e) {
        ElMessage.error('加载年度生日表失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.calendar-page {
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
