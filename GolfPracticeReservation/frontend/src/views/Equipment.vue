<template>
  <div class="equipment-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>球具租赁管理</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增球具
          </el-button>
        </div>
      </template>

      <el-table :data="equipment" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="equipment_name" label="名称" width="150" />
        <el-table-column prop="equipment_code" label="编号" width="130" />
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="specs" label="规格" width="150" />
        <el-table-column prop="rental_price" label="租赁价" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.rental_price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_quantity" label="总数量" width="80" />
        <el-table-column prop="available_quantity" label="可用数量" width="90">
          <template #default="{ row }">
            <el-tag :type="getStockType(row.available_quantity, row.total_quantity)">
              {{ row.available_quantity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="handleDialogClose">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="球具名称" prop="equipment_name">
              <el-input v-model="form.equipment_name" placeholder="请输入球具名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="球具编号" prop="equipment_code">
              <el-input v-model="form.equipment_code" placeholder="请输入球具编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.category_name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格" prop="specs">
              <el-input v-model="form.specs" placeholder="请输入规格" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租赁价格" prop="rental_price">
              <el-input-number v-model="form.rental_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总数量" prop="total_quantity">
              <el-input-number v-model="form.total_quantity" :min="0" style="width: 100%" @change="onQuantityChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可用数量" prop="available_quantity">
              <el-input-number v-model="form.available_quantity" :min="0" :max="form.total_quantity" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const equipment = ref([])
const categories = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const submitting = ref(false)

const form = reactive({
  id: null,
  category_id: null,
  equipment_name: '',
  equipment_code: '',
  brand: '',
  specs: '',
  rental_price: 0,
  total_quantity: 0,
  available_quantity: 0,
  status: true,
  description: '',
  image: ''
})

const rules = {
  equipment_name: [{ required: true, message: '请输入球具名称', trigger: 'change' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  rental_price: [{ required: true, message: '请输入租赁价格', trigger: 'change' }],
  total_quantity: [{ required: true, message: '请输入总数量', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑球具' : '新增球具')

const getStockType = (available, total) => {
  if (available === 0) return 'danger'
  if (available / total < 0.3) return 'warning'
  return 'success'
}

const onQuantityChange = (val) => {
  if (form.available_quantity > val) {
    form.available_quantity = val
  }
}

const loadEquipment = async () => {
  loading.value = true
  try {
    const res = await request.get('/equipment')
    equipment.value = (res.data || []).map(item => ({
      ...item,
      status: item.status === 1 || item.status === true
    }))
  } catch (error) {
    ElMessage.error('加载球具列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await request.get('/equipment-categories')
    categories.value = res.data || []
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      category_id: row.category_id,
      equipment_name: row.equipment_name,
      equipment_code: row.equipment_code || '',
      brand: row.brand || '',
      specs: row.specs || '',
      rental_price: Number(row.rental_price),
      total_quantity: Number(row.total_quantity),
      available_quantity: Number(row.available_quantity),
      status: row.status === 1 || row.status === true,
      description: row.description || '',
      image: row.image || ''
    })
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: null,
      category_id: categories.value[0]?.id || null,
      equipment_name: '',
      equipment_code: '',
      brand: '',
      specs: '',
      rental_price: 0,
      total_quantity: 0,
      available_quantity: 0,
      status: true,
      description: '',
      image: ''
    })
  }
  dialogVisible.value = true
}

const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate().catch(err => {
      console.error('表单验证失败:', err)
      return false
    })
    
    if (!valid) {
      ElMessage.warning('请填写必填项')
      return
    }
    
    submitting.value = true
    
    if (isEdit.value) {
      await request.put(`/equipment/${form.id}`, form)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/equipment', form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    await loadEquipment()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.response) {
      ElMessage.error('提交失败: ' + (error.response.data?.message || error.response.data?.error || '服务器错误'))
    } else if (error.request) {
      ElMessage.error('提交失败: 网络错误，请检查后端服务是否运行')
    } else {
      ElMessage.error('提交失败: ' + (error.message || '未知错误'))
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该球具吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/equipment/${row.id}`)
    ElMessage.success('删除成功')
    loadEquipment()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadEquipment()
  loadCategories()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-weight: 500;
}
</style>
