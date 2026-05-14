<template>
  <div class="coaches-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教练管理</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增教练
          </el-button>
        </div>
      </template>

      <el-table :data="coaches" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="coach_name" label="姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="specialty" label="专长" />
        <el-table-column prop="price_per_hour" label="课时费(元/小时)" width="140">
          <template #default="{ row }">
            <span class="price">¥{{ row.price_per_hour }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="简介" width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.description" placement="top">
              <span>{{ row.description ? row.description.substring(0, 20) + '...' : '-' }}</span>
            </el-tooltip>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleDialogClose">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="coach_name">
              <el-input v-model="form.coach_name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职称" prop="title">
              <el-input v-model="form.title" placeholder="请输入职称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课时费" prop="price_per_hour">
              <el-input-number v-model="form.price_per_hour" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="专长" prop="specialty">
          <el-input v-model="form.specialty" placeholder="请输入专长，如：挥杆动作纠正、短杆技术" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="在职" inactive-text="离职" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入个人简介" />
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

const coaches = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const submitting = ref(false)

const form = reactive({
  id: null,
  coach_name: '',
  phone: '',
  title: '',
  specialty: '',
  avatar: '',
  price_per_hour: 200.00,
  status: true,
  description: ''
})

const rules = {
  coach_name: [{ required: true, message: '请输入姓名', trigger: 'change' }],
  price_per_hour: [{ required: true, message: '请输入课时费', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑教练' : '新增教练')

const loadCoaches = async () => {
  loading.value = true
  try {
    const res = await request.get('/coaches')
    coaches.value = (res.data || []).map(item => ({
      ...item,
      status: item.status === 1 || item.status === true
    }))
  } catch (error) {
    ElMessage.error('加载教练列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      coach_name: row.coach_name,
      phone: row.phone,
      title: row.title,
      specialty: row.specialty,
      avatar: row.avatar || '',
      price_per_hour: row.price_per_hour,
      status: row.status === 1 || row.status === true,
      description: row.description
    })
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: null,
      coach_name: '',
      phone: '',
      title: '',
      specialty: '',
      avatar: '',
      price_per_hour: 200.00,
      status: true,
      description: ''
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
      const res = await request.put(`/coaches/${form.id}`, form)
      ElMessage.success('编辑成功')
    } else {
      const res = await request.post('/coaches', form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    await loadCoaches()
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
    await ElMessageBox.confirm('确定要删除该教练吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/coaches/${row.id}`)
    ElMessage.success('删除成功')
    loadCoaches()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadCoaches()
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
