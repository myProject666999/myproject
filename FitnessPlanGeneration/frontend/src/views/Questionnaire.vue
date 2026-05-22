<template>
  <div class="page-container">
    <el-card class="card-container">
      <template #header>
        <div class="card-header">
          <span>目标问卷</span>
          <span v-if="form.id" class="sub-text">已填写，可修改后重新生成计划</span>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="健身目标" prop="goal">
              <el-radio-group v-model="form.goal">
                <el-radio :label="1">增肌</el-radio>
                <el-radio :label="2">减脂</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="健身水平" prop="fitnessLevel">
              <el-radio-group v-model="form.fitnessLevel">
                <el-radio :label="1">初级</el-radio>
                <el-radio :label="2">中级</el-radio>
                <el-radio :label="3">高级</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="每周训练天数" prop="trainingDaysPerWeek">
              <el-select v-model="form.trainingDaysPerWeek" placeholder="请选择">
                <el-option label="3天" :value="3" />
                <el-option label="4天" :value="4" />
                <el-option label="5天" :value="5" />
                <el-option label="6天" :value="6" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每次训练时长(分钟)" prop="trainingDurationPerSession">
              <el-select v-model="form.trainingDurationPerSession" placeholder="请选择">
                <el-option label="30分钟" :value="30" />
                <el-option label="45分钟" :value="45" />
                <el-option label="60分钟" :value="60" />
                <el-option label="90分钟" :value="90" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">健康状况</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否有伤病" prop="hasInjury">
              <el-radio-group v-model="form.hasInjury">
                <el-radio :label="0">无</el-radio>
                <el-radio :label="1">有</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="伤病详情" v-if="form.hasInjury === 1">
              <el-input v-model="form.injuryDetails" type="textarea" :rows="2" placeholder="请描述伤病情况" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">器材与偏好</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="可用器材">
              <el-select v-model="form.equipmentAvailable" multiple placeholder="请选择可用器材">
                <el-option label="杠铃" value="杠铃" />
                <el-option label="哑铃" value="哑铃" />
                <el-option label="固定器械" value="固定器械" />
                <el-option label="龙门架" value="龙门架" />
                <el-option label="跑步机" value="跑步机" />
                <el-option label="无器材" value="无器材" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="偏好动作">
              <el-input v-model="form.preferredExercises" type="textarea" :rows="2" placeholder="请输入您喜欢的动作（可选）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="不喜欢的动作">
          <el-input v-model="form.dislikedExercises" type="textarea" :rows="2" placeholder="请输入您不喜欢的动作（可选）" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="handleSave">保存问卷</el-button>
          <el-button size="large" @click="handleGenerate" :disabled="!form.id">生成周计划</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { saveQuestionnaire, getQuestionnaire, generateWeeklyPlan } from '@/api'

const router = useRouter()
const formRef = ref(null)
const userInfo = ref({})

const form = reactive({
  id: null,
  userId: null,
  goal: 1,
  fitnessLevel: 1,
  trainingDaysPerWeek: 3,
  trainingDurationPerSession: 45,
  hasInjury: 0,
  injuryDetails: '',
  equipmentAvailable: [],
  preferredExercises: '',
  dislikedExercises: ''
})

const rules = {
  goal: [{ required: true, message: '请选择健身目标', trigger: 'change' }],
  fitnessLevel: [{ required: true, message: '请选择健身水平', trigger: 'change' }],
  trainingDaysPerWeek: [{ required: true, message: '请选择每周训练天数', trigger: 'change' }],
  trainingDurationPerSession: [{ required: true, message: '请选择每次训练时长', trigger: 'change' }]
}

onMounted(() => {
  const userStr = localStorage.getItem('fitness_user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
    form.userId = userInfo.value.id
    loadQuestionnaire()
  }
})

function loadQuestionnaire() {
  getQuestionnaire(userInfo.value.id).then(res => {
    if (res.data) {
      Object.assign(form, res.data)
      if (form.equipmentAvailable && typeof form.equipmentAvailable === 'string') {
        form.equipmentAvailable = form.equipmentAvailable.split(',').filter(Boolean)
      }
    }
  }).catch(() => {})
}

function handleSave() {
  formRef.value.validate(valid => {
    if (valid) {
      const saveData = {
        ...form,
        equipmentAvailable: Array.isArray(form.equipmentAvailable) ? form.equipmentAvailable.join(',') : form.equipmentAvailable
      }
      saveQuestionnaire(saveData).then(res => {
        form.id = res.data.id
        ElMessage.success('保存成功')
      })
    }
  })
}

function handleGenerate() {
  if (!form.id) {
    ElMessage.warning('请先保存问卷')
    return
  }
  ElMessage.info('正在生成周计划...')
  generateWeeklyPlan(form.id).then(res => {
    ElMessage.success('周计划生成成功')
    router.push('/weekly-plan')
  })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-text {
  font-size: 13px;
  color: #909399;
}
</style>
