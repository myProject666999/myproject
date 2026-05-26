<template>
  <div class="verify-page">
    <el-card shadow="never" class="verify-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><Search /></el-icon>
          <span>证书查验</span>
        </div>
      </template>
      <div class="verify-body">
        <p class="tip">
          请输入证书编号或验证码查询证书真伪信息。可通过证书上的编号或手机扫描证书二维码获取。
        </p>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          inline
          class="verify-form"
          @submit.prevent
        >
          <el-form-item prop="code" class="form-item">
            <el-input
              v-model="form.code"
              placeholder="请输入证书编号或验证码"
              size="large"
              clearable
              style="width: 100%; max-width: 460px"
            >
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              :icon="Search"
              @click="handleVerify"
            >
              查询
            </el-button>
            <el-button size="large" @click="resetForm">清空</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card v-if="result" shadow="never" class="result-card">
      <template #header>
        <div class="result-header" :class="{ invalid: result.isValid === 0 }">
          <el-icon :size="22">
            <CircleCheck v-if="result.isValid !== 0" />
            <CircleClose v-else />
          </el-icon>
          <span>
            {{ result.isValid === 0 ? '该证书已被撤销' : '证书信息真实有效' }}
          </span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="证书编号">
          {{ result.certificateNo }}
        </el-descriptions-item>
        <el-descriptions-item label="验证码">
          {{ result.verifyCode }}
        </el-descriptions-item>
        <el-descriptions-item label="学员姓名">
          {{ result.studentName }}
        </el-descriptions-item>
        <el-descriptions-item label="培训班">
          {{ result.trainingName }}
        </el-descriptions-item>
        <el-descriptions-item label="讲师">
          {{ result.instructor }}
        </el-descriptions-item>
        <el-descriptions-item label="总学时">
          {{ result.totalHours }} 小时
        </el-descriptions-item>
        <el-descriptions-item label="培训日期">
          {{ result.startDate }} ~ {{ result.endDate }}
        </el-descriptions-item>
        <el-descriptions-item label="颁发日期">
          {{ result.issueDate }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="result.isValid === 0"
          label="撤销原因"
          :span="2"
        >
          <span style="color: #f56c6c">
            {{ result.revokedReason || '—' }}
            （{{ result.revokedAt }}）
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-empty
      v-else-if="searched && !result"
      description="未查询到该证书信息，请确认输入是否正确"
      :image-size="120"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Document } from '@element-plus/icons-vue'
import { verifyCertificate, getCertificateByNo } from '@/api/certificate'

const formRef = ref(null)
const loading = ref(false)
const result = ref(null)
const searched = ref(false)

const form = reactive({
  code: ''
})

const rules = {
  code: [
    { required: true, message: '请输入证书编号或验证码', trigger: 'blur' }
  ]
}

const handleVerify = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    result.value = null
    searched.value = true
    try {
      const res = await verifyCertificate(form.code).catch(() => null)
      if (res && res.data) {
        result.value = res.data
        return
      }
      const res2 = await getCertificateByNo(form.code).catch(() => null)
      if (res2 && res2.data) {
        result.value = res2.data
      } else {
        ElMessage.warning('未查询到该证书信息')
      }
    } catch (e) {
      ElMessage.error('查询失败')
    } finally {
      loading.value = false
    }
  })
}

const resetForm = () => {
  form.code = ''
  result.value = null
  searched.value = false
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.verify-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.verify-card,
.result-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.verify-body {
  padding: 20px;
}
.tip {
  color: #909399;
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.8;
}
.verify-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.form-item {
  margin-right: 0;
}
.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}
.result-header.invalid {
  color: #f56c6c;
}
</style>
