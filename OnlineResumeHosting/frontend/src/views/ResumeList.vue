<template>
  <div class="resume-list">
    <el-container>
      <el-header class="header">
        <h1>在线简历托管</h1>
        <el-button type="primary" @click="createResume">
          <el-icon><Plus /></el-icon>
          新建简历
        </el-button>
      </el-header>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="6" v-for="resume in resumes" :key="resume.id">
            <el-card class="resume-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>{{ resume.title }}</span>
                  <el-tag :type="resume.isPublic ? 'success' : 'info'">
                    {{ resume.isPublic ? '公开' : '私有' }}
                  </el-tag>
                </div>
              </template>
              <div class="card-content">
                <p><strong>姓名：</strong>{{ resume.name || '-' }}</p>
                <p><strong>浏览次数：</strong>{{ resume.viewCount }}</p>
                <p><strong>更新时间：</strong>{{ formatDate(resume.updatedAt) }}</p>
              </div>
              <template #footer>
                <div class="card-footer">
                  <el-button size="small" @click="editResume(resume.id)">编辑</el-button>
                  <el-button size="small" @click="previewResume(resume.id)">预览</el-button>
                  <el-button size="small" type="primary" @click="selectTemplate(resume.id)">模板</el-button>
                  <el-button size="small" type="success" @click="viewLogs(resume.id)">统计</el-button>
                  <el-button size="small" type="danger" @click="deleteResume(resume.id)">删除</el-button>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-if="resumes.length === 0" description="暂无简历，点击上方按钮创建" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { resumeApi } from '../api'

const router = useRouter()
const resumes = ref([])

const loadResumes = async () => {
  try {
    resumes.value = await resumeApi.list()
  } catch (e) {
    ElMessage.error('加载简历列表失败')
  }
}

const createResume = () => {
  router.push('/resume/edit')
}

const editResume = (id) => {
  router.push(`/resume/edit/${id}`)
}

const previewResume = (id) => {
  router.push(`/resume/preview/${id}`)
}

const selectTemplate = (id) => {
  router.push(`/resume/${id}/templates`)
}

const viewLogs = (id) => {
  router.push(`/resume/${id}/logs`)
}

const deleteResume = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这份简历吗？', '提示', {
      type: 'warning'
    })
    await resumeApi.delete(id)
    ElMessage.success('删除成功')
    loadResumes()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadResumes()
})
</script>

<style scoped>
.resume-list {
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
.header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}
.resume-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-content p {
  margin: 8px 0;
  color: #606266;
}
.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>
