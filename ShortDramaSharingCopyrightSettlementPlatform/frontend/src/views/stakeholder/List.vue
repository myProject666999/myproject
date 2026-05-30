<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">权益方管理</span>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增权益方
      </el-button>
    </div>

    <div class="table-container">
      <div class="search-bar">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索权益方名称"
          clearable
          style="width: 250px"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="stakeholder_no" label="权益方编号" width="180" />
        <el-table-column prop="name" label="权益方名称" min-width="200" />
        <el-table-column prop="type_code" label="类型" width="120" />
        <el-table-column prop="contact_person" label="联系人" width="120" />
        <el-table-column prop="contact_phone" label="联系电话" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="权益方类型" prop="type_code">
          <el-select v-model="form.type_code" style="width: 100%">
            <el-option label="平台方" value="PLATFORM" />
            <el-option label="出品方" value="PRODUCER" />
            <el-option label="编剧" value="SCREENWRITER" />
            <el-option label="导演" value="DIRECTOR" />
            <el-option label="演员" value="ACTOR" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="权益方名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权益方名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact_person">
          <el-input v-model="form.contact_person" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact_phone">
          <el-input v-model="form.contact_phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStakeholderList, createStakeholder, updateStakeholder, deleteStakeholder } from '@/api/stakeholder'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增权益方')
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  type_code: 'PRODUCER',
  name: '',
  contact_person: '',
  contact_phone: '',
  status: 1
})

const formRules = {
  type_code: [{ required: true, message: '请选择权益方类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入权益方名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      keyword: searchForm.keyword
    }
    const res = await getStakeholderList(params)
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
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增权益方'
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑权益方'
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    type_code: row.type_code,
    name: row.name,
    contact_person: row.contact_person || '',
    contact_phone: row.contact_phone || '',
    status: row.status
  })
  dialogVisible.value = true
}

const resetForm = () => {
  form.type_code = 'PRODUCER'
  form.name = ''
  form.contact_person = ''
  form.contact_phone = ''
  form.status = 1
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
          await updateStakeholder(editId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createStakeholder(form)
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
    await ElMessageBox.confirm('确定要删除该权益方吗？', '提示', {
      type: 'warning'
    })
    await deleteStakeholder(row.id)
    ElMessage.success('删除成功')
    loadData()
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
