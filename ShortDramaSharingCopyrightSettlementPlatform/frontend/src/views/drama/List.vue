<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">剧集管理</span>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增剧集
      </el-button>
    </div>

    <div class="table-container">
      <div class="search-bar">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索剧集名称"
          clearable
          style="width: 250px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="未上架" :value="0" />
          <el-option label="已上架" :value="1" />
          <el-option label="已下架" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="drama_no" label="剧集编号" width="180" />
        <el-table-column prop="title" label="剧集名称" min-width="200" />
        <el-table-column prop="total_episodes" label="集数" width="100" />
        <el-table-column prop="duration" label="单集时长(分钟)" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleRights(row)">权益分配</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="剧集名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入剧集名称" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入剧集简介"
          />
        </el-form-item>
        <el-form-item label="总集数" prop="total_episodes">
          <el-input-number v-model="form.total_episodes" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="单集时长" prop="duration">
          <el-input-number v-model="form.duration" :min="1" :max="120" />
          <span style="margin-left: 8px">分钟</span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="未上架" :value="0" />
            <el-option label="已上架" :value="1" />
            <el-option label="已下架" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="rightsDialogVisible"
      title="权益分配"
      width="800px"
    >
      <div class="rights-header">
        <span>剧集：{{ currentDrama?.title }}</span>
        <el-button type="primary" size="small" @click="handleAddRight">
          <el-icon><Plus /></el-icon>
          添加权益
        </el-button>
      </div>
      <el-table :data="dramaRights" style="width: 100%" v-loading="rightsLoading">
        <el-table-column prop="stakeholder_name" label="权益方" />
        <el-table-column prop="role_name" label="角色" />
        <el-table-column prop="base_ratio" label="分账比例(%)" width="150">
          <template #default="{ row }">
            {{ row.base_ratio }}%
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '生效中' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleRemoveRight(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="rightsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDramaList, createDrama, updateDrama, deleteDrama, getDramaRights, addDramaRight, removeDramaRight } from '@/api/drama'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增剧集')
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  title: '',
  description: '',
  total_episodes: 1,
  duration: 10,
  status: 0
})

const formRules = {
  title: [{ required: true, message: '请输入剧集名称', trigger: 'blur' }],
  total_episodes: [{ required: true, message: '请输入总集数', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入单集时长', trigger: 'blur' }]
}

const getStatusType = (status) => {
  const types = ['info', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['未上架', '已上架', '已下架']
  return texts[status] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      keyword: searchForm.keyword
    }
    if (searchForm.status !== '') {
      params.status = searchForm.status
    }
    const res = await getDramaList(params)
    if (res) {
      tableData.value = res.list || []
      pagination.total = res.total || 0
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增剧集'
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑剧集'
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    title: row.title,
    description: row.description || '',
    total_episodes: row.total_episodes,
    duration: row.duration,
    status: row.status
  })
  dialogVisible.value = true
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.total_episodes = 1
  form.duration = 10
  form.status = 0
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateDrama(editId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createDrama(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败', error)
      }
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该剧集吗？', '提示', {
      type: 'warning'
    })
    await deleteDrama(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

const currentDrama = ref(null)
const rightsDialogVisible = ref(false)
const dramaRights = ref([])
const rightsLoading = ref(false)

const handleRights = async (row) => {
  currentDrama.value = row
  rightsDialogVisible.value = true
  await loadDramaRights(row.id)
}

const loadDramaRights = async (dramaId) => {
  rightsLoading.value = true
  try {
    const res = await getDramaRights(dramaId)
    if (res) {
      dramaRights.value = res.list || []
    }
  } catch (error) {
    console.error('加载权益失败', error)
  } finally {
    rightsLoading.value = false
  }
}

const handleAddRight = () => {
  ElMessage.info('请先创建权益方后再进行分配')
}

const handleRemoveRight = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该权益分配吗？', '提示', {
      type: 'warning'
    })
    await removeDramaRight(row.id)
    ElMessage.success('删除成功')
    loadDramaRights(currentDrama.value.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.rights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}
</style>
