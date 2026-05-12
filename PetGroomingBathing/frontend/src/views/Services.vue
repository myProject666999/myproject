<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px">
      <h2>服务套餐管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增服务
      </el-button>
    </div>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="服务分类">
        <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 200px" @change="loadServices">
          <el-option label="洗澡" value="bath" />
          <el-option label="SPA" value="spa" />
          <el-option label="剪毛" value="trimming" />
          <el-option label="染色" value="dyeing" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="services" border stripe>
      <el-table-column prop="name" label="服务名称" width="150" />
      <el-table-column label="分类" width="100">
        <template #default="scope">
          <el-tag :type="getCategoryTagType(scope.row.category)">
            {{ getCategoryLabel(scope.row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100">
        <template #default="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长(分钟)" width="100" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑服务' : '新增服务'"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="洗澡" value="bath" />
            <el-option label="SPA" value="spa" />
            <el-option label="剪毛" value="trimming" />
            <el-option label="染色" value="dyeing" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时长" prop="duration">
              <el-input-number v-model="form.duration" :min="1" :step="5" style="width: 100%" />
              <span style="margin-left: 10px">分钟</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入服务描述" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小体重">
              <el-input-number v-model="form.minWeight" :min="0" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大体重">
              <el-input-number v-model="form.maxWeight" :min="0" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getServices, createService, updateService, deleteService } from '@/api/service'

const services = ref([])
const filterCategory = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: '',
  name: '',
  category: '',
  price: 0,
  duration: 60,
  description: '',
  applicableBreeds: '',
  minWeight: null,
  maxWeight: null
})

const rules = {
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }]
}

const getCategoryLabel = (category) => {
  const map = { bath: '洗澡', spa: 'SPA', trimming: '剪毛', dyeing: '染色' }
  return map[category] || category
}

const getCategoryTagType = (category) => {
  const map = { bath: 'primary', spa: 'success', trimming: 'warning', dyeing: 'danger' }
  return map[category] || 'info'
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    name: '',
    category: '',
    price: 0,
    duration: 60,
    description: '',
    applicableBreeds: '',
    minWeight: null,
    maxWeight: null
  })
}

const loadServices = async () => {
  const data = await getServices(filterCategory.value || undefined)
  services.value = data
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
  ElMessageBox.confirm('确认删除该服务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteService(row.id)
    ElMessage.success('删除成功')
    loadServices()
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateService(form.id, form)
    ElMessage.success('更新成功')
  } else {
    await createService(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadServices()
}

onMounted(() => {
  loadServices()
})
</script>
