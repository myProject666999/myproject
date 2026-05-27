<template>
  <div class="convert-page">
    <el-card class="convert-card">
      <template #header>
        <h2>网页转PDF</h2>
      </template>

      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="网页URL" prop="url" :rules="[{ required: true, message: '请输入URL', trigger: 'blur' }]">
          <el-input
            v-model="form.url"
            placeholder="请输入要转换的网页URL，例如: https://example.com"
            size="large"
          />
        </el-form-item>

        <el-form-item label="文档标题">
          <el-input
            v-model="form.title"
            placeholder="可选，默认为网页标题"
          />
        </el-form-item>

        <el-form-item label="样式选择">
          <el-radio-group v-model="form.style">
            <el-radio value="default">默认样式</el-radio>
            <el-radio value="clean">简洁模式</el-radio>
            <el-radio value="dark">深色模式</el-radio>
            <el-radio value="ebook">电子书模式</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分页格式">
          <el-select v-model="form.pagination" style="width: 200px">
            <el-option label="A4" value="A4" />
            <el-option label="A3" value="A3" />
            <el-option label="A5" value="A5" />
            <el-option label="Letter" value="Letter" />
            <el-option label="Legal" value="Legal" />
          </el-select>
        </el-form-item>

        <el-form-item label="生成目录">
          <el-switch v-model="form.enable_toc" />
          <span class="form-tip">自动提取页面标题生成目录</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="converting" @click="handleConvert">
            开始转换
          </el-button>
          <el-button size="large" @click="showBatchDialog = true">
            批量转换
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="currentJob" class="status-card">
      <template #header>
        <h3>转换状态</h3>
      </template>
      <div class="job-status">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务ID">{{ currentJob.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentJob.status)">
              {{ getStatusText(currentJob.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="URL">{{ currentJob.url }}</el-descriptions-item>
          <el-descriptions-item label="页数">{{ currentJob.page_count || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <el-alert
          v-if="currentJob.status === 'failed' && currentJob.error_msg"
          :title="'转换失败: ' + currentJob.error_msg"
          type="error"
          :closable="false"
          style="margin-top: 16px"
        />
        
        <div class="progress-bar" v-if="currentJob.status === 'processing'">
          <el-progress :percentage="progress" :indeterminate="true" />
        </div>

        <div class="job-actions" v-if="currentJob.status === 'completed'">
          <el-button type="success" @click="downloadPDF">
            <el-icon><Download /></el-icon>
            下载PDF
          </el-button>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="showBatchDialog" title="批量转换" width="600px">
      <el-form :model="batchForm" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="batchForm.name" placeholder="可选" />
        </el-form-item>
        <el-form-item label="URL列表">
          <el-input
            v-model="batchUrlsText"
            type="textarea"
            :rows="6"
            placeholder="每行一个URL，例如：
https://example.com/page1
https://example.com/page2
https://example.com/page3"
          />
        </el-form-item>
        <el-form-item label="样式">
          <el-radio-group v-model="batchForm.style">
            <el-radio value="default">默认</el-radio>
            <el-radio value="clean">简洁</el-radio>
            <el-radio value="ebook">电子书</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button type="primary" :loading="batchConverting" @click="handleBatchConvert">
          开始批量转换
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import axios from 'axios'

const formRef = ref()
const form = reactive({
  url: '',
  title: '',
  style: 'default',
  enable_toc: true,
  pagination: 'A4'
})

const currentJob = ref(null)
const converting = ref(false)
const progress = ref(0)
let statusTimer = null

const showBatchDialog = ref(false)
const batchConverting = ref(false)
const batchForm = reactive({
  name: '',
  style: 'default',
  enable_toc: true,
  pagination: 'A4'
})
const batchUrlsText = ref('')

const handleConvert = async () => {
  if (!form.url) {
    ElMessage.warning('请输入网页URL')
    return
  }

  converting.value = true
  currentJob.value = null

  try {
    const res = await axios.post('/api/convert', form)
    currentJob.value = {
      id: res.data.job_id,
      status: res.data.status,
      url: form.url,
      page_count: 0
    }
    
    startPollingStatus(res.data.job_id)
    ElMessage.success('转换任务已开始')
  } catch (err) {
    ElMessage.error('创建任务失败: ' + (err.response?.data?.error || err.message))
    converting.value = false
  }
}

const startPollingStatus = (jobId) => {
  progress.value = 0
  statusTimer = setInterval(async () => {
    try {
      const res = await axios.get(`/api/job/${jobId}`)
      currentJob.value = res.data
      progress.value = Math.min(progress.value + 10, 90)

      if (res.data.status === 'completed') {
        clearInterval(statusTimer)
        converting.value = false
        progress.value = 100
        ElMessage.success('转换完成！')
      } else if (res.data.status === 'failed') {
        clearInterval(statusTimer)
        converting.value = false
        ElMessage.error('转换失败')
      }
    } catch (err) {
      console.error('查询状态失败', err)
    }
  }, 2000)
}

const downloadPDF = () => {
  window.open(`/api/download/${currentJob.value.id}`, '_blank')
}

const handleBatchConvert = async () => {
  const urls = batchUrlsText.value.split('\n').map(u => u.trim()).filter(u => u)
  
  if (urls.length === 0) {
    ElMessage.warning('请输入至少一个URL')
    return
  }

  batchConverting.value = true

  try {
    await axios.post('/api/batch', {
      urls,
      ...batchForm
    })
    ElMessage.success(`批量转换任务已创建，共 ${urls.length} 个URL`)
    showBatchDialog.value = false
    batchUrlsText.value = ''
  } catch (err) {
    ElMessage.error('创建批量任务失败: ' + (err.response?.data?.error || err.message))
  } finally {
    batchConverting.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '等待中',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

onUnmounted(() => {
  if (statusTimer) {
    clearInterval(statusTimer)
  }
})
</script>

<style scoped>
.convert-page {
  max-width: 900px;
  margin: 0 auto;
}

.convert-card {
  margin-bottom: 20px;
}

.convert-card h2 {
  font-size: 20px;
  color: #303133;
}

.status-card h3 {
  font-size: 16px;
  color: #303133;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

.job-status {
  margin-top: 20px;
}

.progress-bar {
  margin: 20px 0;
}

.job-actions {
  margin-top: 20px;
  text-align: center;
}
</style>
