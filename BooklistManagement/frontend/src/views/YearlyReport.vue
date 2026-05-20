<template>
  <div class="yearly-report-page">
    <div class="page-header">
      <h2>年度阅读总结</h2>
      <el-date-picker
        v-model="selectedYear"
        type="year"
        placeholder="选择年份"
        value-format="YYYY"
        @change="loadReport"
      />
    </div>

    <div v-if="report" class="report-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon finished">
            <el-icon :size="32"><Checked /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ report.booksFinished }}</div>
            <div class="stat-label">已读书籍</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon reading">
            <el-icon :size="32"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ report.booksReading }}</div>
            <div class="stat-label">在读书籍</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon wishlist">
            <el-icon :size="32"><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ report.booksInWishlist }}</div>
            <div class="stat-label">想读书籍</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon time">
            <el-icon :size="32"><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ report.totalReadingHours.toFixed(1) }}</div>
            <div class="stat-label">阅读时长(小时)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pages">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ report.totalPagesRead }}</div>
            <div class="stat-label">阅读页数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rating">
            <el-icon :size="32"><StarFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ report.averageRating }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <h3>月度阅读时长</h3>
          <div ref="monthlyChartRef" class="chart"></div>
        </div>
        <div class="chart-card">
          <h3>热门标签</h3>
          <div ref="tagsChartRef" class="chart"></div>
        </div>
      </div>

      <div class="section-card">
        <h3>年度最爱作者</h3>
        <div class="authors-list" v-if="Object.keys(report.topAuthors).length > 0">
          <div
            v-for="(count, author) in report.topAuthors"
            :key="author"
            class="author-item"
          >
            <div class="author-rank">{{ getAuthorRank(author) }}</div>
            <div class="author-info">
              <div class="author-name">{{ author }}</div>
              <div class="author-count">{{ count }} 本书</div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无数据" :image-size="80" />
      </div>

      <div class="section-card">
        <h3>今年读完的书</h3>
        <div class="finished-books" v-if="report.finishedBooks && report.finishedBooks.length > 0">
          <div
            v-for="book in report.finishedBooks"
            :key="book.id"
            class="finished-book-item"
            @click="goToDetail(book.id)"
          >
            <div class="book-cover-small">
              <img :src="book.book.coverUrl" :alt="book.book.title" v-if="book.book.coverUrl" />
              <div class="cover-placeholder" v-else>
                <el-icon><Picture /></el-icon>
              </div>
            </div>
            <div class="book-info-small">
              <h4>{{ book.book.title }}</h4>
              <p>{{ book.book.author }}</p>
              <div class="book-meta-small">
                <el-rate v-if="book.rating" :model-value="book.rating" disabled size="small" />
                <span class="end-date">读完于 {{ formatDate(book.endDate) }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="今年还没有读完的书" :image-size="80" />
      </div>
    </div>

    <el-empty v-else-if="!loading" description="暂无数据" />
    <div v-if="loading" class="loading-container">
      <el-loading :fullscreen="false" text="加载中..." />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { booklistAPI } from '@/api'

const router = useRouter()
const selectedYear = ref(String(new Date().getFullYear()))
const report = ref(null)
const loading = ref(false)
const monthlyChartRef = ref(null)
const tagsChartRef = ref(null)
let monthlyChart = null
let tagsChart = null

const loadReport = async () => {
  loading.value = true
  try {
    report.value = await booklistAPI.getYearlyReport(selectedYear.value)
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('加载年度报告失败', error)
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  if (monthlyChartRef.value && report.value) {
    if (monthlyChart) {
      monthlyChart.dispose()
    }
    monthlyChart = echarts.init(monthlyChartRef.value)
    const monthlyData = Object.values(report.value.monthlyReadingMinutes || {})
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}月: {c}分钟'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '分钟'
      },
      series: [{
        data: monthlyData,
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    }
    monthlyChart.setOption(option)
  }

  if (tagsChartRef.value && report.value && Object.keys(report.value.topTags || {}).length > 0) {
    if (tagsChart) {
      tagsChart.dispose()
    }
    tagsChart = echarts.init(tagsChartRef.value)
    const tagData = Object.entries(report.value.topTags || {}).map(([name, value]) => ({ name, value }))
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}本'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        data: tagData
      }]
    }
    tagsChart.setOption(option)
  }
}

const getAuthorRank = (author) => {
  const authors = Object.keys(report.value.topAuthors)
  const rank = authors.indexOf(author) + 1
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const goToDetail = (id) => {
  router.push(`/book/${id}`)
}

const handleResize = () => {
  monthlyChart?.resize()
  tagsChart?.resize()
}

onMounted(() => {
  loadReport()
  window.addEventListener('resize', handleResize)
})

watch(
  () => selectedYear.value,
  () => {
    loadReport()
  }
)
</script>

<style scoped>
.yearly-report-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.finished {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-icon.reading {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-icon.wishlist {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.time {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.stat-icon.pages {
  background: linear-gradient(135deg, #909399, #a6a9ad);
}

.stat-icon.rating {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.chart {
  height: 300px;
}

.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.authors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.author-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.author-rank {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.author-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.author-count {
  font-size: 13px;
  color: #909399;
}

.finished-books {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.finished-book-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.finished-book-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.book-cover-small {
  width: 60px;
  height: 84px;
  background: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  color: #c0c4cc;
}

.book-info-small {
  flex: 1;
  min-width: 0;
}

.book-info-small h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info-small p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta-small {
  display: flex;
  align-items: center;
  gap: 8px;
}

.end-date {
  font-size: 12px;
  color: #909399;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
