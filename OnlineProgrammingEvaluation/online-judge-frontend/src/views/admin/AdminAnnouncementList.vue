<template>
  <div class="page-container">
    <div class="page-header">
      <h2>公告管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">新建公告</el-button>
    </div>
    <div class="card">
      <el-table :data="announcements" stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="标题" prop="title" />
        <el-table-column label="优先级" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.priority === 1" type="danger">置顶</el-tag>
            <el-tag v-else>普通</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 20px; justify-content: center;"
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="showCreateDialog" :title="editForm.id ? '编辑公告' : '新建公告'" width="600px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="editForm.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-switch v-model="editForm.priority" :active-value="1" :inactive-value="0" active-text="置顶" inactive-text="普通" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const announcements = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateDialog = ref(false)
const editFormRef = ref(null)

const editForm = ref({
  id: null,
  title: '',
  content: '',
  priority: 0
})

const editRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const fetchData = async () => {
  const res = await request.get('/announcement/list', {
    params: { page: currentPage.value, size: pageSize.value }
  })
  announcements.value = res.data.records
  total.value = res.data.total
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleEdit = (row) => {
  Object.assign(editForm.value, row)
  showCreateDialog.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条公告吗？', '提示', { type: 'warning' })
    await request.delete(`/announcement/delete/${id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    // cancelled
  }
}

const handleSave = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editForm.value.id) {
          await request.put('/announcement/update', editForm.value)
        } else {
          await request.post('/announcement/create', editForm.value)
        }
        ElMessage.success('保存成功')
        showCreateDialog.value = false
        fetchData()
      } catch (e) {
        // error handled
      }
    }
  })
}

onMounted(fetchData)
</script>
