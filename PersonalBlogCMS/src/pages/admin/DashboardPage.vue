<template>
  <div class="dashboard-page">
    <div v-loading="loading" class="stats-grid">
      <el-card v-for="stat in stats" :key="stat.label" class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
          <div class="stat-icon" :style="{ background: stat.color + '20' }">
            <el-icon :size="28" :style="{ color: stat.color }">
              <component :is="stat.icon" />
            </el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <template #header>
            <span>访问趋势</span>
          </template>
          <div v-loading="trendLoading" style="height: 300px; position: relative;">
            <div ref="trendChartRef" style="width: 100%; height: 100%;"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>
            <span>分类分布</span>
          </template>
          <div v-loading="categoryLoading" style="height: 300px; position: relative;">
            <div ref="categoryChartRef" style="width: 100%; height: 100%;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="popular-card">
      <template #header>
        <span>热门文章</span>
      </template>
      <el-table v-loading="popularLoading" :data="popularArticles" stripe>
        <el-table-column prop="title" label="文章标题" />
        <el-table-column prop="viewCount" label="阅读量" width="120" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { statsApi } from '../../api/stats';
import type { StatsOverview, VisitTrendItem } from '../../../shared/types';

const loading = ref(false);
const trendLoading = ref(false);
const categoryLoading = ref(false);
const popularLoading = ref(false);
const trendChartRef = ref<HTMLElement>();
const categoryChartRef = ref<HTMLElement>();
let trendChart: echarts.ECharts | null = null;
let categoryChart: echarts.ECharts | null = null;

const stats = ref([
  { label: '文章总数', value: 0, icon: 'Document', color: '#10b981' },
  { label: '评论总数', value: 0, icon: 'ChatDotRound', color: '#3b82f6' },
  { label: '总阅读量', value: 0, icon: 'View', color: '#f59e0b' },
  { label: '今日访问', value: 0, icon: 'TrendCharts', color: '#ef4444' },
  { label: '待审评论', value: 0, icon: 'Warning', color: '#8b5cf6' },
]);

const popularArticles = ref<{ id: number; title: string; viewCount: number }[]>([]);

function resizeCharts() {
  trendChart?.resize();
  categoryChart?.resize();
}

async function loadStats() {
  loading.value = true;
  try {
    const overview: StatsOverview = await statsApi.getOverview();
    stats.value[0].value = overview.totalArticles;
    stats.value[1].value = overview.totalComments;
    stats.value[2].value = overview.totalViews;
    stats.value[3].value = overview.todayViews;
    stats.value[4].value = overview.pendingComments;
  } catch (err: any) {
    ElMessage.error(err.message || '加载统计数据失败');
  } finally {
    loading.value = false;
  }
}

async function loadTrend() {
  trendLoading.value = true;
  try {
    const trend: VisitTrendItem[] = await statsApi.getVisitTrend(7);
    await nextTick();
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value);
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 20, top: 20, bottom: 30 },
        xAxis: {
          type: 'category',
          data: trend.map((t) => t.date.slice(5)),
        },
        yAxis: { type: 'value' },
        series: [{
          type: 'line',
          data: trend.map((t) => t.count),
          smooth: true,
          areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
          lineStyle: { color: '#10b981', width: 2 },
          itemStyle: { color: '#10b981' },
        }],
      });
    }
  } catch (err: any) {
    ElMessage.error(err.message || '加载访问趋势失败');
  } finally {
    trendLoading.value = false;
  }
}

async function loadCategoryStats() {
  categoryLoading.value = true;
  try {
    const data = await statsApi.getCategoryStats();
    await nextTick();
    if (categoryChartRef.value) {
      categoryChart = echarts.init(categoryChartRef.value);
      categoryChart.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: data.map((d) => ({ name: d.name, value: d.value })),
          label: { show: true, formatter: '{b}: {c}' },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }],
      });
    }
  } catch (err: any) {
    ElMessage.error(err.message || '加载分类统计失败');
  } finally {
    categoryLoading.value = false;
  }
}

async function loadPopular() {
  popularLoading.value = true;
  try {
    popularArticles.value = await statsApi.getPopularArticles(5);
  } catch (err: any) {
    ElMessage.error(err.message || '加载热门文章失败');
  } finally {
    popularLoading.value = false;
  }
}

onMounted(() => {
  loadStats();
  loadTrend();
  loadCategoryStats();
  loadPopular();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  trendChart?.dispose();
  categoryChart?.dispose();
  window.removeEventListener('resize', resizeCharts);
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.charts-row {
  margin-top: 4px;
}

.popular-card {
  margin-top: 4px;
}
</style>
