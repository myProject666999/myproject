<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>

    <el-card style="margin-bottom: 20px">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="balance" label="余额(¥)" width="120">
          <template #default="{ row }">
            <span style="color: #ff6034">{{ row.balance?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_vip" label="VIP" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.is_vip" type="warning">VIP</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; text-align: right"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

const loading = ref(false)
const users = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filters = reactive({
  status: undefined as number | undefined
})

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

async function loadData() {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize.value
    }
    if (filters.status !== undefined) {
      params.status = filters.status
    }

    const res = await request.get('/admin/users', { params })
    users.value = res.users || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载用户失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
