<template>
  <div>
    <h2 class="mb-20">发布需求</h2>

    <el-card>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="服务类型" prop="service_type">
          <el-select v-model="form.service_type" placeholder="请选择服务类型">
            <el-option label="月嫂服务" value="月嫂服务" />
            <el-option label="育儿嫂服务" value="育儿嫂服务" />
            <el-option label="产后恢复" value="产后恢复" />
          </el-select>
        </el-form-item>

        <el-form-item label="服务时间" prop="start_date">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="预算 (元)">
          <el-input-number v-model="form.budget" :min="0" />
        </el-form-item>

        <el-form-item label="所需技能">
          <el-checkbox-group v-model="selectedSkills">
            <el-checkbox v-for="skill in skills" :key="skill.id" :label="skill.id">
              {{ skill.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="服务要求">
          <el-input
            v-model="form.requirements"
            type="textarea"
            :rows="3"
            placeholder="请描述您的具体要求"
          />
        </el-form-item>

        <el-form-item label="特殊需求">
          <el-input
            v-model="form.special_needs"
            type="textarea"
            :rows="2"
            placeholder="如有特殊需求请说明"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit" :loading="loading">
            提交需求
          </el-button>
          <el-button @click="$router.back()">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createDemand, getSkills } from '@/api'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const skills = ref([])
const selectedSkills = ref([])
const dateRange = ref([])

const form = reactive({
  service_type: '',
  start_date: '',
  end_date: '',
  budget: 0,
  requirements: '',
  special_needs: '',
  skill_ids: ''
})

const rules = {
  service_type: [{ required: true, message: '请选择服务类型', trigger: 'change' }]
}

const loadSkills = async () => {
  try {
    const res = await getSkills()
    skills.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const submit = async () => {
  await formRef.value.validate()

  if (dateRange.value && dateRange.value.length === 2) {
    form.start_date = dateRange.value[0]
    form.end_date = dateRange.value[1]
  }

  form.skill_ids = selectedSkills.value.join(',')

  loading.value = true
  try {
    await createDemand(form)
    ElMessage.success('需求发布成功')
    router.push('/demands')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadSkills)
</script>
