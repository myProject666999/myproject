<template>
  <div>
    <h2 class="mb-20">评价管理</h2>

    <el-card>
      <el-table :data="reviews" v-loading="loading">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="order_id" label="订单ID" width="100" />
        <el-table-column label="评分">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="200" />
        <el-table-column label="匿名">
          <template #default="{ row }">
            <el-tag :type="row.is_anonymous ? 'warning' : 'success'">
              {{ row.is_anonymous ? '匿名' : '公开' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="reviews.length === 0 && !loading" description="暂无评价" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getReviews } from '@/api'

const reviews = ref([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getReviews()
    reviews.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

onMounted(loadData)
</script>
