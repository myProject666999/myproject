<template>
  <div class="announcement-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Announcement Management</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            Create Announcement
          </el-button>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Event">
          <el-select v-model="searchForm.eventId" placeholder="Select event" clearable style="width: 200px">
            <el-option v-for="event in events" :key="event.id" :label="event.title" :value="event.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="Select status" clearable style="width: 150px">
            <el-option label="Draft" value="DRAFT" />
            <el-option label="Published" value="PUBLISHED" />
            <el-option label="Revoked" value="REVOKED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="Title" min-width="200" />
        <el-table-column prop="type" label="Type" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type || 'General' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isTop" label="Top" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isTop" type="danger">Yes</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="Publish Time" width="180" :formatter="formatDate" />
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" @click="handlePublish(row)" v-if="row.status === 'DRAFT'">Publish</el-button>
            <el-button link type="warning" @click="handleRevoke(row)" v-if="row.status === 'PUBLISHED'">Revoke</el-button>
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
    <el-dialog v-model="showCreateDialog" title="Create Announcement" width="600px">
      <el-form :model="announcementForm" label-width="100px">
        <el-form-item label="Event">
          <el-select v-model="announcementForm.eventId" placeholder="Select event" style="width: 100%">
            <el-option v-for="event in events" :key="event.id" :label="event.title" :value="event.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Title">
          <el-input v-model="announcementForm.title" placeholder="Enter title" />
        </el-form-item>
        <el-form-item label="Content">
          <el-input v-model="announcementForm.content" type="textarea" :rows="5" placeholder="Enter content" />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="announcementForm.type" style="width: 100%">
            <el-option label="General" value="GENERAL" />
            <el-option label="Important" value="IMPORTANT" />
            <el-option label="Urgent" value="URGENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="Top">
          <el-switch v-model="announcementForm.isTop" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnnouncementList, createAnnouncement, publishAnnouncement, revokeAnnouncement } from '@/api/announcement'
import { getEventList } from '@/api/event'
import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const loading = ref(false)
const creating = ref(false)
const tableData = ref([])
const events = ref([])
const showCreateDialog = ref(false)
const searchForm = ref({
  eventId: '',
  status: ''
})
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const announcementForm = ref({
  eventId: '',
  title: '',
  content: '',
  type: 'GENERAL',
  isTop: false
})

const getStatusType = (status) => {
  const typeMap = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    REVOKED: 'warning'
  }
  return typeMap[status] || 'info'
}

const formatDate = (row, column, cellValue) => {
  return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm') : '-'
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
    const res = await getAnnouncementList(params)
    tableData.value = res.data.list || res.data.records || []
    pagination.value.total = res.data.total || 0
  } catch (err) {
    ElMessage.error('Failed to fetch announcements')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.value = { eventId: '', status: '' }
  pagination.value.pageNum = 1
  fetchList()
}

const handleCreate = async () => {
  if (!announcementForm.value.title) {
    ElMessage.warning('Please enter title')
    return
  }
  creating.value = true
  try {
    await createAnnouncement(announcementForm.value)
    ElMessage.success('Created successfully')
    showCreateDialog.value = false
    announcementForm.value = { eventId: '', title: '', content: '', type: 'GENERAL', isTop: false }
    fetchList()
  } catch (err) {
    ElMessage.error('Failed to create')
  } finally {
    creating.value = false
  }
}

const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm('Publish this announcement?', 'Confirm', {
      type: 'warning'
    })
    await publishAnnouncement(row.id)
    ElMessage.success('Published')
    fetchList()
  } catch {
  }
}

const handleRevoke = async (row) => {
  try {
    await ElMessageBox.confirm('Revoke this announcement?', 'Confirm', {
      type: 'warning'
    })
    await revokeAnnouncement(row.id)
    ElMessage.success('Revoked')
    fetchList()
  } catch {
  }
}

onMounted(() => {
  fetchEvents()
  fetchList()
})
</script>

<style scoped>
.announcement-list-container {
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
