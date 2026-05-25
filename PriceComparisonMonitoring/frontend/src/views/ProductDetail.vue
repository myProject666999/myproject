<template>
  <div v-if="product">
    <div class="page-header">
      <div>
        <el-button @click="$router.back()" :icon="ArrowLeft">返回</el-button>
        <h2 style="display: inline; margin-left: 16px;">商品详情</h2>
      </div>
      <div>
        <el-button @click="showEditDialog = true" :icon="Edit">编辑</el-button>
        <el-button type="danger" @click="handleDelete" :icon="Delete">删除</el-button>
      </div>
    </div>
    
    <div class="product-detail">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        class="detail-image"
        alt=""
      />
      <div v-else class="detail-image" style="display: flex; align-items: center; justify-content: center;">
        <el-icon :size="80"><ShoppingBag /></el-icon>
      </div>
      
      <div class="detail-info">
        <h1 class="detail-title">{{ product.title }}</h1>
        
        <div class="detail-price">
          <span>¥</span>
          {{ product.current_price?.toFixed(2) || '--' }}
        </div>
        
        <div v-if="product.original_price" class="product-original-price" style="font-size: 18px;">
          原价：<span style="text-decoration: line-through;">¥{{ product.original_price.toFixed(2) }}</span>
        </div>
        
        <div class="price-stat">
          <div class="price-stat-item">
            <div class="price-stat-label">历史最低</div>
            <div class="price-stat-value" style="color: #67c23a;">
              ¥{{ product.lowest_price?.toFixed(2) || '--' }}
            </div>
          </div>
          <div class="price-stat-item">
            <div class="price-stat-label">历史最高</div>
            <div class="price-stat-value" style="color: #f56c6c;">
              ¥{{ product.highest_price?.toFixed(2) || '--' }}
            </div>
          </div>
          <div class="price-stat-item">
            <div class="price-stat-label">监控状态</div>
            <div class="price-stat-value">
              <el-tag :type="product.status === 1 ? 'success' : 'info'">
                {{ product.status === 1 ? '监控中' : '已停止' }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <span style="color: #909399; margin-right: 8px;">商品链接：</span>
          <el-link :href="product.product_url" type="primary" target="_blank">
            查看原页面
            <el-icon><Link /></el-icon>
          </el-link>
        </div>
        
        <div v-if="product.platform">
          <span style="color: #909399; margin-right: 8px;">平台：</span>
          <el-tag>{{ product.platform }}</el-tag>
        </div>
        
        <div v-if="product.remark" style="margin-top: 16px; color: #606266;">
          <span style="color: #909399;">备注：</span>
          {{ product.remark }}
        </div>
      </div>
    </div>
    
    <div class="price-trend-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0;">价格趋势</h3>
        <el-radio-group v-model="trendDays" size="small" @change="loadTrend">
          <el-radio-button :value="7">近7天</el-radio-button>
          <el-radio-button :value="30">近30天</el-radio-button>
          <el-radio-button :value="90">近90天</el-radio-button>
        </el-radio-group>
      </div>
      
      <v-chart :option="chartOption" autoresize style="height: 400px;" />
    </div>
    
    <div class="card-container">
      <h3 style="margin: 0 0 16px;">价格历史记录</h3>
      <el-table :data="histories" stripe>
        <el-table-column prop="crawled_at" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.crawled_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="original_price" label="原价" width="120">
          <template #default="{ row }">
            {{ row.original_price ? `¥${row.original_price.toFixed(2)}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="discount" label="折扣" width="100">
          <template #default="{ row }">
            {{ row.discount ? `${row.discount.toFixed(1)}%` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="stock_status" label="库存" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.stock_status === 'in_stock'" type="success">有货</el-tag>
            <el-tag v-else-if="row.stock_status === 'out_of_stock'" type="danger">缺货</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.source === 'auto' ? 'info' : 'warning'">
              {{ row.source === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="histories.length > 0" style="text-align: center; margin-top: 16px;">
        <el-pagination
          v-model:current-page="historyPage"
          :page-size="historyPageSize"
          :total="historyTotal"
          layout="prev, pager, next"
          @current-change="loadHistory"
        />
      </div>
    </div>
    
    <el-dialog v-model="showEditDialog" title="编辑商品" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="商品标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="商品链接">
          <el-input v-model="editForm.product_url" />
        </el-form-item>
        <el-form-item label="当前价格">
          <el-input-number v-model="editForm.current_price" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="editForm.original_price" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="监控状态">
          <el-switch
            v-model="editForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="监控中"
            inactive-text="已停止"
          />
        </el-form-item>
        <el-form-item label="抓取间隔(秒)">
          <el-input-number v-model="editForm.crawl_interval" :min="300" :step="60" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
  
  <div v-else class="empty-state">
    <el-icon class="empty-icon"><Loading /></el-icon>
    <p class="empty-text">加载中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete, Link, ShoppingBag, Loading } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent
])

const route = useRoute()
const router = useRouter()

const product = ref(null)
const histories = ref([])
const historyPage = ref(1)
const historyPageSize = ref(20)
const historyTotal = ref(0)
const trendDays = ref(7)
const showEditDialog = ref(false)
const editForm = ref({})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const data = params[0]
      return `${data.name}<br/>价格: ¥${data.value.toFixed(2)}`
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trendData.value.map(d => d.date)
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '¥{value}'
    }
  },
  dataZoom: [
    { type: 'inside', start: 0, end: 100 },
    { type: 'slider', start: 0, end: 100 }
  ],
  series: [{
    name: '价格',
    type: 'line',
    smooth: true,
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ]
      }
    },
    lineStyle: {
      color: '#409eff',
      width: 2
    },
    itemStyle: {
      color: '#409eff'
    },
    data: trendData.value.map(d => d.price)
  }]
}))

const trendData = ref([])

onMounted(() => {
  loadProduct()
})

const loadProduct = async () => {
  try {
    const res = await productApi.getDetail(route.params.id)
    product.value = res.data
    editForm.value = { ...res.data }
    loadHistory()
    loadTrend()
  } catch (e) {
    console.error(e)
  }
}

const loadHistory = async () => {
  try {
    const res = await productApi.getHistory(route.params.id, {
      page: historyPage.value,
      page_size: historyPageSize.value
    })
    histories.value = res.data?.list || []
    historyTotal.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  }
}

const loadTrend = async () => {
  try {
    const res = await productApi.getTrend(route.params.id, {
      days: trendDays.value
    })
    trendData.value = res.data?.trend || []
  } catch (e) {
    console.error(e)
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const handleUpdate = async () => {
  try {
    await productApi.update(route.params.id, editForm.value)
    ElMessage.success('更新成功')
    showEditDialog.value = false
    loadProduct()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除这个商品吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await productApi.delete(route.params.id)
      ElMessage.success('删除成功')
      router.push('/products')
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}
</script>
