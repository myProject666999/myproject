<template>
  <div class="revenue-stats">
    <h2 class="revenue-stats__title">营收统计</h2>

    <el-row :gutter="20" class="revenue-stats__overview">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="revenue-stats__stat-card">
          <el-statistic title="总营收" :value="overview.total_revenue" :precision="2" prefix="¥">
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="revenue-stats__stat-card">
          <el-statistic title="订阅用户数" :value="overview.total_subscribers">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="revenue-stats__stat-card">
          <el-statistic title="文章总数" :value="overview.total_articles">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="revenue-stats__stat-card">
          <el-statistic title="总浏览量" :value="overview.total_views">
            <template #prefix>
              <el-icon><View /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="revenue-stats__section">
      <template #header>
        <div class="revenue-stats__section-header">
          <span class="revenue-stats__section-title">
            <el-icon><DataBoard /></el-icon>
            营收明细
          </span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </div>
      </template>

      <el-table v-loading="revenueLoading" :data="revenueList" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="140" />
        <el-table-column prop="column_title" label="专栏名称" min-width="180" />
        <el-table-column label="营收" width="150">
          <template #default="{ row }">
            <span class="revenue-stats__revenue">
              ¥{{ (row.revenue || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="new_subscribers" label="新增订阅" width="120" />
      </el-table>

      <el-empty v-if="!revenueLoading && revenueList.length === 0" description="暂无营收数据" />
    </el-card>

    <el-card shadow="never" class="revenue-stats__section">
      <template #header>
        <div class="revenue-stats__section-header">
          <span class="revenue-stats__section-title">
            <el-icon><Goods /></el-icon>
            专栏统计
          </span>
        </div>
      </template>

      <el-table v-loading="columnsLoading" :data="columnStats" stripe style="width: 100%">
        <el-table-column prop="title" label="专栏名称" min-width="200" />
        <el-table-column prop="subscriber_count" label="订阅人数" width="140" />
        <el-table-column label="总收入" width="160">
          <template #default="{ row }">
            <span class="revenue-stats__revenue">
              ¥{{ (row.total_revenue || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showColumnDetail(row)">
              <el-icon><DataLine /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!columnsLoading && columnStats.length === 0" description="暂无专栏数据" />
    </el-card>

    <el-dialog
      v-model="detailDialogVisible"
      :title="`${detailColumn?.title || ''} - 详细统计`"
      width="600px"
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border v-if="detailStats">
          <el-descriptions-item label="订阅人数">
            {{ detailStats.subscriber_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="总营收">
            <span class="revenue-stats__revenue">
              ¥{{ (detailStats.total_revenue || 0).toFixed(2) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="总浏览量">
            {{ detailStats.total_views || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="文章总数">
            {{ detailStats.total_articles || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="本月新增订阅">
            {{ detailStats.month_new_subscribers || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="本月营收">
            <span class="revenue-stats__revenue">
              ¥{{ (detailStats.month_revenue || 0).toFixed(2) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
        <el-empty v-else-if="!detailLoading" description="暂无详细数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Money, User, Document, View, DataBoard, Goods, DataLine
} from '@element-plus/icons-vue'
import { statsApi, columnApi } from '../api'

const overview = ref({
  total_revenue: 0,
  total_subscribers: 0,
  total_articles: 0,
  total_views: 0
})

const dateRange = ref([])
const revenueList = ref([])
const revenueLoading = ref(false)

const columnStats = ref([])
const columnsLoading = ref(false)

const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detailColumn = ref(null)
const detailStats = ref(null)

async function loadOverview() {
  try {
    const data = await statsApi.getOverview()
    overview.value = {
      total_revenue: data.total_revenue || data.revenue_total || 0,
      total_subscribers: data.total_subscribers || data.subscribers || 0,
      total_articles: data.total_articles || data.articles || 0,
      total_views: data.total_views || data.views || 0
    }
  } catch (e) {
    console.error(e)
  }
}

async function loadRevenue() {
  revenueLoading.value = true
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const data = await statsApi.getRevenue(params)
    revenueList.value = Array.isArray(data) ? data : (data.items || data.list || [])
  } catch (e) {
    console.error(e)
  } finally {
    revenueLoading.value = false
  }
}

async function loadColumnStats() {
  columnsLoading.value = true
  try {
    const data = await columnApi.getMy()
    columnStats.value = Array.isArray(data) ? data : (data.items || data.list || [])
  } catch (e) {
    console.error(e)
  } finally {
    columnsLoading.value = false
  }
}

function handleDateChange() {
  loadRevenue()
}

async function showColumnDetail(row) {
  detailColumn.value = row
  detailStats.value = null
  detailDialogVisible.value = true
  detailLoading.value = true
  try {
    const data = await statsApi.getColumnStats(row.id)
    detailStats.value = data || {}
  } catch (e) {
    console.error(e)
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  loadOverview()
  loadRevenue()
  loadColumnStats()
})
</script>

<style scoped>
.revenue-stats {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.revenue-stats__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--el-text-color-primary);
}

.revenue-stats__overview {
  margin-bottom: 24px;
}

.revenue-stats__stat-card {
  text-align: center;
}

.revenue-stats__section {
  margin-bottom: 24px;
}

.revenue-stats__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.revenue-stats__section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.revenue-stats__revenue {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
