<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>患者四诊信息录入</span>
        </div>
      </template>

      <div class="search-bar">
        <el-select v-model="selectedPatient" placeholder="选择患者" filterable style="width: 400px" @change="loadDiagnosisList">
          <el-option v-for="p in patientList" :key="p.id" :label="p.name + ' - ' + (p.gender === 1 ? '男' : '女') + p.age + '岁'" :value="p.id" />
        </el-select>
        <el-button type="primary" @click="openDialog()" :disabled="!selectedPatient">
          <el-icon><Plus /></el-icon>新增四诊记录
        </el-button>
      </div>

      <el-table :data="diagnosisList" border stripe v-if="selectedPatient">
        <el-table-column prop="visitDate" label="就诊日期" width="120" />
        <el-table-column prop="chiefComplaint" label="主诉" />
        <el-table-column prop="tongueCondition" label="舌象" width="150" />
        <el-table-column prop="pulseCondition" label="脉象" width="150" />
        <el-table-column prop="diagnosis" label="辨证" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="请选择患者查看四诊记录" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑四诊记录' : '新增四诊记录'" width="700px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="就诊日期">
          <el-date-picker v-model="formData.visitDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="主诉">
          <el-input v-model="formData.chiefComplaint" type="textarea" :rows="2" placeholder="主要症状和持续时间" />
        </el-form-item>
        <el-form-item label="现病史">
          <el-input v-model="formData.presentHistory" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="既往史">
          <el-input v-model="formData.pastHistory" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="舌象">
              <el-select v-model="formData.tongueCondition" placeholder="选择或输入舌象" filterable allow-create style="width: 100%">
                <el-option label="舌红苔黄" value="舌红苔黄" />
                <el-option label="舌淡苔白" value="舌淡苔白" />
                <el-option label="舌紫暗有瘀斑" value="舌紫暗有瘀斑" />
                <el-option label="舌红少苔" value="舌红少苔" />
                <el-option label="舌胖大有齿痕" value="舌胖大有齿痕" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="脉象">
              <el-select v-model="formData.pulseCondition" placeholder="选择或输入脉象" filterable allow-create style="width: 100%">
                <el-option label="浮" value="浮" />
                <el-option label="沉" value="沉" />
                <el-option label="迟" value="迟" />
                <el-option label="数" value="数" />
                <el-option label="虚" value="虚" />
                <el-option label="实" value="实" />
                <el-option label="滑" value="滑" />
                <el-option label="涩" value="涩" />
                <el-option label="弦" value="弦" />
                <el-option label="细" value="细" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="辨证结论">
          <el-input v-model="formData.diagnosis" type="textarea" :rows="3" placeholder="如：脾胃气虚证、肝郁气滞证等" />
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
import { patientApi, diagnosisApi } from '../api'

const selectedPatient = ref(null)
const patientList = ref([])
const diagnosisList = ref([])
const dialogVisible = ref(false)
const formData = ref({
  id: null,
  patientId: null,
  visitDate: new Date().toISOString().split('T')[0],
  chiefComplaint: '',
  presentHistory: '',
  pastHistory: '',
  tongueCondition: '',
  pulseCondition: '',
  diagnosis: ''
})

const loadPatients = async () => {
  patientList.value = await patientApi.list('') || []
}

const loadDiagnosisList = async () => {
  if (selectedPatient.value) {
    diagnosisList.value = await diagnosisApi.list(selectedPatient.value) || []
  }
}

const openDialog = (row = null) => {
  if (row) {
    formData.value = { ...row }
  } else {
    formData.value = {
      id: null,
      patientId: selectedPatient.value,
      visitDate: new Date().toISOString().split('T')[0],
      chiefComplaint: '',
      presentHistory: '',
      pastHistory: '',
      tongueCondition: '',
      pulseCondition: '',
      diagnosis: ''
    }
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  formData.value.patientId = selectedPatient.value
  if (formData.value.id) {
    await diagnosisApi.update(formData.value)
    ElMessage.success('更新成功')
  } else {
    await diagnosisApi.save(formData.value)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadDiagnosisList()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该四诊记录吗？', '提示', { type: 'warning' }).then(async () => {
    await diagnosisApi.delete(row.id)
    ElMessage.success('删除成功')
    loadDiagnosisList()
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
