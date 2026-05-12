<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>处方管理</span>
              <el-button type="primary" @click="openCreateDialog()">
                <el-icon><Plus /></el-icon>新增处方
              </el-button>
            </div>
          </template>
          <div class="search-bar">
            <el-select v-model="selectedPatient" placeholder="选择患者" filterable style="width: 300px" @change="loadPrescriptions">
              <el-option v-for="p in patientList" :key="p.id" :label="p.name + ' - ' + (p.gender === 1 ? '男' : '女') + p.age + '岁'" :value="p.id" />
            </el-select>
          </div>
          <el-table :data="prescriptionList" border stripe v-if="selectedPatient">
            <el-table-column prop="prescriptionNo" label="处方编号" width="180" />
            <el-table-column prop="visitDate" label="就诊日期" width="120" />
            <el-table-column prop="diagnosisText" label="辨证" />
            <el-table-column prop="totalDosage" label="剂数" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
                <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="请选择患者查看处方" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="createDialogVisible" title="开具处方" width="900px" :close-on-click-modal="false">
      <el-form :model="prescriptionForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="患者">
              <el-select v-model="prescriptionForm.prescription.patientId" filterable placeholder="选择患者" style="width: 100%">
                <el-option v-for="p in patientList" :key="p.id" :label="p.name + ' - ' + (p.gender === 1 ? '男' : '女') + p.age + '岁'" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医生">
              <el-input v-model="prescriptionForm.prescription.doctorName" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="方剂模板">
              <el-select v-model="selectedTemplate" placeholder="选择方剂模板（可选）" filterable style="width: 100%" @change="applyTemplate">
                <el-option v-for="t in templateList" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="辨证">
              <el-input v-model="prescriptionForm.prescription.diagnosisText" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="治法">
              <el-input v-model="prescriptionForm.prescription.treatment" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="剂数">
              <el-input-number v-model="prescriptionForm.prescription.totalDosage" :min="1" :max="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用法">
              <el-input v-model="prescriptionForm.prescription.usage" placeholder="如：水煎服，日一剂" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          <span>药材列表</span>
          <el-button type="primary" link @click="checkConflict">
            <el-icon><Warning /></el-icon>检查十八反十九畏
          </el-button>
        </el-divider>

        <div class="herb-add-row">
          <el-autocomplete
            v-model="newHerb.name"
            :fetch-suggestions="queryHerbs"
            placeholder="输入药材名称"
            style="width: 200px"
            @select="handleHerbSelect"
          />
          <el-input-number v-model="newHerb.dosage" :min="0.1" :step="0.5" placeholder="剂量（克）" />
          <el-input v-model="newHerb.note" placeholder="备注（先煎、后下等）" style="width: 150px" />
          <el-button type="primary" @click="addHerb">添加</el-button>
        </div>

        <el-table :data="prescriptionForm.herbs" border stripe size="small">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="herbName" label="药材" width="150" />
          <el-table-column prop="dosage" label="剂量(g)" width="100" />
          <el-table-column prop="note" label="备注" />
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeHerb($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-alert v-if="conflictResult.hasConflict" :title="'检测到' + conflictResult.conflicts.length + '个配伍禁忌'" type="error" show-icon :closable="false" style="margin-top: 15px">
          <template #default>
            <div v-for="(c, idx) in conflictResult.conflicts" :key="idx" style="margin: 5px 0">
              <el-tag :type="c.conflictType === 1 ? 'danger' : 'warning'">{{ c.conflictTypeName }}</el-tag>
              {{ c.description }}
            </div>
          </template>
        </el-alert>
        <el-alert v-else-if="conflictChecked" title="未检测到配伍禁忌" type="success" show-icon :closable="false" style="margin-top: 15px" />
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePrescription">保存处方</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="处方详情" width="800px">
      <div v-if="currentPrescription">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="处方编号">{{ currentPrescription.prescription.prescriptionNo }}</el-descriptions-item>
          <el-descriptions-item label="就诊日期">{{ currentPrescription.prescription.visitDate }}</el-descriptions-item>
          <el-descriptions-item label="医生">{{ currentPrescription.prescription.doctorName }}</el-descriptions-item>
          <el-descriptions-item label="剂数">{{ currentPrescription.prescription.totalDosage }}剂</el-descriptions-item>
          <el-descriptions-item label="辨证" :span="2">{{ currentPrescription.prescription.diagnosisText }}</el-descriptions-item>
          <el-descriptions-item label="治法" :span="2">{{ currentPrescription.prescription.treatment }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <h4>药材组成：</h4>
        <el-table :data="currentPrescription.herbs" border size="small">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="herbName" label="药材" width="150" />
          <el-table-column prop="dosage" label="剂量(g)" width="100" />
          <el-table-column prop="note" label="备注" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { patientApi, herbApi, templateApi, prescriptionApi } from '../api'

const selectedPatient = ref(null)
const patientList = ref([])
const prescriptionList = ref([])
const templateList = ref([])
const herbList = ref([])
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedTemplate = ref(null)
const conflictChecked = ref(false)
const conflictResult = reactive({ hasConflict: false, conflicts: [] })
const currentPrescription = ref(null)

const newHerb = reactive({ name: '', dosage: 10, note: '' })

const prescriptionForm = reactive({
  prescription: {
    patientId: null,
    doctorName: '',
    visitDate: new Date().toISOString().split('T')[0],
    diagnosisText: '',
    treatment: '',
    totalDosage: 7,
    usage: '水煎服，日一剂'
  },
  herbs: []
})

const getStatusText = (status) => {
  const map = { 1: '待煎药', 2: '煎药中', 3: '已完成', 4: '已取药' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'warning', 3: 'success', 4: '' }
  return map[status] || ''
}

const loadPatients = async () => {
  patientList.value = await patientApi.list('') || []
}

const loadTemplates = async () => {
  templateList.value = await templateApi.list('', '', null) || []
}

const loadHerbs = async () => {
  herbList.value = await herbApi.list('', '') || []
}

const loadPrescriptions = async () => {
  if (selectedPatient.value) {
    prescriptionList.value = await prescriptionApi.list(selectedPatient.value) || []
  }
}

const queryHerbs = (queryString, cb) => {
  const results = herbList.value
    .filter(h => h.name.includes(queryString))
    .map(h => ({ value: h.name, ...h }))
  cb(results)
}

const handleHerbSelect = (item) => {
  newHerb.herbId = item.id
}

const addHerb = () => {
  if (!newHerb.name || !newHerb.dosage) {
    ElMessage.warning('请填写药材名称和剂量')
    return
  }
  const herb = herbList.value.find(h => h.name === newHerb.name)
  prescriptionForm.herbs.push({
    herbId: herb ? herb.id : null,
    herbName: newHerb.name,
    dosage: newHerb.dosage,
    note: newHerb.note,
    sortOrder: prescriptionForm.herbs.length + 1
  })
  newHerb.name = ''
  newHerb.dosage = 10
  newHerb.note = ''
  conflictChecked.value = false
}

const removeHerb = (index) => {
  prescriptionForm.herbs.splice(index, 1)
  conflictChecked.value = false
}

const applyTemplate = async (templateId) => {
  if (!templateId) return
  const herbs = await templateApi.getHerbs(templateId) || []
  const herbMap = {}
  for (const h of herbList.value) {
    herbMap[h.id] = h.name
  }
  prescriptionForm.herbs = herbs.map(h => ({
    herbId: h.herbId,
    herbName: herbMap[h.herbId] || '',
    dosage: h.dosage,
    note: h.note,
    sortOrder: h.sortOrder
  }))
  conflictChecked.value = false
}

const checkConflict = async () => {
  if (prescriptionForm.herbs.length < 2) {
    ElMessage.info('至少需要两味药材才能检查配伍')
    return
  }
  const names = prescriptionForm.herbs.map(h => h.herbName)
  conflictResult.value = await prescriptionApi.checkConflict(names)
  conflictChecked.value = true
}

const openCreateDialog = () => {
  prescriptionForm.prescription = {
    patientId: selectedPatient.value,
    doctorName: '',
    visitDate: new Date().toISOString().split('T')[0],
    diagnosisText: '',
    treatment: '',
    totalDosage: 7,
    usage: '水煎服，日一剂'
  }
  prescriptionForm.herbs = []
  selectedTemplate.value = null
  conflictChecked.value = false
  conflictResult.hasConflict = false
  conflictResult.conflicts = []
  createDialogVisible.value = true
}

const savePrescription = async () => {
  if (!prescriptionForm.prescription.patientId) {
    ElMessage.warning('请选择患者')
    return
  }
  if (prescriptionForm.herbs.length === 0) {
    ElMessage.warning('请添加至少一味药材')
    return
  }
  if (!conflictChecked.value) {
    await checkConflict()
  }
  if (conflictResult.hasConflict) {
    const hasEighteen = conflictResult.conflicts.some(c => c.conflictType === 1)
    if (hasEighteen) {
      try {
        await ElMessageBox.confirm('检测到十八反禁忌，确认要继续保存吗？', '配伍禁忌警告', { type: 'warning' })
      } catch {
        return
      }
    }
  }
  await prescriptionApi.save(prescriptionForm)
  ElMessage.success('处方保存成功')
  createDialogVisible.value = false
  loadPrescriptions()
}

const viewDetail = async (row) => {
  currentPrescription.value = await prescriptionApi.get(row.id)
  detailDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该处方吗？', '提示', { type: 'warning' }).then(async () => {
    await prescriptionApi.delete(row.id)
    ElMessage.success('删除成功')
    loadPrescriptions()
  }).catch(() => {})
}

onMounted(() => {
  loadPatients()
  loadTemplates()
  loadHerbs()
})
</script>

<style scoped>
.page-container { padding-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { margin-bottom: 20px; }
.herb-add-row { display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-end; }
</style>
