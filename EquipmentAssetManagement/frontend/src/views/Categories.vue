<template>
  <div class="categories-page">
    <div class="page-header">
      <h2 class="page-title">资产分类</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table :data="categories" v-loading="loading">
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="parent_id" label="上级分类" width="120">
          <template #default="{ row }">
            {{ getParentName(row.parent_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="deleteCategory(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select v-model="categoryForm.parent_id" style="width: 100%">
            <el-option label="无" :value="0" />
            <el-option 
              v-for="cat in categories.filter(c => c.parent_id === 0)" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { categories as categoriesApi } from '../api'

const loading = ref(false)
const categories = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const categoryFormRef = ref(null)
const categoryForm = reactive({
  id: null,
  name: '',
  parent_id: 0,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const getParentName = (parentId) => {
  if (!parentId || parentId === 0) return '无'
  const parent = categories.value.find(c => c.id === parentId)
  return parent ? parent.name : '无'
}

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await categoriesApi.getList()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  Object.keys(categoryForm).forEach(key => {
    categoryForm[key] = key === 'parent_id' ? 0 : ''
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  Object.assign(categoryForm, row)
  dialogVisible.value = true
}

const saveCategory = async () => {
  if (!categoryFormRef.value) return
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (isEdit.value) {
          res = await categoriesApi.update(categoryForm.id, categoryForm)
        } else {
          res = await categoriesApi.create(categoryForm)
        }
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadCategories()
        }
      } catch (error) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

const deleteCategory = (row) => {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await categoriesApi.delete(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadCategories()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.table-card {
  margin-bottom: 20px;
}
</style>
