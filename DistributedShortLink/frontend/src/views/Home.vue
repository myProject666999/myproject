<template>
  <div class="home-container">
    <el-card class="home-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Link /></el-icon>
          <span>生成短链</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="长链接" prop="url">
          <el-input v-model="form.url" placeholder="请输入要缩短的URL" clearable />
        </el-form-item>
        <el-form-item label="自定义编码" prop="customCode">
          <el-input v-model="form.customCode" placeholder="可选，留空则自动生成" clearable />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireAt">
          <el-date-picker
            v-model="form.expireAt"
            type="datetime"
            placeholder="可选，留空则永不过期"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            生成短链
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider v-if="result" />

      <div v-if="result" class="result-box">
        <el-alert title="短链已生成" type="success" :closable="false" show-icon>
          <template #default>
            <div class="result-link">
              <el-link :href="shortUrl" type="primary" target="_blank" :underline="false">
                {{ shortUrl }}
              </el-link>
              <el-button type="primary" link @click="handleCopy">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const formRef = ref(null)
const loading = ref(false)
const result = ref(null)

const form = reactive({
  url: '',
  customCode: '',
  expireAt: ''
})

const rules = {
  url: [
    { required: true, message: '请输入长链接', trigger: 'blur' },
    { type: 'url', message: '请输入合法的URL', trigger: 'blur' }
  ]
}

const shortUrl = computed(() => {
  if (!result.value) return ''
  return result.value.shortLink || ''
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const payload = {
        url: form.url
      }
      if (form.customCode) payload.customCode = form.customCode
      if (form.expireAt) payload.expireAt = form.expireAt
      const res = await request.post('/short/create', payload)
      result.value = res.data
      ElMessage.success('短链生成成功')
    } catch (e) {
    } finally {
      loading.value = false
    }
  })
}

const handleReset = () => {
  if (formRef.value) formRef.value.resetFields()
  result.value = null
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value)
    ElMessage.success('已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}
.home-card {
  width: 100%;
  max-width: 600px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.result-box {
  margin-top: 16px;
}
.result-link {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  word-break: break-all;
}
</style>
