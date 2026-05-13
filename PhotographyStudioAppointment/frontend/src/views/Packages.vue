<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-input v-model="filter.keyword" placeholder="搜索套餐名称" clearable style="width: 200px" @clear="fetchList" @keyup.enter="fetchList" />
      <el-select v-model="filter.type" placeholder="套餐类型" clearable style="width: 150px" @change="fetchList">
        <el-option label="婚纱摄影" value="wedding" />
        <el-option label="艺术照" value="art" />
        <el-option label="儿童摄影" value="children" />
        <el-option label="其他" value="other" />
      </el-select>
      <el-select v-model="filter.status" placeholder="状态" clearable style="width: 120px" @change="fetchList">
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="inactive" />
      </el-select>
      <el-button type="primary" @click="fetchList">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="success" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增套餐
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="套餐名称" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="photoCount" label="精修张数" width="100" />
        <el-table-column prop="originalPhotoCount" label="原片数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择套餐类型" style="width: 100%">
            <el-option label="婚纱摄影" value="wedding" />
            <el-option label="艺术照" value="art" />
            <el-option label="儿童摄影" value="children" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" placeholder="请输入价格" style="width: 100%" />
        </el-form-item>
        <el-form-item label="精修张数" prop="photoCount">
          <el-input-number v-model="form.photoCount" :min="0" placeholder="精修照片数量" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原片数量" prop="originalPhotoCount">
          <el-input-number v-model="form.originalPhotoCount" :min="0" placeholder="原片数量" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" placeholder="数字越小越靠前" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入套餐描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPackages, createPackage, updatePackage, deletePackage } from '@/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const filter = reactive({
  keyword: '',
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  name: '',
  type: 'other',
  price: 0,
  photoCount: 0,
  originalPhotoCount: 0,
  description: '',
  status: 'active',
  sort: 0
})

const rules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择套餐类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑套餐' : '新增套餐')

const getTypeText = (type) => {
  const map = { wedding: '婚纱摄影', art: '艺术照', children: '儿童摄影', other: '其他' }
  return map[type] || type
}

const getTypeTag = (type) => {
  const map = { wedding: 'danger', art: 'warning', children: 'success', other: 'info' }
  return map[type] || 'info'
}

const fetchList = async () => {
  loading.value = true
  try {
    const data = await getPackages({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    type: 'other',
    price: 0,
    photoCount: 0,
    originalPhotoCount: 0,
    description: '',
    status: 'active',
    sort: 0
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该套餐吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deletePackage(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    if (isEdit.value) {
      await updatePackage(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createPackage(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>
