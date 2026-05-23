<template>
  <div class="manage-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>我的短链</span>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="code" label="短码" width="140">
          <template #default="{ row }">
            <el-link :href="`${BACKEND_BASE}/${row.code}`" type="primary" target="_blank" :underline="false">
              {{ row.code }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="原链接" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link :href="row.url" type="info" target="_blank" :underline="false">
              {{ row.url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="clickCount" label="点击数" width="100" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="expireAt" label="过期时间" width="180">
          <template #default="{ row }">
            {{ row.expireAt || '永不过期' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              link
              @click="handleToggle(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="goStats(row.code)"
            >
              统计
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
import { BACKEND_BASE } from '../config'

const router = useRouter()

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/short/list', {
      params: { page: page.value, size: size.value }
    })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleToggle = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 1 ? '禁用' : '启用'}该短链吗？`,
      '提示',
      { type: 'warning' }
    )
    await request.post('/short/status', { id: row.id, status: row.status === 1 ? 0 : 1 })
    ElMessage.success('操作成功')
    fetchList()
  } catch (e) {
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该短链吗？删除后不可恢复', '警告', {
      type: 'error'
    })
    await request.post('/short/delete', { id: row.id })
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
  }
}

const goStats = (code) => {
  router.push(`/stats/${code}`)
}

onMounted(fetchList)
</script>

<style scoped>
.manage-container {
  padding: 24px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
