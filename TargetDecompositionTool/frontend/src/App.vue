<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="32" color="#3b82f6"><Aim /></el-icon>
        <span class="title">目标分解工具</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="transparent"
        text-color="#606266"
        active-text-color="#3b82f6"
      >
        <el-menu-item index="/">
          <el-icon><Menu /></el-icon>
          <span>目标树</span>
        </el-menu-item>
        <el-menu-item index="/review">
          <el-icon><Document /></el-icon>
          <span>复盘记录</span>
        </el-menu-item>
        <el-menu-item index="/archive">
          <el-icon><Folder /></el-icon>
          <span>目标归档</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="新增目标">
            <el-button type="primary" circle @click="handleAddRoot">
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="dialogVisible" title="新增根目标" width="500px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="目标标题">
        <el-input v-model="form.title" placeholder="请输入目标标题" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入目标描述" />
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="form.priority">
          <el-option label="高" :value="1" />
          <el-option label="中" :value="2" />
          <el-option label="低" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期">
        <el-date-picker v-model="form.startDate" type="date" placeholder="选择开始日期" />
      </el-form-item>
      <el-form-item label="结束日期">
        <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束日期" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Aim, Menu, Document, Folder, Plus } from '@element-plus/icons-vue'
import { addTarget } from '@/api/target'

const route = useRoute()
const router = useRouter()

const dialogVisible = ref(false)
const form = ref({
  title: '',
  description: '',
  priority: 2,
  startDate: '',
  endDate: ''
})

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles = {
    '/': '目标树',
    '/review': '复盘记录',
    '/archive': '目标归档'
  }
  return titles[route.path] || '目标详情'
})

const handleAddRoot = () => {
  form.value = {
    title: '',
    description: '',
    priority: 2,
    startDate: '',
    endDate: ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.title) {
    ElMessage.warning('请输入目标标题')
    return
  }
  try {
    await addTarget({
      ...form.value,
      parentId: null
    })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    router.go(0)
  } catch (e) {
    ElMessage.error('创建失败')
  }
}
</script>

<style>
.app-container {
  height: 100vh;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.logo {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.logo .title {
  margin-left: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.el-menu {
  border-right: none !important;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
}
</style>
