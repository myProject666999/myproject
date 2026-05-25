<template>
  <div class="home-page">
    <div class="container">
      <div class="page-header">
        <h1>🎯 知识竞赛</h1>
        <p>挑战你的知识极限，成为知识王者！</p>
      </div>

      <el-card class="card-shadow" style="margin-bottom: 20px;">
        <template v-if="!userStore.userId">
          <h2 style="margin-bottom: 20px;">开始游戏</h2>
          <el-form :model="loginForm" label-position="top">
            <el-form-item label="用户名">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名" 
                size="large"
                maxlength="20"
              />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input 
                v-model="loginForm.nickname" 
                placeholder="请输入昵称" 
                size="large"
                maxlength="20"
              />
            </el-form-item>
            <el-button type="primary" size="large" @click="handleLogin" style="width: 100%;">
              进入游戏
            </el-button>
          </el-form>
        </template>

        <template v-else>
          <div class="user-info">
            <el-avatar :size="60" :src="userStore.avatar" />
            <div style="margin-left: 16px;">
              <h2 style="margin: 0;">{{ userStore.nickname }}</h2>
              <p style="color: #6b7280; margin: 4px 0;">@{{ userStore.username }}</p>
            </div>
            <el-button type="danger" link @click="handleLogout">退出</el-button>
          </div>
        </template>
      </el-card>

      <el-card class="card-shadow" v-if="userStore.userId">
        <h2 style="margin-bottom: 20px;">选择分类</h2>
        <el-form :model="quizForm" label-position="top">
          <el-form-item label="题目分类">
            <el-select 
              v-model="quizForm.categoryId" 
              placeholder="全部分类" 
              size="large"
              style="width: 100%;"
              clearable
            >
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.icon + ' ' + cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="题目数量">
            <el-slider
              v-model="quizForm.numQuestions"
              :min="5"
              :max="20"
              :step="1"
              show-input
            />
          </el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            @click="startQuiz" 
            style="width: 100%; font-size: 18px; padding: 16px;"
          >
            🚀 开始答题
          </el-button>
        </el-form>
      </el-card>

      <div class="quick-links">
        <el-button type="primary" plain @click="$router.push('/leaderboard')">
          🏆 排行榜
        </el-button>
        <el-button type="primary" plain @click="$router.push('/history')" v-if="userStore.userId">
          📊 答题记录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore, useQuizStore } from '@/store'
import { getCategories } from '@/api'

const router = useRouter()
const userStore = useUserStore()
const quizStore = useQuizStore()

const loginForm = ref({
  username: '',
  nickname: ''
})

const quizForm = ref({
  categoryId: null,
  numQuestions: 10
})

const categories = ref([])

const handleLogin = async () => {
  if (!loginForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!loginForm.value.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }
  
  try {
    await userStore.login(loginForm.value.username.trim(), loginForm.value.nickname.trim())
    ElMessage.success('登录成功')
  } catch (error) {
    console.error(error)
  }
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
}

const startQuiz = async () => {
  try {
    const params = {
      username: userStore.username,
      nickname: userStore.nickname,
      categoryId: quizForm.value.categoryId || 0,
      numQuestions: quizForm.value.numQuestions
    }
    await quizStore.startQuiz(params)
    router.push('/quiz')
  } catch (error) {
    console.error(error)
  }
}

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.home-page {
  padding-top: 40px;
}

.user-info {
  display: flex;
  align-items: center;
}

.quick-links {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.quick-links .el-button {
  min-width: 140px;
}
</style>
