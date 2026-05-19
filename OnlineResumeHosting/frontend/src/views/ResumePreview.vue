<template>
  <div class="resume-preview">
    <el-container>
      <el-header class="header">
        <el-button @click="back">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>简历预览</h2>
        <div>
          <el-button @click="generateShortLink">
            <el-icon><Link /></el-icon>
            生成短链
          </el-button>
          <el-button type="primary" @click="exportPdf">
            <el-icon><Download /></el-icon>
            导出PDF
          </el-button>
        </div>
      </el-header>
      <el-main>
        <div id="resume-content" class="resume-content" :class="'template-' + (resume?.templateId || 1)">
          <div class="resume-header" v-if="resume">
            <h1>{{ resume.name || '姓名' }}</h1>
            <div class="contact-info">
              <span v-if="resume.phone"><el-icon><Phone /></el-icon> {{ resume.phone }}</span>
              <span v-if="resume.email"><el-icon><Message /></el-icon> {{ resume.email }}</span>
              <span v-if="resume.location"><el-icon><Location /></el-icon> {{ resume.location }}</span>
            </div>
            <p class="summary" v-if="resume.summary">{{ resume.summary }}</p>
          </div>

          <section class="resume-section" v-if="resume?.educations?.length">
            <h3>教育经历</h3>
            <div v-for="edu in resume.educations" :key="edu.id" class="section-item">
              <div class="item-header">
                <strong>{{ edu.school }}</strong>
                <span class="date">{{ formatDate(edu.startDate) }} - {{ formatDate(edu.endDate) || '至今' }}</span>
              </div>
              <div class="item-subtitle">{{ edu.degree }} · {{ edu.major }}</div>
              <p v-if="edu.description">{{ edu.description }}</p>
            </div>
          </section>

          <section class="resume-section" v-if="resume?.experiences?.length">
            <h3>工作经历</h3>
            <div v-for="exp in resume.experiences" :key="exp.id" class="section-item">
              <div class="item-header">
                <strong>{{ exp.company }}</strong>
                <span class="date">{{ formatDate(exp.startDate) }} - {{ exp.isCurrent ? '至今' : formatDate(exp.endDate) }}</span>
              </div>
              <div class="item-subtitle">{{ exp.position }}</div>
              <p v-if="exp.description">{{ exp.description }}</p>
            </div>
          </section>

          <section class="resume-section" v-if="resume?.projects?.length">
            <h3>项目经验</h3>
            <div v-for="proj in resume.projects" :key="proj.id" class="section-item">
              <div class="item-header">
                <strong>{{ proj.name }}</strong>
                <span class="date">{{ formatDate(proj.startDate) }} - {{ formatDate(proj.endDate) }}</span>
              </div>
              <div class="item-subtitle">{{ proj.role }}</div>
              <p v-if="proj.description">{{ proj.description }}</p>
              <div class="tech-stack" v-if="proj.technologies">
                <el-tag v-for="tech in proj.technologies.split(',')" :key="tech" size="small" style="margin-right: 5px; margin-bottom: 5px;">
                  {{ tech.trim() }}
                </el-tag>
              </div>
            </div>
          </section>

          <section class="resume-section" v-if="resume?.skills?.length">
            <h3>专业技能</h3>
            <div class="skills-grid">
              <div v-for="skill in resume.skills" :key="skill.id" class="skill-item">
                <span class="skill-name">{{ skill.name }}</span>
                <el-progress :percentage="skill.level * 10" :show-text="false" :stroke-width="8" />
              </div>
            </div>
          </section>
        </div>
      </el-main>
    </el-container>

    <el-dialog v-model="shortLinkDialogVisible" title="分享链接" width="500px">
      <el-input v-model="shortLinkUrl" readonly>
        <template #append>
          <el-button @click="copyLink">复制</el-button>
        </template>
      </el-input>
      <p style="margin-top: 10px; color: #909399;">将此链接分享给 HR，对方即可查看您的简历</p>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Link, Phone, Message, Location } from '@element-plus/icons-vue'
import { resumeApi } from '../api'

const route = useRoute()
const router = useRouter()
const resumeId = route.params.id

const resume = ref(null)
const shortLinkDialogVisible = ref(false)
const shortLinkUrl = ref('')

const loadResume = async () => {
  try {
    resume.value = await resumeApi.get(resumeId)
  } catch (e) {
    ElMessage.error('加载简历失败')
  }
}

const exportPdf = async () => {
  try {
    const blob = await resumeApi.exportPdf(resumeId)
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${resume.value.name || '简历'}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    ElMessage.error('导出PDF失败')
  }
}

const generateShortLink = async () => {
  try {
    const data = await resumeApi.createShortLink(resumeId)
    shortLinkUrl.value = `${window.location.origin}/public/${data.shortCode}`
    shortLinkDialogVisible.value = true
  } catch (e) {
    ElMessage.error('生成短链失败')
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(shortLinkUrl.value)
  ElMessage.success('已复制到剪贴板')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

const back = () => {
  router.push('/resumes')
}

onMounted(() => {
  loadResume()
})
</script>

<style scoped>
.resume-preview {
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
.resume-content {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 60px 80px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
.resume-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #409eff;
}
.resume-header h1 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 32px;
}
.contact-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #606266;
  margin-bottom: 15px;
}
.contact-info span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.summary {
  color: #606266;
  line-height: 1.8;
  text-align: left;
  margin: 0;
}
.resume-section {
  margin-bottom: 25px;
}
.resume-section h3 {
  color: #409eff;
  border-left: 4px solid #409eff;
  padding-left: 10px;
  margin-bottom: 15px;
  font-size: 18px;
}
.section-item {
  margin-bottom: 15px;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.item-header strong {
  font-size: 16px;
  color: #303133;
}
.date {
  color: #909399;
  font-size: 14px;
}
.item-subtitle {
  color: #606266;
  margin: 5px 0;
}
.section-item p {
  color: #606266;
  line-height: 1.6;
  margin: 5px 0 0 0;
}
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.skill-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.skill-name {
  font-weight: 500;
  color: #303133;
}

.template-1 .resume-header {
  border-bottom-color: #409eff;
}
.template-1 .resume-section h3 {
  color: #409eff;
  border-left-color: #409eff;
}

.template-2 .resume-header {
  border-bottom-color: #67c23a;
}
.template-2 .resume-section h3 {
  color: #67c23a;
  border-left-color: #67c23a;
}

.template-3 .resume-header {
  border-bottom-color: #909399;
}
.template-3 .resume-section h3 {
  color: #303133;
  border-left-color: #909399;
}

.template-4 .resume-header {
  border-bottom-color: #e6a23c;
}
.template-4 .resume-section h3 {
  color: #e6a23c;
  border-left-color: #e6a23c;
}
</style>
