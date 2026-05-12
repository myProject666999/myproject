<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>复诊与疗效追踪</span>
        </div>
      </template>

      <div class="search-bar">
        <el-select v-model="selectedPatient" placeholder="选择患者查看复诊记录" filterable style="width: 400px" @change="loadData">
          <el-option v-for="p in patientList" :key="p.id" :label="p.name + ' - ' + (p.gender === 1 ? '男' : '女') + p.age + '岁'" :value="p.id" />
        </el-select>
        <el-button type="primary" @click="openDialog()" :disabled="!selectedPatient">
          <el-icon><Plus /></el-icon>新增复诊记录
        </el-button>
      </div>

      <el-timeline v-if="followUpList.length">
        <el-timeline-item v-for="(item, index) in followUpList" :key="item.id" :timestamp="item.visitDate" placement="top">
          <el-card shadow="hover">
            <h4>第{{ followUpList.length - index }}次复诊</h4>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="服药后情况">{{ item.condition }}</el-descriptions-item>
              <el-descriptions-item label="疗效评估">
                <el-tag :type="getEffectType(item.curativeEffect)">{{ item.curativeEffect || '未评估' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="调整内容">{{ item.adjustment || '无' }}</el-descriptions-item>
            </el-descriptions>
            <div style="margin-top: 15px; text-align: right">
              <el-button type="primary" link @click="openDialog(item)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(item)">删除</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="请选择患者查看复诊记录" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑复诊' : '新增复诊'" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="复诊日期">
          <el-date-picker v-model="formData.visitDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="服药后情况">
          <el-input v-model="formData.condition" type="textarea" :rows="3" placeholder="描述患者服药后的病情变化" />
        </el-form-item>
        <el-form-item label="疗效评估">
          <el-select v-model="formData.curativeEffect" placeholder="选择疗效评估" style="width: 100%">
            <el-option label="痊愈" value="痊愈" />
            <el-option label="显效" value="显效" />
            <el-option label="有效" value="有效" />
            <el-option label="无效" value="无效" />
            <el-option label="加重" value="加重" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整内容">
          <el-input v-model="formData.adjustment" type="textarea" :rows="3" placeholder="本次复诊的方药调整或医嘱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { patientApi, followupApi } from '../api'

const selectedPatient = ref(null)
const patientList = ref([])
const followUpList = ref([])
const dialogVisible = ref(false)
const formData = ref({
  id: null,
  patientId: null,
  lastPrescriptionId: null,
  visitDate: new Date().toISOString().split('T')[0],
  condition: '',
  curativeEffect: '',
  adjustment: ''
})

const getEffectType = (effect) => {
  const map = { '痊愈': 'success', '显效': 'success', '有效': 'primary', '无效': 'info', '加重': 'danger' }
  return map[effect] || ''
}

const loadPatients = async () => {
  patientList.value = await patientApi.list('') || []
}

const loadData = async () => {
  if (selectedPatient.value) {
    followUpList.value = await followupApi.list(selectedPatient.value) || []
  }
}

const openDialog = (row = null) => {
  if (row) {
    formData.value = { ...row }
  } else {
    formData.value = {
      id: null,
      patientId: selectedPatient.value,
      lastPrescriptionId: null,
      visitDate: new Date().toISOString().split('T')[0],
      condition: '',
      curativeEffect: '',
      adjustment: ''
    }
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  formData.value.patientId = selectedPatient.value
  if (formData.value.id) {
    await followupApi.update(formData.value)
    ElMessage.success('更新成功')
  } else {
    await followupApi.save(formData.value)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该复诊记录吗？', '提示', { type: 'warning' }).then(async () => {
    await followupApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadPatients()
})
</script>

<style scoped>
.page-container { padding-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { margin-bottom: 20px; display: flex; gap: 10px; }
</style>
