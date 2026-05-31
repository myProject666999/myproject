<template>
  <div class="event-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Event List</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            Create Event
          </el-button>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Keyword">
          <el-input v-model="searchForm.keyword" placeholder="Search by title" clearable @keyup.enter="fetchList" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="Select status" clearable style="width: 150px">
            <el-option label="Draft" value="DRAFT" />
            <el-option label="Published" value="PUBLISHED" />
            <el-option label="Registration Open" value="REGISTRATION_OPEN" />
            <el-option label="Registration Closed" value="REGISTRATION_CLOSED" />
            <el-option label="Ongoing" value="ONGOING" />
            <el-option label="Completed" value="COMPLETED" />
            <el-option label="Cancelled" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="Title" min-width="150" />
        <el-table-column prop="address" label="Address" min-width="200" />
        <el-table-column prop="startTime" label="Start Time" width="180" :formatter="formatDate" />
        <el-table-column prop="endTime" label="End Time" width="180" :formatter="formatDate" />
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registrationEnd" label="Registration End" width="180" :formatter="formatDate" />
        <el-table-column label="Actions" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">View</el-button>
            <el-button link type="primary" @click="handleEdit(row)">Edit</el-button>
            <el-button link type="success" @click="handleStatusUpdate(row, 'PUBLISHED')" v-if="row.status === 'DRAFT'">Publish</el-button>
            <el-button link type="warning" @click="handleStatusUpdate(row, 'CANCELLED')" v-if="row.status !== 'CANCELLED' && row.status !== 'COMPLETED'">Cancel</el-button>
            <el-button link type="danger" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getEventList, deleteEvent, updateEventStatus } from '@/api/event'
import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const searchForm = ref({
  keyword: '',
  status: ''
})
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (row, column, cellValue) => {
  return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm') : '-'
}

const getStatusType = (status) => {
  const typeMap = {
    DRAFT: 'info',
    PUBLISHED: 'primary',
    REGISTRATION_OPEN: 'success',
    REGISTRATION_CLOSED: 'warning',
    ONGOING: 'danger',
    COMPLETED: 'success',
    CANCELLED: 'info'
  }
  return typeMap[status] || 'info'
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    const res = await getEventList(params)
    tableData.value = res.data.list || res.data.records || []
    pagination.value.total = res.data.total || 0
  } catch (err) {
    ElMessage.error('Failed to fetch events')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.value = { keyword: '', status: '' }
  pagination.value.pageNum = 1
  fetchList()
}

const handleCreate = () => {
  router.push('/event/create')
}

const handleView = (row) => {
  router.push(`/event/detail/${row.id}`)
}

const handleEdit = (row) => {
  router.push(`/event/create?id=${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this event?', 'Confirm', {
      type: 'warning'
    })
    await deleteEvent(row.id)
    ElMessage.success('Deleted successfully')
    fetchList()
  } catch {
  }
}

const handleStatusUpdate = async (row, status) => {
  try {
    await updateEventStatus(row.id, status)
    ElMessage.success('Status updated')
    fetchList()
  } catch (err) {
    ElMessage.error('Failed to update status')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.event-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
