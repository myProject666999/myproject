<template>
  <div class="ticket-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Tickets /></el-icon>
          <span>我的工单</span>
          <el-button type="primary" @click="$router.push('/ticket/create')">
            <el-icon><Plus /></el-icon>
            新建工单
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.statusCode" placeholder="全部" clearable @change="loadTickets">
            <el-option
              v-for="status in statuses"
              :key="status.code"
              :label="status.name"
              :value="status.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader
            v-model="searchForm.categoryId"
            :options="categoryOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="全部"
            clearable
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priorityId" placeholder="全部" clearable @change="loadTickets">
            <el-option
              v-for="priority in priorities"
              :key="priority.id"
              :label="priority.name"
              :value="priority.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索工单" @keyup.enter="loadTickets" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTickets">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="ticketList" stripe style="width: 100%" @row-click="goDetail">
        <el-table-column prop="ticketNo" label="工单号" width="160" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="priorityName" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :color="row.priorityColor" effect="dark" size="small">{{ row.priorityName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :color="row.statusColor" effect="dark" size="small">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="处理人" width="100">
          <template #default="{ row }">
            {{ row.assigneeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="messageCount" label="消息数" width="80" />
        <el-table-column prop="lastMessageAt" label="最后消息" width="160">
          <template #default="{ row }">
            {{ row.lastMessageAt ? formatTime(row.lastMessageAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="$router.push(`/ticket/detail/${row.id}`)">
              查看
            </el-button>
            <el-button
              v-if="row.statusCode === 'pending'"
              type="success"
              link
              @click.stop="handleClaim(row)"
            >
              领取
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadTickets"
          @current-change="loadTickets"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTicketList, getTicketStatuses, getTicketCategories, getTicketPriorities, claimTicket } from '@/api/ticket'
import dayjs from 'dayjs'

const userStore = useUserStore()

const searchForm = reactive({
  statusCode: '',
  categoryId: [],
  priorityId: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const ticketList = ref([])
const statuses = ref([])
const categoryOptions = ref([])
const priorities = ref([])

function formatTime(time) {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

async function loadStatuses() {
  const res = await getTicketStatuses()
  if (res.code === 0) {
    statuses.value = res.data
  }
}

async function loadCategories() {
  const res = await getTicketCategories()
  if (res.code === 0) {
    categoryOptions.value = res.data
  }
}

async function loadPriorities() {
  const res = await getTicketPriorities()
  if (res.code === 0) {
    priorities.value = res.data
  }
}

async function loadTickets() {
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    statusCode: searchForm.statusCode,
    priorityId: searchForm.priorityId,
    keyword: searchForm.keyword
  }
  
  if (searchForm.categoryId.length > 0) {
    params.categoryId = searchForm.categoryId[searchForm.categoryId.length - 1]
  }

  const res = await getTicketList(params)
  if (res.code === 0) {
    ticketList.value = res.data.list || []
    pagination.total = res.data.total || 0
  }
}

function handleCategoryChange(val) {
  loadTickets()
}

function goDetail(row) {
  router.push(`/ticket/detail/${row.id}`)
}

async function handleClaim(row) {
  try {
    await ElMessageBox.confirm('确定要领取此工单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const res = await claimTicket(row.id)
    if (res.code === 0) {
      ElMessage.success('领取成功')
      loadTickets()
    } else {
      ElMessage.error(res.message || '领取失败')
    }
  } catch (e) {}
}

onMounted(() => {
  loadStatuses()
  loadCategories()
  loadPriorities()
  loadTickets()
})
</script>

<script>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
