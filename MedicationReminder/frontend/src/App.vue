<template>
  <div class="layout-container">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <el-icon :size="24"><MedicineBox /></el-icon>
          <span class="title">用药提醒系统</span>
        </div>
        <div class="user-selector">
          <span class="label">当前用户：</span>
          <el-select v-model="currentUserId" placeholder="请选择用户" @change="onUserChange">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="aside">
          <el-menu
            :default-active="activeMenu"
            router
            class="menu"
            background-color="#001529"
            text-color="#fff"
            active-text-color="#409EFF"
          >
            <el-menu-item index="/today">
              <el-icon><Calendar /></el-icon>
              <span>今日用药</span>
            </el-menu-item>
            <el-menu-item index="/schedules">
              <el-icon><List /></el-icon>
              <span>用药表</span>
            </el-menu-item>
            <el-menu-item index="/inventory">
              <el-icon><Box /></el-icon>
              <span>库存管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main">
          <router-view :userId="currentUserId" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUsers } from '@/api/user'

const route = useRoute()
const users = ref([])
const currentUserId = ref(1)

const activeMenu = computed(() => route.path)

onMounted(async () => {
  try {
    const res = await getUsers()
    users.value = res.data || []
    if (users.value.length > 0 && !currentUserId.value) {
      currentUserId.value = users.value[0].id
    }
  } catch (e) {
    console.error(e)
  }
})

const onUserChange = () => {
  window.dispatchEvent(new CustomEvent('user-change', { detail: { userId: currentUserId.value } }))
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.user-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.label {
  color: #606266;
  font-size: 14px;
}
.aside {
  background-color: #001529;
}
.menu {
  border-right: none;
  height: calc(100vh - 60px);
}
.main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
