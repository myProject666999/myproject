<template>
  <div class="vehicles-page">
    <div class="page-header">
      <h2 class="page-title">车辆管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        添加车辆
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="vehicles.length === 0" class="empty-container">
      <el-empty description="暂无车辆信息">
        <el-button type="primary" @click="handleAdd">添加车辆</el-button>
      </el-empty>
    </div>

    <div v-else class="vehicles-list">
      <el-card
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        class="vehicle-card"
        shadow="hover"
      >
        <div class="vehicle-icon">
          <el-icon :size="32"><Van /></el-icon>
        </div>

        <div class="vehicle-info">
          <div class="vehicle-header">
            <span class="plate-number">{{ vehicle.plate_number }}</span>
            <el-tag v-if="vehicle.is_verified" type="success" size="small" effect="light">
              已认证
            </el-tag>
            <el-tag v-else type="warning" size="small" effect="light">
              待认证
            </el-tag>
          </div>
          <div class="vehicle-details">
            <span>{{ vehicle.brand }} {{ vehicle.model }}</span>
            <span class="divider">·</span>
            <span>{{ vehicle.color }}</span>
            <span class="divider">·</span>
            <span>{{ vehicle.seats }}座</span>
          </div>
        </div>

        <div class="vehicle-actions">
          <el-button type="primary" plain size="small" @click="handleEdit(vehicle)">
            编辑
          </el-button>
          <el-button type="danger" plain size="small" @click="handleDelete(vehicle)">
            删除
          </el-button>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑车辆' : '添加车辆'"
      width="480px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="车牌号" prop="plate_number">
          <el-input
            v-model="form.plate_number"
            placeholder="请输入车牌号"
            maxlength="8"
          />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input
            v-model="form.brand"
            placeholder="请输入品牌"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input
            v-model="form.model"
            placeholder="请输入型号"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input
            v-model="form.color"
            placeholder="请输入颜色"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item label="座位数" prop="seats">
          <el-input-number
            v-model="form.seats"
            :min="2"
            :max="9"
            placeholder="请选择座位数"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Van } from '@element-plus/icons-vue'
import { vehicleApi } from '../api'
import type { Vehicle } from '../types'

const vehicles = ref<Vehicle[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editingVehicle = ref<Vehicle | null>(null)

const form = reactive({
  plate_number: '',
  brand: '',
  model: '',
  color: '',
  seats: 5
})

const rules: FormRules = {
  plate_number: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z0-9]{5,6}$/, message: '请输入正确的车牌号', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请输入型号', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请输入颜色', trigger: 'blur' }
  ],
  seats: [
    { required: true, message: '请选择座位数', trigger: 'change' }
  ]
}

async function fetchVehicles() {
  loading.value = true
  try {
    const res = await vehicleApi.getList()
    if (res.code === 0 && res.data) {
      vehicles.value = res.data.list || res.data || []
    }
  } catch (error) {
    console.error('Failed to fetch vehicles:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.plate_number = ''
  form.brand = ''
  form.model = ''
  form.color = ''
  form.seats = 5
  editingVehicle.value = null
  isEdit.value = false
}

function handleAdd() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(vehicle: Vehicle) {
  editingVehicle.value = vehicle
  isEdit.value = true
  form.plate_number = vehicle.plate_number
  form.brand = vehicle.brand
  form.model = vehicle.model
  form.color = vehicle.color
  form.seats = vehicle.seats
  dialogVisible.value = true
}

async function handleDelete(vehicle: Vehicle) {
  try {
    await ElMessageBox.confirm(
      `确定要删除车辆 "${vehicle.plate_number}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await vehicleApi.delete(vehicle.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchVehicles()
    }
  } catch (error) {
    return
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value && editingVehicle.value) {
          const res = await vehicleApi.update(editingVehicle.value.id, { ...form })
          if (res.code === 0) {
            ElMessage.success('保存成功')
            dialogVisible.value = false
            fetchVehicles()
          }
        } else {
          const res = await vehicleApi.create({ ...form })
          if (res.code === 0) {
            ElMessage.success('添加成功')
            dialogVisible.value = false
            fetchVehicles()
          }
        }
      } catch (error) {
        console.error('Failed to submit:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchVehicles()
})
</script>

<style scoped>
.vehicles-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.loading-container {
  margin-bottom: 20px;
}

.empty-container {
  padding: 60px 0;
}

.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vehicle-card {
  border-radius: 12px;
}

.vehicle-card :deep(.el-card__body) {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.vehicle-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #4F6EF7 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.vehicle-info {
  flex: 1;
}

.vehicle-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.plate-number {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.vehicle-details {
  font-size: 13px;
  color: #606266;
}

.divider {
  margin: 0 6px;
  color: #C0C4CC;
}

.vehicle-actions {
  display: flex;
  gap: 8px;
}
</style>
