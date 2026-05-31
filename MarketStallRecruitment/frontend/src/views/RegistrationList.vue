<template>
  <div class="registration-list-container">
    <el-card>
      <template #header>
        <span>Registration List</span>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Event">
          <el-select v-model="searchForm.eventId" placeholder="Select event" clearable style="width: 200px">
            <el-option v-for="event in events" :key="event.id" :label="event.title" :value="event.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Audit Status">
          <el-select v-model="searchForm.auditStatus" placeholder="Select audit status" clearable style="width: 150px">
            <el-option label="Pending" value="PENDING" />
            <el-option label="Approved" value="APPROVED" />
            <el-option label="Rejected" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="Select status" clearable style="width: 150px">
            <el-option label="Pending" value="PENDING" />
            <el-option label="Confirmed" value="CONFIRMED" />
            <el-option label="Cancelled" value="CANCELLED" />
            <el-option label="Completed" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="businessName" label="Business Name" min-width="150" />
        <el-table-column prop="businessType" label="Business Type" width="120" />
        <el-table-column prop="contactPhone" label="Contact Phone" width="140" />
        <el-table-column prop="auditStatus" label="Audit Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">{{ row.auditStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stallCode" label="Stall Code" width="120" />
        <el-table-column label="Actions" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">View</el-button>
            <el-button link type="success" @click="handleAudit(row, 'APPROVED')" v-if="row.auditStatus === 'PENDING'">Approve</el-button>
            <el-button link type="danger" @click="handleAudit(row, 'REJECTED')" v-if="row.auditStatus === 'PENDING'">Reject</el-button>
            <el-button link type="warning" @click="handleCancel(row)" v-if="row.status !== 'CANCELLED' && row.status !== 'COMPLETED'">Cancel</el-button>
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
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRegistrationList, auditRegistration, cancelRegistration } from '@/api/registration'
import { getEventList } from '@/api/event'

const route = useRoute()
const loading = ref(false)
const tableData = ref([])
const events = ref([])
const searchForm = ref({
  eventId: '',
  auditStatus: '',
  status: ''
})
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const getAuditStatusType = (status) => {
  const typeMap = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusType = (status) => {
  const typeMap = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'info',
    COMPLETED: 'primary'
  }
  return typeMap[status] || 'info'
}

const fetchEvents = async () => {
  try {
    const res = await getEventList({ pageNum: 1, pageSize: 100 })
    events.value = res.data.list || res.data.records || []
  } catch (err) {
    console.error(err)
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    const res = await getRegistrationList(params)
    tableData.value = res.data.list || res.data.records || []
    pagination.value.total = res.data.total || 0
  } catch (err) {
    ElMessage.error('Failed to fetch registrations')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.value = { eventId: '', auditStatus: '', status: '' }
  pagination.value.pageNum = 1
  fetchList()
}

const handleView = (row) => {
  ElMessage.info(`View registration: ${row.id}`)
}

const handleAudit = async (row, auditStatus) => {
  try {
    await ElMessageBox.confirm(`Are you sure you want to ${auditStatus.toLowerCase()} this registration?`, 'Confirm', {
      type: 'warning'
    })
    await auditRegistration({ id: row.id, auditStatus, remark: '' })
    ElMessage.success('Audit completed')
    fetchList()
  } catch {
  }
}

const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to cancel this registration?', 'Confirm', {
      type: 'warning'
    })
    await cancelRegistration(row.id)
    ElMessage.success('Cancelled successfully')
    fetchList()
  } catch {
  }
}

onMounted(() => {
  if (route.query.eventId) {
    searchForm.value.eventId = route.query.eventId
  }
  fetchEvents()
  fetchList()
})
</script>

<style scoped>
.registration-list-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
