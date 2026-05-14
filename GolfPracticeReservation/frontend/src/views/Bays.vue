<template>
  <div class="bays-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>打位管理</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增打位
          </el-button>
        </div>
      </template>

      <el-table :data="bays" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="bay_number" label="打位编号" width="120" />
        <el-table-column prop="bay_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getBayTypeTag(row.bay_type)">{{ getBayTypeText(row.bay_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="has_sensor" label="传感器" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.has_sensor" type="success">有</el-tag>
            <el-tag v-else type="info">无</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getBayStatusTag(row.status)">{{ getBayStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price_per_hour" label="价格(元/小时)" width="140">
          <template #default="{ row }">
            <span class="price">¥{{ row.price_per_hour }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="打位编号" prop="bay_number">
          <el-input v-model="form.bay_number" placeholder="请输入打位编号" />
        </el-form-item>
        <el-form-item label="打位类型" prop="bay_type">
          <el-select v-model="form.bay_type" placeholder="请选择类型" style="width: 100%">
            <el-option label="单人打位" value="single" />
            <el-option label="双人打位" value="double" />
            <el-option label="VIP打位" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-input-number v-model="form.floor" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="是否有传感器">
          <el-switch v-model="form.has_sensor" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="可用" value="available" />
            <el-option label="使用中" value="occupied" />
            <el-option label="维护" value="maintenance" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="每小时价格" prop="price_per_hour">
          <el-input-number v-model="form.price_per_hour" :min="0" :precision="2" />
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

const bays = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const submitting = ref(false)

const form = reactive({
  id: null,
  bay_number: '',
  bay_type: 'single',
  floor: 1,
  position_x: 0,
  position_y: 0,
  has_sensor: false,
  status: 'available',
  price_per_hour: 50.00,
  description: ''
})

const rules = {
  bay_number: [{ required: true, message: '请输入打位编号', trigger: 'blur' }],
  bay_type: [{ required: true, message: '请选择打位类型', trigger: 'change' }],
  floor: [{ required: true, message: '请输入楼层', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  price_per_hour: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑打位' : '新增打位')

const getBayTypeText = (type) => {
  const map = { single: '单人打位', double: '双人打位', vip: 'VIP打位' }
  return map[type] || type
}

const getBayTypeTag = (type) => {
  const map = { single: '', double: 'success', vip: 'warning' }
  return map[type] || ''
}

const getBayStatusText = (status) => {
  const map = { available: '可用', occupied: '使用中', maintenance: '维护', disabled: '禁用' }
  return map[status] || status
}

const getBayStatusTag = (status) => {
  const map = { available: 'success', occupied: 'danger', maintenance: 'warning', disabled: 'info' }
  return map[status] || ''
}

const loadBays = async () => {
  loading.value = true
  try {
    const res = await request.get('/bays')
    bays.value = res.data || []
  } catch (error) {
    ElMessage.error('加载打位列表失败')
  } finally {
    loading.value = false
  }
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      bay_number: row.bay_number,
      bay_type: row.bay_type,
      floor: row.floor,
      position_x: row.position_x || 0,
      position_y: row.position_y || 0,
      has_sensor: row.has_sensor === 1 || row.has_sensor === true,
      status: row.status,
      price_per_hour: row.price_per_hour,
      description: row.description
    })
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: null,
      bay_number: '',
      bay_type: 'single',
      floor: 1,
      position_x: 0,
      position_y: 0,
      has_sensor: false,
      status: 'available',
      price_per_hour: 50.00,
      description: ''
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      await request.put(`/bays/${form.id}`, form)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/bays', form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    loadBays()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该打位吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/bays/${row.id}`)
    ElMessage.success('删除成功')
    loadBays()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadBays()
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
