<template>
  <div class="create-ticket">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><EditPen /></el-icon>
          <span>提交工单</span>
        </div>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="ticket-form"
      >
        <el-form-item label="工单标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请简要描述您的问题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="工单分类" prop="categoryId">
          <el-cascader
            v-model="form.categoryId"
            :options="categoryOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="请选择工单分类"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priorityId">
          <el-radio-group v-model="form.priorityId">
            <el-radio
              v-for="item in priorities"
              :key="item.id"
              :value="item.id"
              :border="true"
            >
              <el-tag :color="item.color" effect="dark" size="small">{{ item.name }}</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="问题描述" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请详细描述您遇到的问题..."
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="form.tags"
            placeholder="多个标签用逗号分隔"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            提交工单
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTicketCategories, getTicketPriorities, createTicket } from '@/api/ticket'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const categoryOptions = ref([])
const priorities = ref([])

const form = reactive({
  title: '',
  categoryId: [],
  priorityId: 3,
  content: '',
  tags: ''
})

const rules = {
  title: [
    { required: true, message: '请输入工单标题', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择工单分类', trigger: 'change', type: 'array' }
  ],
  priorityId: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入问题描述', trigger: 'blur' }
  ]
}

async function loadCategories() {
  const res = await getTicketCategories()
  if (res.code === 0) {
    categoryOptions.value = res.data
  }
}

async function loadPriorities() {
  const res = await getTicketPriorities()
  if (res.code === 0) {
    priorities.value = res.data
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = {
          title: form.title,
          categoryId: form.categoryId[form.categoryId.length - 1],
          priorityId: form.priorityId,
          content: form.content,
          source: 'web',
          channel: 'online',
          tags: form.tags
        }
        const res = await createTicket(data)
        if (res.code === 0) {
          ElMessage.success('工单提交成功')
          router.push(`/ticket/detail/${res.data.id}`)
        } else {
          ElMessage.error(res.message || '提交失败')
        }
      } catch (error) {
        ElMessage.error('提交失败')
      } finally {
        loading.value = false
      }
    }
  })
}

function handleReset() {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadCategories()
  loadPriorities()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ticket-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>
