<template>
  <div class="template-select">
    <el-container>
      <el-header class="header">
        <el-button @click="back">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>选择模板</h2>
        <div></div>
      </el-header>
      <el-main>
        <el-row :gutter="30">
          <el-col :span="6" v-for="template in templates" :key="template.id">
            <el-card
              class="template-card"
              shadow="hover"
              :class="{ 'is-active': currentTemplateId === template.id }"
              @click="selectTemplate(template.id)"
            >
              <div class="template-preview" :class="'preview-' + template.code">
                <div class="preview-header">
                  <div class="preview-name"></div>
                  <div class="preview-contact"></div>
                </div>
                <div class="preview-section">
                  <div class="preview-title"></div>
                  <div class="preview-content"></div>
                  <div class="preview-content"></div>
                </div>
                <div class="preview-section">
                  <div class="preview-title"></div>
                  <div class="preview-content"></div>
                </div>
              </div>
              <template #header>
                <div class="card-header">
                  <span>{{ template.name }}</span>
                  <el-icon v-if="currentTemplateId === template.id" class="check-icon">
                    <CircleCheckFilled />
                  </el-icon>
                </div>
              </template>
              <p>{{ template.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, CircleCheckFilled } from '@element-plus/icons-vue'
import { templateApi, resumeApi } from '../api'

const route = useRoute()
const router = useRouter()
const resumeId = route.params.id

const templates = ref([])
const currentTemplateId = ref(null)

const loadTemplates = async () => {
  try {
    templates.value = await templateApi.list()
    const resume = await resumeApi.get(resumeId)
    currentTemplateId.value = resume.templateId
  } catch (e) {
    ElMessage.error('加载模板失败')
  }
}

const selectTemplate = async (templateId) => {
  try {
    await resumeApi.update(resumeId, { templateId })
    currentTemplateId.value = templateId
    ElMessage.success('模板切换成功')
    router.push(`/resume/preview/${resumeId}`)
  } catch (e) {
    ElMessage.error('切换模板失败')
  }
}

const back = () => {
  router.push('/resumes')
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.template-select {
  min-height: 100vh;
  background-color: #f5f7fa;
}
.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header h2 {
  margin: 0;
}
.template-card {
  cursor: pointer;
  transition: all 0.3s;
}
.template-card.is-active {
  border: 2px solid #409eff;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.check-icon {
  color: #409eff;
  font-size: 20px;
}
.template-preview {
  height: 200px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  overflow: hidden;
}
.preview-header {
  text-align: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
}
.preview-name {
  height: 16px;
  width: 60px;
  background: #303133;
  margin: 0 auto 8px;
  border-radius: 2px;
}
.preview-contact {
  height: 8px;
  width: 120px;
  background: #dcdfe6;
  margin: 0 auto;
  border-radius: 2px;
}
.preview-section {
  margin-bottom: 12px;
}
.preview-title {
  height: 12px;
  width: 50px;
  margin-bottom: 8px;
  border-radius: 2px;
}
.preview-content {
  height: 8px;
  background: #dcdfe6;
  margin-bottom: 5px;
  border-radius: 2px;
}

.preview-classic .preview-header {
  border-bottom: 2px solid #409eff;
}
.preview-classic .preview-title {
  background: #409eff;
}

.preview-modern .preview-header {
  border-bottom: 2px solid #67c23a;
}
.preview-modern .preview-title {
  background: #67c23a;
}

.preview-minimal .preview-header {
  border-bottom: 2px solid #909399;
}
.preview-minimal .preview-title {
  background: #303133;
}

.preview-creative .preview-header {
  border-bottom: 2px solid #e6a23c;
}
.preview-creative .preview-title {
  background: #e6a23c;
}
</style>
