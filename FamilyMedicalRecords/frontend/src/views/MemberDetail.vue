<template>
  <div class="page-container" v-if="member">
    <el-page-header @back="$router.back()" :content="'返回列表'" style="margin-bottom:16px;">
      <template #content>
        <span style="font-size:20px;font-weight:bold;">{{ member.name }} 的档案</span>
      </template>
    </el-page-header>

    <el-descriptions :column="3" border class="member-desc">
      <el-descriptions-item label="姓名">{{ member.name }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ member.gender === 1 ? '男' : '女' }}</el-descriptions-item>
      <el-descriptions-item label="出生日期">{{ member.birthDate }}</el-descriptions-item>
      <el-descriptions-item label="关系">{{ member.relation }}</el-descriptions-item>
      <el-descriptions-item label="血型">{{ member.bloodType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="身高/体重">
        {{ member.height ? member.height + 'cm' : '-' }} / {{ member.weight ? member.weight + 'kg' : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="身份证号">{{ member.idCardNo || '-' }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ member.phone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ member.address || '-' }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="3">{{ member.remark || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-tabs v-model="activeTab" style="margin-top:20px;">
      <el-tab-pane label="就诊记录" name="visits">
        <div class="card-header" style="margin-top:16px;">
          <span class="card-title" style="font-size:16px;">就诊记录</span>
          <el-button type="primary" size="small" @click="showVisitDialog = true">新增就诊</el-button>
        </div>
        <el-table :data="visits" stripe>
          <el-table-column prop="visitDate" label="就诊日期" width="120" />
          <el-table-column prop="hospital" label="医院" />
          <el-table-column prop="department" label="科室" width="100" />
          <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
          <el-table-column prop="nextVisitDate" label="复诊日期" width="120" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" link @click="goVisitDetail(row)">详情</el-button>
              <el-button type="danger" link @click="deleteVisit(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="过敏史" name="allergies">
        <div class="card-header" style="margin-top:16px;">
          <span class="card-title" style="font-size:16px;">过敏史</span>
          <el-button type="primary" size="small" @click="showAllergyDialog = true">新增过敏</el-button>
        </div>
        <el-table :data="allergies" stripe>
          <el-table-column prop="allergen" label="过敏原" />
          <el-table-column label="严重程度" width="100">
            <template #default="{ row }">
              <el-tag :type="row.severity === 3 ? 'danger' : row.severity === 2 ? 'warning' : 'info'" size="small">
                {{ row.severity === 3 ? '严重' : row.severity === 2 ? '中度' : '轻度' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="symptom" label="症状" show-overflow-tooltip />
          <el-table-column prop="firstOccurAt" label="首次发作" width="120" />
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" link @click="deleteAllergy(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="家族病史" name="histories">
        <div class="card-header" style="margin-top:16px;">
          <span class="card-title" style="font-size:16px;">家族病史</span>
          <el-button type="primary" size="small" @click="showHistoryDialog = true">新增病史</el-button>
        </div>
        <el-table :data="histories" stripe>
          <el-table-column prop="disease" label="疾病名称" />
          <el-table-column prop="relation" label="亲属关系" width="100" />
          <el-table-column prop="relativeName" label="亲属姓名" width="120" />
          <el-table-column prop="onsetAge" label="发病年龄" width="100" />
          <el-table-column label="遗传性" width="80">
            <template #default="{ row }">
              {{ row.isHereditary === 1 ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" link @click="deleteHistory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 就诊弹窗 -->
    <el-dialog v-model="showVisitDialog" title="新增就诊记录" width="600px">
      <el-form :model="visitForm" label-width="90px" :rules="visitRules" ref="visitFormRef">
        <el-form-item label="就诊日期" prop="visitDate">
          <el-date-picker v-model="visitForm.visitDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
        </el-form-item>
        <el-form-item label="医院" prop="hospital">
          <el-input v-model="visitForm.hospital" />
        </el-form-item>
        <el-form-item label="科室" prop="department">
          <el-input v-model="visitForm.department" />
        </el-form-item>
        <el-form-item label="主治医生">
          <el-input v-model="visitForm.doctor" />
        </el-form-item>
        <el-form-item label="主诉">
          <el-input v-model="visitForm.chiefComplaint" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="诊断" prop="diagnosis">
          <el-input v-model="visitForm.diagnosis" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="处方/用药">
          <el-input v-model="visitForm.prescription" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="费用">
          <el-input-number v-model="visitForm.medicalFee" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="复诊日期">
          <el-date-picker v-model="visitForm.nextVisitDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVisitDialog = false">取消</el-button>
        <el-button type="primary" @click="submitVisit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 过敏弹窗 -->
    <el-dialog v-model="showAllergyDialog" title="新增过敏史" width="500px">
      <el-form :model="allergyForm" label-width="90px" :rules="allergyRules">
        <el-form-item label="过敏原" prop="allergen">
          <el-input v-model="allergyForm.allergen" />
        </el-form-item>
        <el-form-item label="严重程度" prop="severity">
          <el-radio-group v-model="allergyForm.severity">
            <el-radio :value="1">轻度</el-radio>
            <el-radio :value="2">中度</el-radio>
            <el-radio :value="3">严重</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="症状">
          <el-input v-model="allergyForm.symptom" />
        </el-form-item>
        <el-form-item label="首次发作">
          <el-date-picker v-model="allergyForm.firstOccurAt" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAllergyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAllergy">确定</el-button>
      </template>
    </el-dialog>

    <!-- 家族病史弹窗 -->
    <el-dialog v-model="showHistoryDialog" title="新增家族病史" width="500px">
      <el-form :model="historyForm" label-width="90px" :rules="historyRules">
        <el-form-item label="疾病名称" prop="disease">
          <el-input v-model="historyForm.disease" />
        </el-form-item>
        <el-form-item label="亲属关系" prop="relation">
          <el-input v-model="historyForm.relation" placeholder="如:祖父、舅舅等" />
        </el-form-item>
        <el-form-item label="亲属姓名">
          <el-input v-model="historyForm.relativeName" />
        </el-form-item>
        <el-form-item label="发病年龄">
          <el-input-number v-model="historyForm.onsetAge" :min="0" :max="150" />
        </el-form-item>
        <el-form-item label="是否遗传性">
          <el-radio-group v-model="historyForm.isHereditary">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showHistoryDialog = false">取消</el-button>
        <el-button type="primary" @click="submitHistory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { memberApi, visitApi, allergyApi, historyApi } from '../api'

const props = defineProps({ id: [String, Number] })
const router = useRouter()
const route = useRoute()
const memberId = () => props.id || route.params.id

const member = ref(null)
const visits = ref([])
const allergies = ref([])
const histories = ref([])
const activeTab = ref('visits')
const showVisitDialog = ref(false)
const showAllergyDialog = ref(false)
const showHistoryDialog = ref(false)

const defaultVisit = () => ({
  visitDate: '', hospital: '', department: '', doctor: '', chiefComplaint: '',
  diagnosis: '', prescription: '', medicalFee: null, nextVisitDate: ''
})
const visitForm = ref(defaultVisit())
const visitRules = {
  visitDate: [{ required: true, message: '请选择就诊日期', trigger: 'change' }],
  hospital: [{ required: true, message: '请输入医院', trigger: 'blur' }],
  department: [{ required: true, message: '请输入科室', trigger: 'blur' }],
  diagnosis: [{ required: true, message: '请输入诊断', trigger: 'blur' }]
}

const defaultAllergy = () => ({ allergen: '', severity: 1, symptom: '', firstOccurAt: '' })
const allergyForm = ref(defaultAllergy())
const allergyRules = {
  allergen: [{ required: true, message: '请输入过敏原', trigger: 'blur' }],
  severity: [{ required: true, message: '请选择严重程度', trigger: 'change' }]
}

const defaultHistory = () => ({ disease: '', relation: '', relativeName: '', onsetAge: null, isHereditary: 0 })
const historyForm = ref(defaultHistory())
const historyRules = {
  disease: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }],
  relation: [{ required: true, message: '请输入亲属关系', trigger: 'blur' }]
}

const loadData = async () => {
  const id = memberId()
  const [m, v, a, h] = await Promise.all([
    memberApi.get(id),
    visitApi.list(id),
    allergyApi.list(id),
    historyApi.list(id)
  ])
  member.value = m.data
  visits.value = v.data || []
  allergies.value = a.data || []
  histories.value = h.data || []
}

const goVisitDetail = row => router.push(`/visits/${row.id}`)

const deleteVisit = row => {
  ElMessageBox.confirm('确定删除该就诊记录？', '提示', { type: 'warning' }).then(async () => {
    await visitApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}
const deleteAllergy = row => {
  ElMessageBox.confirm('确定删除该过敏记录？', '提示', { type: 'warning' }).then(async () => {
    await allergyApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}
const deleteHistory = row => {
  ElMessageBox.confirm('确定删除该家族病史？', '提示', { type: 'warning' }).then(async () => {
    await historyApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

const submitVisit = async () => {
  visitForm.value.memberId = memberId()
  await visitApi.create(visitForm.value)
  ElMessage.success('添加成功')
  showVisitDialog.value = false
  visitForm.value = defaultVisit()
  loadData()
}
const submitAllergy = async () => {
  allergyForm.value.memberId = memberId()
  await allergyApi.create(allergyForm.value)
  ElMessage.success('添加成功')
  showAllergyDialog.value = false
  allergyForm.value = defaultAllergy()
  loadData()
}
const submitHistory = async () => {
  historyForm.value.memberId = memberId()
  await historyApi.create(historyForm.value)
  ElMessage.success('添加成功')
  showHistoryDialog.value = false
  historyForm.value = defaultHistory()
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.member-desc {
  background: white;
  border-radius: 8px;
}
</style>
