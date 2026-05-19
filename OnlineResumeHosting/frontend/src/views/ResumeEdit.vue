<template>
  <div class="resume-edit">
    <el-container>
      <el-header class="header">
        <el-button @click="back">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>{{ resumeId ? '编辑简历' : '新建简历' }}</h2>
        <el-button type="primary" @click="save">保存</el-button>
      </el-header>
      <el-main>
        <el-form :model="form" label-width="100px">
          <el-card class="section-card">
            <template #header>基本信息</template>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="简历标题">
                  <el-input v-model="form.title" placeholder="请输入简历标题" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="姓名">
                  <el-input v-model="form.name" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-select v-model="form.gender" placeholder="请选择">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电话">
                  <el-input v-model="form.phone" placeholder="请输入电话" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所在城市">
                  <el-input v-model="form.location" placeholder="请输入所在城市" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="个人简介">
                  <el-input v-model="form.summary" type="textarea" :rows="4" placeholder="请输入个人简介" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <el-card class="section-card">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>教育经历</span>
                <el-button size="small" type="primary" @click="addEducation">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
            </template>
            <div v-for="(edu, index) in form.educations" :key="index" class="item-block">
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item label="学校">
                    <el-input v-model="edu.school" placeholder="学校名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="学历">
                    <el-input v-model="edu.degree" placeholder="学历" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="专业">
                    <el-input v-model="edu.major" placeholder="专业" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" style="display: flex; align-items: center;">
                  <el-button type="danger" size="small" @click="removeEducation(index)">删除</el-button>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="开始时间">
                    <el-date-picker v-model="edu.startDate" type="month" value-format="YYYY-MM-DD" placeholder="开始时间" style="width: 100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="结束时间">
                    <el-date-picker v-model="edu.endDate" type="month" value-format="YYYY-MM-DD" placeholder="结束时间" style="width: 100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="描述">
                    <el-input v-model="edu.description" type="textarea" :rows="2" placeholder="描述" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <el-card class="section-card">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>工作经历</span>
                <el-button size="small" type="primary" @click="addExperience">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
            </template>
            <div v-for="(exp, index) in form.experiences" :key="index" class="item-block">
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item label="公司">
                    <el-input v-model="exp.company" placeholder="公司名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="职位">
                    <el-input v-model="exp.position" placeholder="职位" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" style="display: flex; align-items: center;">
                  <el-button type="danger" size="small" @click="removeExperience(index)">删除</el-button>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="开始时间">
                    <el-date-picker v-model="exp.startDate" type="month" value-format="YYYY-MM-DD" placeholder="开始时间" style="width: 100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="结束时间">
                    <el-date-picker v-model="exp.endDate" type="month" value-format="YYYY-MM-DD" placeholder="结束时间" style="width: 100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="在职">
                    <el-switch v-model="exp.isCurrent" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="工作描述">
                    <el-input v-model="exp.description" type="textarea" :rows="3" placeholder="工作描述" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <el-card class="section-card">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>项目经验</span>
                <el-button size="small" type="primary" @click="addProject">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
            </template>
            <div v-for="(proj, index) in form.projects" :key="index" class="item-block">
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item label="项目名称">
                    <el-input v-model="proj.name" placeholder="项目名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="担任角色">
                    <el-input v-model="proj.role" placeholder="担任角色" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" style="display: flex; align-items: center;">
                  <el-button type="danger" size="small" @click="removeProject(index)">删除</el-button>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="开始时间">
                    <el-date-picker v-model="proj.startDate" type="month" value-format="YYYY-MM-DD" placeholder="开始时间" style="width: 100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="结束时间">
                    <el-date-picker v-model="proj.endDate" type="month" value-format="YYYY-MM-DD" placeholder="结束时间" style="width: 100%;" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="项目描述">
                    <el-input v-model="proj.description" type="textarea" :rows="3" placeholder="项目描述" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="技术栈">
                    <el-input v-model="proj.technologies" placeholder="技术栈，用逗号分隔" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <el-card class="section-card">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>专业技能</span>
                <el-button size="small" type="primary" @click="addSkill">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="12" v-for="(skill, index) in form.skills" :key="index">
                <div class="skill-item">
                  <el-input v-model="skill.name" placeholder="技能名称" style="width: 40%;" />
                  <el-slider v-model="skill.level" :min="1" :max="10" style="width: 40%; margin: 0 10px;" />
                  <el-button type="danger" size="small" @click="removeSkill(index)">删除</el-button>
                </div>
              </el-col>
            </el-row>
          </el-card>

          <el-card class="section-card">
            <template #header>其他设置</template>
            <el-form-item label="是否公开">
              <el-switch v-model="form.isPublic" />
            </el-form-item>
          </el-card>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { resumeApi } from '../api'

const route = useRoute()
const router = useRouter()
const resumeId = route.params.id

const form = ref({
  userId: 1,
  templateId: 1,
  title: '',
  name: '',
  gender: '',
  phone: '',
  email: '',
  location: '',
  summary: '',
  isPublic: true,
  educations: [],
  experiences: [],
  projects: [],
  skills: []
})

const addEducation = () => {
  form.value.educations.push({
    school: '',
    degree: '',
    major: '',
    startDate: '',
    endDate: '',
    description: '',
    sortOrder: form.value.educations.length
  })
}

const removeEducation = (index) => {
  form.value.educations.splice(index, 1)
}

const addExperience = () => {
  form.value.experiences.push({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    sortOrder: form.value.experiences.length
  })
}

const removeExperience = (index) => {
  form.value.experiences.splice(index, 1)
}

const addProject = () => {
  form.value.projects.push({
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    technologies: '',
    sortOrder: form.value.projects.length
  })
}

const removeProject = (index) => {
  form.value.projects.splice(index, 1)
}

const addSkill = () => {
  form.value.skills.push({
    name: '',
    level: 5,
    category: '',
    sortOrder: form.value.skills.length
  })
}

const removeSkill = (index) => {
  form.value.skills.splice(index, 1)
}

const loadResume = async () => {
  try {
    const data = await resumeApi.get(resumeId)
    form.value = { ...form.value, ...data }
  } catch (e) {
    ElMessage.error('加载简历失败')
  }
}

const save = async () => {
  try {
    if (resumeId) {
      await resumeApi.update(resumeId, form.value)
      ElMessage.success('更新成功')
    } else {
      await resumeApi.create(form.value)
      ElMessage.success('创建成功')
    }
    router.push('/resumes')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const back = () => {
  router.push('/resumes')
}

onMounted(() => {
  if (resumeId) {
    loadResume()
  }
})
</script>

<style scoped>
.resume-edit {
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
.section-card {
  margin-bottom: 20px;
}
.item-block {
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 15px;
}
.skill-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
